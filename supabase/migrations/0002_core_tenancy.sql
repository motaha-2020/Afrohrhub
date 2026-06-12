-- ============================================================================
-- 0002 — Core tenancy & organizational structure
-- Implements docs/02-data-model.md §1 (النواة والهيكل التنظيمي)
--
-- Standard columns on EVERY table (docs/02, header):
--   id uuid PK default gen_random_uuid()
--   tenant_id uuid NOT NULL REFERENCES tenants(id)   (except tenants itself)
--   created_at / updated_at timestamptz default now()
--   created_by uuid          (FK to users — kept as plain uuid to avoid
--                             circular FK churn; users row may not exist yet
--                             during migrations/imports)
--   archived_at timestamptz  (soft delete only — Policy 14, no hard DELETE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.tg_set_updated_at() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION app.tg_set_updated_at() IS
  'BEFORE UPDATE trigger — refreshes updated_at on every row update.';

-- ----------------------------------------------------------------------------
-- tenants — the root of multi-tenancy (docs/02 §1)
-- Deviation from the "standard columns" rule: tenants has no tenant_id
-- (it IS the tenant). Managed by Super Admin via service_role only (docs/03).
-- ----------------------------------------------------------------------------
CREATE TABLE tenants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar      text NOT NULL,
  name_en      text NOT NULL,
  slug         text NOT NULL UNIQUE,
  plan         text NOT NULL DEFAULT 'standard',
  status       text NOT NULL DEFAULT 'active',
  settings     jsonb NOT NULL DEFAULT '{}'::jsonb, -- HR code format, payroll calendar, working days, number format
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz
);

COMMENT ON TABLE tenants IS
  'Tenant companies (docs/02 §1). Managed by Super Admin via service_role; tenant users see only their own row (RLS in 0009).';

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- users — links Supabase auth.users to tenant, roles and (optionally) an
-- employee record for ESS (docs/02 §1, docs/03 RBAC).
-- employee_id FK is added in 0003 (employees does not exist yet).
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  auth_user_id  uuid UNIQUE,            -- auth.users.id (Supabase Auth)
  employee_id   uuid,                   -- nullable; FK -> employees added in 0003
  roles         text[] NOT NULL DEFAULT '{}', -- the 13 roles of docs/03; union of roles applies
  phone         text,                   -- OTP login for blue-collar workers
  locale        text NOT NULL DEFAULT 'ar',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  archived_at   timestamptz
);

COMMENT ON TABLE users IS
  'App users: auth.users ↔ tenant + roles[] (docs/03). roles are mirrored into JWT app_metadata.roles for RLS.';

CREATE INDEX idx_users_tenant ON users (tenant_id);
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at();

-- ----------------------------------------------------------------------------
-- departments / grades / job_titles — simple reference tables (docs/02 §1)
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  code         text NOT NULL,
  name_ar      text NOT NULL,
  name_en      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, code)
);
COMMENT ON TABLE departments IS 'Org structure reference — departments (docs/02 §1).';

CREATE TABLE grades (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  code         text NOT NULL,             -- e.g. E1..E5 engineers, T1..T4 technicians, M1..M3 management
  name_ar      text NOT NULL,
  name_en      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, code)
);
COMMENT ON TABLE grades IS 'Org structure reference — grades (docs/02 §1).';

CREATE TABLE job_titles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  code         text,
  name_ar      text NOT NULL,
  name_en      text NOT NULL,
  grade_id     uuid REFERENCES grades(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz
);
COMMENT ON TABLE job_titles IS 'Org structure reference — job titles, optionally linked to a grade (docs/02 §1).';
CREATE INDEX idx_job_titles_tenant ON job_titles (tenant_id);

-- ----------------------------------------------------------------------------
-- work_locations — offices & construction sites with attendance geofence
-- (docs/02 §1, docs/modules/06-attendance.md)
-- ----------------------------------------------------------------------------
CREATE TABLE work_locations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          uuid NOT NULL REFERENCES tenants(id),
  code               text,
  name_ar            text NOT NULL,
  name_en            text NOT NULL,
  type               text NOT NULL DEFAULT 'site' CHECK (type IN ('office', 'site')),
  geofence_lat       numeric(9, 6),
  geofence_lng       numeric(9, 6),
  geofence_radius_m  integer,           -- GPS check-in must fall within this radius
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  created_by         uuid,
  archived_at        timestamptz
);
COMMENT ON TABLE work_locations IS
  'Offices/sites with geofence (lat/lng/radius_m) used to validate GPS attendance (docs/02 §1, module 06).';
CREATE INDEX idx_work_locations_tenant ON work_locations (tenant_id);

-- ----------------------------------------------------------------------------
-- projects — cost centers; project code is mandatory in hiring requests and
-- in the Hiring Email (docs/02 §1). Closing a project fires the
-- "End of Project Assignment" offboarding trigger.
-- project_manager_id FK is added in 0003 (employees does not exist yet).
-- ----------------------------------------------------------------------------
CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'closed');

CREATE TABLE projects (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id),
  code                text NOT NULL,    -- mandatory in hiring request & Hiring Email
  name_ar             text NOT NULL,
  name_en             text NOT NULL,
  status              project_status NOT NULL DEFAULT 'active',
  project_manager_id  uuid,             -- FK -> employees added in 0003
  location_id         uuid REFERENCES work_locations(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          uuid,
  archived_at         timestamptz,
  UNIQUE (tenant_id, code)
);
COMMENT ON TABLE projects IS
  'Construction projects / cost centers (docs/02 §1). status=closed triggers End-of-Project offboarding.';
CREATE INDEX idx_projects_tenant_status ON projects (tenant_id, status);

-- ----------------------------------------------------------------------------
-- holidays — Egyptian official holidays calendar; feeds working-hours SLA
-- computation (docs/04) and automatic attendance marking (module 07).
-- ----------------------------------------------------------------------------
CREATE TABLE holidays (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  holiday_date date NOT NULL,
  name_ar      text NOT NULL,
  name_en      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, holiday_date)
);
COMMENT ON TABLE holidays IS
  'Official holidays per tenant — input to fn_add_working_time / SLA engine (docs/04) and leave module (module 07).';

-- apply updated_at trigger to the remaining tables of this migration
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['departments','grades','job_titles','work_locations','projects','holidays'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;
