-- ============================================================================
-- 0005 — Onboarding (Part II) & Offboarding (Part III)
-- Implements docs/02-data-model.md §4 + §5,
-- docs/modules/03-onboarding.md, docs/modules/04-offboarding.md
-- ============================================================================

CREATE TYPE onboarding_status     AS ENUM ('open', 'in_progress', 'activated', 'cancelled');
CREATE TYPE task_status           AS ENUM ('pending', 'in_progress', 'done', 'blocked', 'skipped');
CREATE TYPE hse_record_type       AS ENUM ('medical_exam', 'safety_course');
CREATE TYPE hse_result            AS ENUM ('fit', 'unfit', 'pass', 'fail');
CREATE TYPE offboarding_trigger   AS ENUM ('resignation', 'contract_expiration', 'termination', 'end_of_project');
CREATE TYPE offboarding_status    AS ENUM ('open', 'in_progress', 'closed', 'cancelled');
CREATE TYPE clearance_department  AS ENUM ('it', 'operations_admin', 'finance', 'direct_manager');
CREATE TYPE settlement_status     AS ENUM ('draft', 'pending_approval', 'approved', 'paid');

-- ----------------------------------------------------------------------------
-- onboarding_cases — opened from an accepted job offer (or direct entry)
-- ----------------------------------------------------------------------------
CREATE TABLE onboarding_cases (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  job_offer_id  uuid REFERENCES job_offers(id),     -- nullable: direct entry without recruitment
  employee_id   uuid REFERENCES employees(id),      -- created at Stage 2 (Hiring Notification & Record)
  hiring_email  jsonb NOT NULL DEFAULT '{}'::jsonb, -- the 14 mandatory fields of the manual's Hiring Email
  joining_date  date,
  priority      priority_level NOT NULL DEFAULT 'P1',
  status        onboarding_status NOT NULL DEFAULT 'open',
  activated_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  archived_at   timestamptz
);

COMMENT ON TABLE onboarding_cases IS
  'Onboarding case, manual Part II Stages 1–9 (docs/02 §4). hiring_email holds the 14 mandatory fields (name ar/en, national id, mobile, title, project code/name, manager, location, net salary, allowances, SI number, contract signing date, joining date).';
CREATE INDEX idx_onboarding_cases_tenant_status ON onboarding_cases (tenant_id, status);

-- ----------------------------------------------------------------------------
-- onboarding_tasks — generated from the 9-stage template
-- ----------------------------------------------------------------------------
CREATE TABLE onboarding_tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  case_id         uuid NOT NULL REFERENCES onboarding_cases(id),
  stage           smallint NOT NULL CHECK (stage BETWEEN 1 AND 9),
  task_key        text NOT NULL,    -- contract_signed, si_form1, nda, handbook_ack, bank_letter, erp_profile, corporate_email, laptop, ppe, uniform, access_card, medical_exam, course_firefighting, course_first_aid, hr_orientation, hse_orientation, ops_induction, ...
  owner_role      text NOT NULL,    -- personnel / it / hse / operations_admin / talent_acquisition
  due_date        date,             -- from the stage SLA (docs/04)
  status          task_status NOT NULL DEFAULT 'pending',
  completed_by    uuid,
  completed_at    timestamptz,
  attachment_path text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  archived_at     timestamptz
);

COMMENT ON TABLE onboarding_tasks IS
  'Checklist tasks generated from the 9-stage onboarding template (docs/02 §4); due_date driven by stage SLA (docs/04).';
CREATE INDEX idx_onboarding_tasks_case ON onboarding_tasks (tenant_id, case_id, stage);

-- ----------------------------------------------------------------------------
-- hse_records — medical exams & safety courses (Onboarding Stage 7).
-- Referenced (via to_regclass guard) by app.fn_can_activate in 0003.
-- expiry_date feeds the 60/30/7-day proactive alerts.
-- ----------------------------------------------------------------------------
CREATE TABLE hse_records (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  employee_id      uuid NOT NULL REFERENCES employees(id),
  type             hse_record_type NOT NULL,
  course_key       text,             -- course_firefighting / course_first_aid / course_electrical / course_risk_assessment / course_heights
  result           hse_result,
  certificate_path text,
  issued_at        date,
  expiry_date      date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid,
  archived_at      timestamptz,
  CHECK (
    (type = 'medical_exam'  AND (result IS NULL OR result IN ('fit', 'unfit'))) OR
    (type = 'safety_course' AND (result IS NULL OR result IN ('pass', 'fail')))
  )
);

