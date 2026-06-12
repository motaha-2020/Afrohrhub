-- ============================================================================
-- 0007 — Attendance & Leave
-- Implements docs/02-data-model.md §7,
-- docs/modules/06-attendance.md, docs/modules/07-leave.md
-- ============================================================================

CREATE TYPE attendance_method AS ENUM ('gps', 'site_supervisor', 'biometric', 'manual');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave', 'mission');
CREATE TYPE leave_request_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'cancelled');

-- ----------------------------------------------------------------------------
-- shifts — shift definitions per work location
-- ----------------------------------------------------------------------------
CREATE TABLE shifts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id),
  location_id   uuid REFERENCES work_locations(id),
  name_ar       text NOT NULL,
  name_en       text NOT NULL,
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  working_days  smallint[] NOT NULL DEFAULT '{0,1,2,3,4}', -- 0=Sunday … 6=Saturday
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid,
  archived_at   timestamptz
);
COMMENT ON TABLE shifts IS 'Shift definitions per location (docs/02 §7, module 06).';
CREATE INDEX idx_shifts_tenant ON shifts (tenant_id);

-- ----------------------------------------------------------------------------
-- attendance_records
-- NOTE: docs/02 calls for monthly range partitioning by date. Deferred until
-- data volume requires it — when converting, recreate as
-- PARTITION BY RANGE (date) and migrate; the (tenant_id, date) index already
-- matches the future partition key.
-- ----------------------------------------------------------------------------
CREATE TABLE attendance_records (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id),
  employee_id       uuid NOT NULL REFERENCES employees(id),
  shift_id          uuid REFERENCES shifts(id),
  date              date NOT NULL,
  check_in          timestamptz,
  check_out         timestamptz,
  method            attendance_method NOT NULL DEFAULT 'gps',
  location          jsonb,             -- raw GPS + geofence verification result
  late_minutes      integer NOT NULL DEFAULT 0,
  overtime_minutes  integer NOT NULL DEFAULT 0,
  status            attendance_status NOT NULL DEFAULT 'present',
  exception_reason  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid,
  archived_at       timestamptz,
  UNIQUE (tenant_id, employee_id, date)
);

COMMENT ON TABLE attendance_records IS
  'Daily attendance (docs/02 §7, module 06). GPS check-in verified against work_locations geofence. Monthly partitioning planned (see migration note).';
CREATE INDEX idx_attendance_tenant_date ON attendance_records (tenant_id, date);
CREATE INDEX idx_attendance_employee ON attendance_records (tenant_id, employee_id, date);

-- ----------------------------------------------------------------------------
-- leave_types — seeded per Egyptian labor law (module 07), configurable rules
-- ----------------------------------------------------------------------------
CREATE TABLE leave_types (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id),
  code         text NOT NULL,
  name_ar      text NOT NULL,
  name_en      text NOT NULL,
  max_days     numeric(5, 1),             -- NULL = governed by rules (e.g. sick leave)
  rules        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  archived_at  timestamptz,
  UNIQUE (tenant_id, code)
);
COMMENT ON TABLE leave_types IS
  'Leave types per Egyptian labor law (module 07): annual / casual / sick / maternity / pilgrimage / unpaid. Official holidays live in the holidays table (no request needed).';

-- ----------------------------------------------------------------------------
-- leave_balances — annual balance per employee/type; feeds
-- final_settlements.unused_leave_balance at offboarding (Stage 5)
-- ----------------------------------------------------------------------------
CREATE TABLE leave_balances (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id),
  employee_id    uuid NOT NULL REFERENCES employees(id),
  leave_type_id  uuid NOT NULL REFERENCES leave_types(id),
  year           smallint NOT NULL,
  entitled       numeric(5, 1) NOT NULL DEFAULT 0,  -- computed from hire date, service length, age
  used           numeric(5, 1) NOT NULL DEFAULT 0,
  carried_over   numeric(5, 1) NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  created_by     uuid,
  archived_at    timestamptz,
  UNIQUE (tenant_id, employee_id, leave_type_id, year)
);
COMMENT ON TABLE leave_balances IS
  'Annual leave balance per employee/type (module 07). Unused balance flows to final_settlements at offboarding.';
CREATE INDEX idx_leave_balances_employee ON leave_balances (tenant_id, employee_id, year);

-- ----------------------------------------------------------------------------
-- leave_requests — ESS request → manager (+HR) approval → automatic deduction
-- ----------------------------------------------------------------------------
CREATE TABLE leave_requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id),
  employee_id          uuid NOT NULL REFERENCES employees(id),
  leave_type_id        uuid NOT NULL REFERENCES leave_types(id),
  start_date           date NOT NULL,
  end_date             date NOT NULL,
  days                 numeric(5, 1) NOT NULL CHECK (days > 0),
  reason               text,
  status               leave_request_status NOT NULL DEFAULT 'draft',
  approval_request_id  uuid,            -- FK -> approval_requests added in 0008
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  created_by           uuid,
  archived_at          timestamptz,
  CHECK (end_date >= start_date)
);
COMMENT ON TABLE leave_requests IS
  'Leave requests via approval engine (module 07): manager approval, automatic balance deduction + attendance marking on approval.';
CREATE INDEX idx_leave_requests_employee ON leave_requests (tenant_id, employee_id, status);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['shifts','attendance_records','leave_types','leave_balances','leave_requests'] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION app.tg_set_updated_at()',
      t, t);
  END LOOP;
END;
$$;
