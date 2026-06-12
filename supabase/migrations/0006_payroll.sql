-- ============================================================================
-- 0006 — Payroll, Allowances & KPI (Part IV of the manual)
-- Implements docs/02-data-model.md §6 and docs/modules/05-payroll-allowances-kpi.md
-- Policies enforced as DB constraints:
--   1  — no payroll item for a non-active employee (trigger)
--   2  — cycle status follows the mandatory calendar (fixed-date SLAs, 0010 seed)
--   4  — every adjustment backed by a document (supporting_doc_path NOT NULL)
--   6  — no payroll item without verified bank account (trigger)
--   7  — every adjustment approved (approval_request_id NOT NULL)
--   12 — cost reports follow employee_project_allocations
-- ============================================================================

CREATE TYPE payroll_cycle_status AS ENUM
  ('new_hires', 'validation', 'register_updated', 'allocations_review',
   'adjustments', 'processing', 'submitted_to_finance', 'paid', 'cost_reported');
CREATE TYPE payroll_item_status  AS ENUM ('draft', 'validated', 'processed', 'paid');
CREATE TYPE adjustment_type      AS ENUM
  ('medical_deduction', 'insurance_update', 'advance', 'loan_deduction',
   'reimbursement', 'correction');
CREATE TYPE advance_loan_type    AS ENUM ('advance', 'loan');
CREATE TYPE cycle_item_status    AS ENUM ('draft', 'verified', 'submitted', 'paid');
CREATE TYPE cost_cycle_type      AS ENUM ('payroll', 'allowance', 'kpi');

-- ----------------------------------------------------------------------------
-- payroll_cycles — monthly cycle on the mandatory calendar (Policy 2):
-- new_hires (18) → validation (18–19) → register_updated (18–19) →
-- allocations_review (20–23) → adjustments (20–23) → processing (20–23) →
-- submitted_to_finance (≤25) → paid (28–EOM) → cost_reported (≤10 next month)
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_cycles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  month        date NOT NULL,          -- first day of the payroll month
  status       payroll_cycle_status NOT NULL DEFAULT 'new_hires',
  deadline_at  timestamptz,            -- deadline of the current stage (fed by sla_definitions fixed dates)
  locked       boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, month)
);

COMMENT ON TABLE payroll_cycles IS
  'Monthly payroll cycle on the mandatory calendar 18/19/23/25/28/10 (docs/02 §6, Policy 2). Delays need documented justification + approval (Policy 15).';
CREATE INDEX idx_payroll_cycles_tenant_status ON payroll_cycles (tenant_id, status);

-- ----------------------------------------------------------------------------
-- payroll_items — one row per employee per cycle
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  cycle_id          uuid NOT NULL REFERENCES payroll_cycles(id),
  employee_id       uuid NOT NULL REFERENCES employees(id),
  gross             numeric(12, 2),
  net               numeric(12, 2),
  taxes             numeric(12, 2),
  social_insurance  numeric(12, 2),
  components        jsonb NOT NULL DEFAULT '{}'::jsonb,  -- detailed breakdown
  bank_snapshot     jsonb,             -- snapshot of the verified bank account at payment time
  status            payroll_item_status NOT NULL DEFAULT 'draft',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  archived_at       timestamptz,
  UNIQUE (tenant_id, cycle_id, employee_id)
);

COMMENT ON TABLE payroll_items IS
  'Payroll register lines (docs/02 §6). DB-enforced: employee must be active (Policy 1) and bank_verified (Policy 6) — see trigger.';
CREATE INDEX idx_payroll_items_cycle ON payroll_items (tenant_id, cycle_id);
CREATE INDEX idx_payroll_items_employee ON payroll_items (tenant_id, employee_id);

-- Policy 1 + Policy 6 as a hard DB constraint, not a UI warning (module 01).
CREATE OR REPLACE FUNCTION app.tg_payroll_item_guard() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_status        employee_status;
  v_bank_verified boolean;
BEGIN
  SELECT e.status, COALESCE(c.bank_verified, false)
    INTO v_status, v_bank_verified
  FROM employees e
  LEFT JOIN employee_compensation c ON c.employee_id = e.id
  WHERE e.id = NEW.employee_id;

  IF v_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Policy 1: employee % is not active (status=%) — cannot enter payroll', NEW.employee_id, v_status
      USING ERRCODE = 'check_violation';
  END IF;

  IF NOT v_bank_verified THEN
    RAISE EXCEPTION 'Policy 6: employee % has no verified bank account — cannot enter payroll', NEW.employee_id
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_payroll_item_guard
  BEFORE INSERT ON payroll_items
  FOR EACH ROW EXECUTE FUNCTION app.tg_payroll_item_guard();

-- ----------------------------------------------------------------------------
-- payroll_adjustments — Policies 4, 7, 11: document + approval are NOT NULL
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_adjustments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  cycle_id             uuid NOT NULL REFERENCES payroll_cycles(id),
  employee_id          uuid NOT NULL REFERENCES employees(id),
  type                 adjustment_type NOT NULL,
  amount               numeric(12, 2) NOT NULL,
  supporting_doc_path  text NOT NULL,   -- Policy 4: no calculation without a document
  approval_request_id  uuid NOT NULL,   -- Policy 7: no adjustment without approval (FK added in 0008)
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  archived_at          timestamptz
);