COMMENT ON TABLE hse_records IS
  'Medical exams & safety courses (docs/02 §4, Onboarding Stage 7). Feeds fn_can_activate conditions 3+4 and the 60/30/7 expiry alerts.';
CREATE INDEX idx_hse_records_tenant_employee ON hse_records (tenant_id, employee_id, type);

-- ----------------------------------------------------------------------------
-- offboarding_cases — manual Part III Stages 1–6
-- ----------------------------------------------------------------------------
CREATE TABLE offboarding_cases (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  employee_id       uuid NOT NULL REFERENCES employees(id),
  trigger_reason    offboarding_trigger NOT NULL,
  notice_date       date,
  last_working_day  date,             -- MANDATORY RULE: all access cut at most on this day (Stage 2)
  status            offboarding_status NOT NULL DEFAULT 'open',
  stage             smallint NOT NULL DEFAULT 1 CHECK (stage BETWEEN 1 AND 6),
  exit_interview    jsonb,            -- reasons + notes (Stage 5)
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  archived_at       timestamptz
);

COMMENT ON TABLE offboarding_cases IS
  'Offboarding case, manual Part III Stages 1–6 (docs/02 §5). last_working_day is the hard deadline for access deactivation.';
CREATE INDEX idx_offboarding_cases_tenant_status ON offboarding_cases (tenant_id, status);

-- ----------------------------------------------------------------------------
-- clearance_items — the clearance matrix of Stage 4
-- ----------------------------------------------------------------------------
CREATE TABLE clearance_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  case_id     uuid NOT NULL REFERENCES offboarding_cases(id),
  department  clearance_department NOT NULL,
  item_key    text NOT NULL,   -- laptop_return, email_closure, hardware_recovery, id_card_return, medical_card_return, asset_return, advance_clearance, petty_cash_settlement, liability_verification, handover_approval
  status      task_status NOT NULL DEFAULT 'pending',
  cleared_by  uuid,
  cleared_at  timestamptz,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_by  uuid,
  archived_at timestamptz
);

COMMENT ON TABLE clearance_items IS
  'Clearance matrix per department (docs/02 §5, Offboarding Stage 4): it / operations_admin / finance / direct_manager.';
CREATE INDEX idx_clearance_items_case ON clearance_items (tenant_id, case_id);

-- ----------------------------------------------------------------------------
-- handover_forms — knowledge & task handover (Stage 3)
-- ----------------------------------------------------------------------------
CREATE TABLE handover_forms (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  case_id              uuid NOT NULL REFERENCES offboarding_cases(id),
  to_employee_id       uuid REFERENCES employees(id),
  duties               jsonb NOT NULL DEFAULT '[]'::jsonb,
  continuity_plan      text,
  manager_approved_by  uuid,
  manager_approved_at  timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  archived_at          timestamptz
);

COMMENT ON TABLE handover_forms IS
  'Knowledge & task handover form (docs/02 §5, Offboarding Stage 3), approved by the direct manager.';
CREATE INDEX idx_handover_forms_case ON handover_forms (tenant_id, case_id);

-- ----------------------------------------------------------------------------
-- final_settlements — Stage 5 (Legal & Financial Closure).
-- Finance approval required before payout (Policy 13).
-- unused_leave_balance flows in from the Leave module (module 07).
-- ----------------------------------------------------------------------------
CREATE TABLE final_settlements (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id),
  case_id               uuid NOT NULL UNIQUE REFERENCES offboarding_cases(id),
  final_salary          numeric(12, 2),
  unused_leave_balance  numeric(6, 2),   -- days, from leave_balances
  leave_compensation    numeric(12, 2),  -- cash value at daily wage
  deductions            jsonb NOT NULL DEFAULT '{}'::jsonb,  -- advances/loans balance, liabilities
  other_entitlements    jsonb NOT NULL DEFAULT '{}'::jsonb,
  si_form6_path         text,            -- Social Insurance Form 6
  total                 numeric(12, 2),
  status                settlement_status NOT NULL DEFAULT 'draft',
  finance_approved_by   uuid,
  finance_approved_at   timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid,
  archived_at           timestamptz
);

COMMENT ON TABLE final_settlements IS
  'Final settlement, Offboarding Stage 5 (docs/02 §5). Finance approves before payout (Policy 13); leave balance flows from module 07.';
CREATE INDEX idx_final_settlements_tenant ON final_settlements (tenant_id, status);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['onboarding_cases','onboarding_tasks','hse_records',
                           'offboarding_cases','clearance_items','handover_forms','final_settlements'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;
