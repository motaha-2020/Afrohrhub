-- ============================================================================
-- 0003 — Core HR & Employee Records
-- Implements docs/02-data-model.md §2 and docs/modules/01-core-hr.md
-- Policies implemented here: 1 (no payroll before Active — function),
-- 6 (bank_verified), 9 (compensation isolation), 14 (archive only),
-- 16 (audit trigger on sensitive tables).
-- ============================================================================

CREATE TYPE employment_type  AS ENUM ('permanent', 'temporary', 'project');
CREATE TYPE collar_type      AS ENUM ('white', 'blue');
CREATE TYPE employee_status  AS ENUM ('pending', 'active', 'suspended', 'offboarding', 'archived');
CREATE TYPE gender_type      AS ENUM ('male', 'female');
CREATE TYPE doc_applies_to   AS ENUM ('all', 'engineers', 'technicians');
CREATE TYPE document_status  AS ENUM ('required', 'received', 'verified', 'expired');

-- ----------------------------------------------------------------------------
-- employees — the master record (docs/02 §2, module 01)
-- ----------------------------------------------------------------------------
CREATE TABLE employees (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                uuid NOT NULL REFERENCES tenants(id),

  -- identity
  hr_code                  text,                  -- generated per tenant format (AFR-{YYYY}-{####}); NEVER reused
  name_ar                  text NOT NULL,
  name_en                  text NOT NULL,
  national_id              text NOT NULL CHECK (national_id ~ '^[0-9]{14}$'),
  birth_date               date,                  -- extracted from national_id
  gender                   gender_type,           -- extracted from national_id
  governorate              text,                  -- extracted from national_id
  mobile                   text,
  personal_email           text,
  work_email               text,
  photo_path               text,
  address                  text,
  marital_status           text,
  emergency_contact        jsonb,

  -- employment
  job_title_id             uuid REFERENCES job_titles(id),
  grade_id                 uuid REFERENCES grades(id),
  department_id            uuid REFERENCES departments(id),
  direct_manager_id        uuid REFERENCES employees(id),
  employment_type          employment_type NOT NULL DEFAULT 'permanent',
  collar                   collar_type NOT NULL DEFAULT 'white',
  hire_date                date,
  contract_signing_date    date,
  status                   employee_status NOT NULL DEFAULT 'pending',

  -- social insurance
  social_insurance_number  text,
  insurance_office         text,
  syndicate_card           text,                  -- Engineers Syndicate card no. (if any)

  -- flags
  is_rehire                boolean NOT NULL DEFAULT false,  -- auto-detected by national_id vs archived records
  requires_medical_exam    boolean NOT NULL DEFAULT false,  -- CM/PM Engineers & Riggers
  safety_sensitive_role    boolean NOT NULL DEFAULT false,

  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  created_by               uuid,
  archived_at              timestamptz,

  UNIQUE (tenant_id, national_id),               -- duplicate prevention + rehire detection
  UNIQUE (tenant_id, hr_code)
);

COMMENT ON TABLE employees IS
  'Employee master record (docs/02 §2, module 01). Status Engine: pending→active→suspended→offboarding→archived; transition to active gated by app.fn_can_activate (Onboarding Stage 9). Archive only — Policy 14.';

CREATE INDEX idx_employees_tenant_status  ON employees (tenant_id, status);
CREATE INDEX idx_employees_tenant_dept    ON employees (tenant_id, department_id);
CREATE INDEX idx_employees_manager        ON employees (direct_manager_id);
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at();

-- deferred FKs from 0002 (circular references)
ALTER TABLE users    ADD CONSTRAINT fk_users_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE projects ADD CONSTRAINT fk_projects_manager
  FOREIGN KEY (project_manager_id) REFERENCES employees(id);

-- ----------------------------------------------------------------------------
-- employee_compensation — 1:1 with employee, hardened RLS (Policy 9):
-- only Payroll / HR Manager / Finance / Company Admin (see 0009).
-- ----------------------------------------------------------------------------
CREATE TABLE employee_compensation (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  employee_id       uuid NOT NULL UNIQUE REFERENCES employees(id),
  net_salary        numeric(12, 2),
  gross_salary      numeric(12, 2),
  insurable_salary  numeric(12, 2),
  allowances        jsonb NOT NULL DEFAULT '{}'::jsonb,  -- fixed allowances
  bank_name         text,
  bank_account      text,                                -- account / IBAN
  bank_verified     boolean NOT NULL DEFAULT false,      -- Policy 6: no payment without verification
  bank_verified_by  uuid,
  bank_verified_at  timestamptz,
  payment_method    text NOT NULL DEFAULT 'bank_transfer',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  archived_at       timestamptz
);

COMMENT ON TABLE employee_compensation IS
  '1:1 salary data, isolated for field-level security (Policy 9 — Payroll/HR Manager/Finance/Company Admin only). bank_verified gates any payment (Policy 6).';

CREATE INDEX idx_emp_comp_tenant ON employee_compensation (tenant_id);
CREATE TRIGGER trg_employee_compensation_updated_at
  BEFORE UPDATE ON employee_compensation FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- employee_project_allocations — cost allocation % per project (Policy 12).
-- Active allocations of an employee must not exceed 100%.
-- ----------------------------------------------------------------------------
CREATE TABLE employee_project_allocations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  employee_id       uuid NOT NULL REFERENCES employees(id),
  project_id        uuid NOT NULL REFERENCES projects(id),
  allocation_pct    numeric(5, 2) NOT NULL CHECK (allocation_pct > 0 AND allocation_pct <= 100),
  work_location_id  uuid REFERENCES work_locations(id),
  start_date        date NOT NULL DEFAULT current_date,
  end_date          date,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  archived_at       timestamptz,
  CHECK (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE employee_project_allocations IS
  'Cost allocation per project (docs/02 §2). Basis of per-project cost reports (Policy 12). Active allocations of one employee must sum to ≤ 100% (trigger).';

CREATE INDEX idx_alloc_tenant_employee ON employee_project_allocations (tenant_id, employee_id);
CREATE INDEX idx_alloc_tenant_project  ON employee_project_allocations (tenant_id, project_id);
CREATE TRIGGER trg_employee_project_allocations_updated_at
  BEFORE UPDATE ON employee_project_allocations FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at();

-- An allocation is "active" when not archived and not ended.
-- The docs say active allocations should total exactly 100%; we enforce the
-- hard invariant (≤ 100) in the DB and leave "should reach 100%" to the app /
-- Data Quality Bot, so partial data entry is still possible.
CREATE OR REPLACE FUNCTION app.tg_check_allocation_pct() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_total numeric;
BEGIN
  SELECT COALESCE(SUM(allocation_pct), 0) INTO v_total
  FROM employee_project_allocations
  WHERE employee_id = NEW.employee_id
    AND archived_at IS NULL
    AND (end_date IS NULL OR end_date >= current_date);

  IF v_total > 100 THEN
    RAISE EXCEPTION 'Active project allocations for employee % sum to % percent (must not exceed 100)', NEW.employee_id, v_total
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_alloc_sum_check
  AFTER INSERT OR UPDATE ON employee_project_allocations
  FOR EACH ROW EXECUTE FUNCTION app.tg_check_allocation_pct();

-- ----------------------------------------------------------------------------
-- document_types + employee_documents — the Document Vault
-- Seeded with the 12 concrete manual documents (+ tenant custom types) —
-- docs/modules/01-core-hr.md, Onboarding Stage 3.
-- ----------------------------------------------------------------------------
CREATE TABLE document_types (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id),
  name_ar         text NOT NULL,
  name_en         text NOT NULL,
  applies_to      doc_applies_to NOT NULL DEFAULT 'all',
  is_original     boolean NOT NULL DEFAULT false,  -- original kept by company, returned at Offboarding Stage 6
  requires_expiry boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  archived_at     timestamptz
);

COMMENT ON TABLE document_types IS
  'Document checklist types — 12 seeded from the manual + tenant custom types (module 01, Onboarding Stage 3).';
CREATE INDEX idx_document_types_tenant ON document_types (tenant_id);

CREATE TABLE employee_documents (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             uuid NOT NULL REFERENCES tenants(id),
  employee_id           uuid NOT NULL REFERENCES employees(id),
  document_type_id      uuid NOT NULL REFERENCES document_types(id),
  status                document_status NOT NULL DEFAULT 'required',
  file_path             text,
  expiry_date           date,                       -- feeds 60/30/7-day proactive alerts
  original_received     boolean NOT NULL DEFAULT false,
  received_by           uuid,
  received_at           timestamptz,
  original_returned_at  timestamptz,                -- filled at Offboarding Stage 6
  ai_classification     jsonb,                      -- Classifier/OCR output pending human approval
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  created_by            uuid,
  archived_at           timestamptz,
  UNIQUE (tenant_id, employee_id, document_type_id)
);

COMMENT ON TABLE employee_documents IS
  'Document Vault rows per employee (module 01). status required/received/verified/expired; originals tracked for return at Offboarding Stage 6.';
CREATE INDEX idx_emp_docs_tenant_employee ON employee_documents (tenant_id, employee_id);
CREATE INDEX idx_emp_docs_expiry ON employee_documents (tenant_id, expiry_date) WHERE expiry_date IS NOT NULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['document_types','employee_documents'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;

-- ----------------------------------------------------------------------------
-- employee_events — append-only employment history timeline (docs/02 §2)
-- ----------------------------------------------------------------------------
CREATE TABLE employee_events (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  employee_id          uuid NOT NULL REFERENCES employees(id),
  event_type           text NOT NULL,   -- hire / promotion / transfer / salary_change / penalty / contract_renewal / contract_signed / status_change / ...
  effective_date       date NOT NULL DEFAULT current_date,
  payload              jsonb NOT NULL DEFAULT '{}'::jsonb,  -- before/after snapshot
  attachment_path      text,
  approval_request_id  uuid,            -- FK -> approval_requests added in 0008
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  archived_at          timestamptz
);

COMMENT ON TABLE employee_events IS
  'Append-only Employment History Timeline (docs/02 §2, module 01). UPDATE/DELETE blocked by trigger.';
CREATE INDEX idx_emp_events_tenant_employee ON employee_events (tenant_id, employee_id, effective_date);

CREATE OR REPLACE FUNCTION app.tg_block_mutation() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only — % not allowed (Policy 14/16)', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER trg_employee_events_append_only
  BEFORE UPDATE OR DELETE ON employee_events
  FOR EACH ROW EXECUTE FUNCTION app.tg_block_mutation();

-- ----------------------------------------------------------------------------
-- audit_log + generic audit trigger (Policy 16)
-- NOTE: docs/02 calls for monthly partitioning of audit_log; deferred until
-- volume requires it (same as attendance_records) — documented deviation.
-- ----------------------------------------------------------------------------
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id),
  table_name  text NOT NULL,
  record_id   uuid,
  action      text NOT NULL,            -- INSERT / UPDATE / DELETE
  old_data    jsonb,
  new_data    jsonb,
  actor_id    uuid,                     -- auth.users.id from JWT sub claim
  at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE audit_log IS
  'Append-only audit trail for sensitive tables (Policy 16). Monthly partitioning planned when volume requires (docs/02).';
CREATE INDEX idx_audit_log_tenant_table ON audit_log (tenant_id, table_name, at);

CREATE TRIGGER trg_audit_log_append_only
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION app.tg_block_mutation();

CREATE OR REPLACE FUNCTION app.fn_audit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_actor  uuid;
  v_tenant uuid;
BEGIN
  BEGIN
    v_actor := (auth.jwt() ->> 'sub')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_actor := NULL;
  END;

  v_tenant := COALESCE(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.tenant_id ELSE NEW.tenant_id END,
    app.current_tenant_id()
  );

  INSERT INTO audit_log (tenant_id, table_name, record_id, action, old_data, new_data, actor_id)
  VALUES (
    v_tenant,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END,
    v_actor
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

COMMENT ON FUNCTION app.fn_audit() IS
  'Generic row-level audit trigger (Policy 16) — who, when, before/after values.';

CREATE TRIGGER trg_audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION app.fn_audit();
CREATE TRIGGER trg_audit_employee_compensation
  AFTER INSERT OR UPDATE OR DELETE ON employee_compensation
  FOR EACH ROW EXECUTE FUNCTION app.fn_audit();
CREATE TRIGGER trg_audit_employee_documents
  AFTER INSERT OR UPDATE OR DELETE ON employee_documents
  FOR EACH ROW EXECUTE FUNCTION app.fn_audit();

-- ----------------------------------------------------------------------------
-- app.fn_can_activate(employee_id) — the six activation conditions of
-- Onboarding Stage 9 (docs/02 §2, module 01 "Status Engine").
--
-- Assumptions (documented):
--   1. documents_complete : no employee_documents row in status required/expired.
--      (Document rows are generated from the applicable checklist when the
--      onboarding case opens; an employee with zero rows passes — migration
--      imports of legacy staff rely on this.)
--   2. contract_signed    : employee_events has event_type 'contract_signed'
--                           OR employees.contract_signing_date is set.
--   3. hse_requirements   : if safety_sensitive_role, at least one passed
--                           safety_course in hse_records (not expired);
--                           otherwise true. hse_records is created in 0005,
--                           so the check is guarded by to_regclass and
--                           evaluates to true while the table doesn't exist.
--   4. medical_exam       : if requires_medical_exam, an hse_records
--                           medical_exam with result 'fit' (not expired);
--                           otherwise true. Same to_regclass guard.
--   5. systems_ready      : hr_code is assigned (ERP profile exists — the
--                           HR code is generated at system setup, Stage 5).
--   6. certificates_valid : no expired technician documents (skill level /
--                           practice license — applies_to = 'technicians').
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.fn_can_activate(p_employee_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  emp                  employees%ROWTYPE;
  v_documents_complete boolean;
  v_contract_signed    boolean;
  v_hse_requirements   boolean := true;
  v_medical_exam       boolean := true;
  v_systems_ready      boolean;
  v_certificates_valid boolean;
BEGIN
  SELECT * INTO emp FROM employees WHERE id = p_employee_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Employee % not found', p_employee_id;
  END IF;

  -- 1. documents complete
  v_documents_complete := NOT EXISTS (
    SELECT 1 FROM employee_documents d
    WHERE d.employee_id = p_employee_id
      AND d.archived_at IS NULL
      AND d.status IN ('required', 'expired')
  );

  -- 2. contract signed
  v_contract_signed := emp.contract_signing_date IS NOT NULL OR EXISTS (
    SELECT 1 FROM employee_events e
    WHERE e.employee_id = p_employee_id AND e.event_type = 'contract_signed'
  );

  -- 3 + 4. HSE requirements & medical exam (hse_records created in 0005 —
  -- guarded so this function is valid before that migration runs)
  IF to_regclass('public.hse_records') IS NOT NULL THEN
    IF emp.safety_sensitive_role THEN
      EXECUTE $q$
        SELECT EXISTS (
          SELECT 1 FROM hse_records h
          WHERE h.employee_id = $1 AND h.type = 'safety_course' AND h.result = 'pass'
            AND (h.expiry_date IS NULL OR h.expiry_date >= current_date)
        )$q$ INTO v_hse_requirements USING p_employee_id;
    END IF;

    IF emp.requires_medical_exam THEN
      EXECUTE $q$
        SELECT EXISTS (
          SELECT 1 FROM hse_records h
          WHERE h.employee_id = $1 AND h.type = 'medical_exam' AND h.result = 'fit'
            AND (h.expiry_date IS NULL OR h.expiry_date >= current_date)
        )$q$ INTO v_medical_exam USING p_employee_id;
    END IF;
  END IF;

  -- 5. systems ready
  v_systems_ready := emp.hr_code IS NOT NULL;

  -- 6. required certificates valid (no expired technician certificates)
  v_certificates_valid := NOT EXISTS (
    SELECT 1
    FROM employee_documents d
    JOIN document_types dt ON dt.id = d.document_type_id
    WHERE d.employee_id = p_employee_id
      AND d.archived_at IS NULL
      AND dt.applies_to = 'technicians'
      AND d.status = 'expired'
  );

  RETURN jsonb_build_object(
    'documents_complete', v_documents_complete,
    'contract_signed',    v_contract_signed,
    'hse_requirements',   v_hse_requirements,
    'medical_exam',       v_medical_exam,
    'systems_ready',      v_systems_ready,
    'certificates_valid', v_certificates_valid,
    'can_activate',       v_documents_complete AND v_contract_signed AND v_hse_requirements
                          AND v_medical_exam AND v_systems_ready AND v_certificates_valid
  );
END;
$$;

COMMENT ON FUNCTION app.fn_can_activate(uuid) IS
  'The six activation conditions of Onboarding Stage 9 (module 01). Gates pending→active; no employee enters payroll before active (Policy 1).';

-- Status Engine guard: block UPDATE to status='active' unless all six pass.
CREATE OR REPLACE FUNCTION app.tg_employees_activation_guard() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_check jsonb;
BEGIN
  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    v_check := app.fn_can_activate(NEW.id);
    IF NOT (v_check ->> 'can_activate')::boolean THEN
      RAISE EXCEPTION 'Cannot activate employee %: activation conditions not met — %', NEW.id, v_check
        USING ERRCODE = 'check_violation',
              HINT = 'See app.fn_can_activate() — Onboarding Stage 9 six conditions.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_employees_activation_guard
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION app.tg_employees_activation_guard();