COMMENT ON TABLE payroll_adjustments IS
  'Payroll adjustments (docs/02 §6). supporting_doc_path NOT NULL (Policy 4); approval_request_id NOT NULL (Policy 7). Post-processing corrections also pass through here (Policy 11).';
CREATE INDEX idx_payroll_adjustments_cycle ON payroll_adjustments (tenant_id, cycle_id);

-- ----------------------------------------------------------------------------
-- advances_loans — feeds cycle deductions; settled at offboarding
-- ----------------------------------------------------------------------------
CREATE TABLE advances_loans (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  employee_id          uuid NOT NULL REFERENCES employees(id),
  type                 advance_loan_type NOT NULL,
  principal            numeric(12, 2) NOT NULL,
  installment          numeric(12, 2),
  balance              numeric(12, 2) NOT NULL,
  approval_request_id  uuid,            -- FK added in 0008
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  archived_at          timestamptz
);

COMMENT ON TABLE advances_loans IS
  'Advances & loans (docs/02 §6) — feeds monthly deductions and final settlement (advance_clearance item).';
CREATE INDEX idx_advances_loans_employee ON advances_loans (tenant_id, employee_id);

-- ----------------------------------------------------------------------------
-- allowance_cycles + allowance_items — monthly site allowances
-- (request 10–15 → preparation 10–15 → verification 15–17 → handover ≤17 →
--  payment 20–25 → cost report ≤10)
-- ----------------------------------------------------------------------------
CREATE TABLE allowance_cycles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  month        date NOT NULL,
  status       cycle_item_status NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, month)
);
COMMENT ON TABLE allowance_cycles IS
  'Monthly allowance cycle on calendar 10–15/15–17/≤17/20–25/≤10 (docs/02 §6, docs/04 Part IV).';

CREATE TABLE allowance_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  cycle_id             uuid NOT NULL REFERENCES allowance_cycles(id),
  project_id           uuid NOT NULL REFERENCES projects(id),
  employee_id          uuid NOT NULL REFERENCES employees(id),
  allowance_type       text NOT NULL,
  amount               numeric(12, 2) NOT NULL,
  eligibility_checked  boolean NOT NULL DEFAULT false,
  status               cycle_item_status NOT NULL DEFAULT 'draft',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  archived_at          timestamptz
);
COMMENT ON TABLE allowance_items IS
  'Per-project allowance lines requested by site management (docs/02 §6).';
CREATE INDEX idx_allowance_items_cycle ON allowance_items (tenant_id, cycle_id);
CREATE INDEX idx_allowance_items_project ON allowance_items (tenant_id, project_id);

-- ----------------------------------------------------------------------------
-- kpi_cycles + kpi_evaluations + kpi_items — quarterly KPI bonuses
-- ----------------------------------------------------------------------------
CREATE TABLE kpi_cycles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  quarter      text NOT NULL,           -- e.g. 2026-Q2
  status       cycle_item_status NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, quarter)
);
COMMENT ON TABLE kpi_cycles IS 'Quarterly KPI bonus cycle (docs/02 §6).';

CREATE TABLE kpi_evaluations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  cycle_id     uuid NOT NULL REFERENCES kpi_cycles(id),
  employee_id  uuid NOT NULL REFERENCES employees(id),
  scores       jsonb NOT NULL DEFAULT '{}'::jsonb,  -- from PMO
  approved     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, cycle_id, employee_id)
);
COMMENT ON TABLE kpi_evaluations IS 'PMO quarterly evaluations feeding KPI bonus computation (docs/02 §6).';

CREATE TABLE kpi_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  cycle_id     uuid NOT NULL REFERENCES kpi_cycles(id),
  employee_id  uuid NOT NULL REFERENCES employees(id),
  amount       numeric(12, 2),
  status       cycle_item_status NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz
);
COMMENT ON TABLE kpi_items IS 'KPI bonus lines: computation → verification → finance handover → payment → cost report (docs/02 §6).';
CREATE INDEX idx_kpi_items_cycle ON kpi_items (tenant_id, cycle_id);

-- ----------------------------------------------------------------------------
-- cost_reports — generated per project, distribution follows
-- employee_project_allocations (Policy 12)
-- ----------------------------------------------------------------------------
CREATE TABLE cost_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  cycle_type   cost_cycle_type NOT NULL,
  cycle_id     uuid NOT NULL,           -- payroll_cycles / allowance_cycles / kpi_cycles id (polymorphic — no FK)
  project_id   uuid NOT NULL REFERENCES projects(id),
  breakdown    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz
);
COMMENT ON TABLE cost_reports IS
  'Generated per-project cost reports for payroll/allowance/KPI cycles, distributed via employee_project_allocations (Policy 12), due ≤ day 10 next month.';
CREATE INDEX idx_cost_reports_project ON cost_reports (tenant_id, project_id);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['payroll_cycles','payroll_items','payroll_adjustments','advances_loans',
                           'allowance_cycles','allowance_items','kpi_cycles','kpi_evaluations',
                           'kpi_items','cost_reports'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;
