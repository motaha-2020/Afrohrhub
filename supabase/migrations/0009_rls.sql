-- ============================================================================
-- 0009 — Row Level Security
-- Implements docs/01-architecture.md (unified tenant isolation) and
-- docs/03-rbac-permissions.md (role-based exceptions).
--
-- Design notes:
--   * Every public table gets ENABLE ROW LEVEL SECURITY plus a standard
--     tenant-isolation policy (tenant_id = app.current_tenant_id()).
--   * FORCE ROW LEVEL SECURITY is deliberately NOT used anywhere: the table
--     owner (the migration/seed role) must keep its built-in RLS bypass so
--     that 0010_seed.sql — and future data migrations — can run without a
--     JWT context. Application traffic arrives via the non-owner
--     `authenticated`/`anon` roles, for which RLS is always enforced.
--   * There are NO DELETE policies on any table. With RLS enabled and no
--     policy for a command, the command is denied by default — this is the
--     DB-level enforcement of Policy 14: archive only (archived_at), never
--     hard-delete. (docs/03: "لا DELETE لأي دور — أرشفة فقط")
--   * Finer per-role write rules from the docs/03 matrix (e.g. Personnel vs
--     Manager scopes) are enforced in the API/service layer on top of this
--     baseline; the DB guarantees tenant isolation + the hard exceptions
--     below (Policy 9 compensation isolation, ESS self scope).
-- ============================================================================

-- Helper: employee id of the current ESS user (JWT app_metadata.employee_id)
CREATE OR REPLACE FUNCTION app.current_employee_id() RETURNS uuid
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'employee_id')::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
COMMENT ON FUNCTION app.current_employee_id() IS
  'employee_id claim of the current JWT (ESS self-scope, docs/03 principle 5).';

-- ----------------------------------------------------------------------------
-- Enable RLS everywhere + standard tenant isolation policies.
-- Excluded from the generic policy (handled individually below):
--   tenants               — isolation is on id, not tenant_id
--   employee_compensation — Policy 9: restricted to finance-grade roles
--   audit_log             — readable by Company Admin / HR Manager only (docs/03)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.relname AS tbl
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tbl);
    -- intentionally no FORCE — see header note (owner bypass needed for seeds)

    IF r.tbl NOT IN ('tenants', 'employee_compensation', 'audit_log') THEN
      EXECUTE format(
        'CREATE POLICY tenant_isolation_select ON public.%I
           FOR SELECT USING (tenant_id = app.current_tenant_id())', r.tbl);
      EXECUTE format(
        'CREATE POLICY tenant_isolation_insert ON public.%I
           FOR INSERT WITH CHECK (tenant_id = app.current_tenant_id())', r.tbl);
      EXECUTE format(
        'CREATE POLICY tenant_isolation_update ON public.%I
           FOR UPDATE USING (tenant_id = app.current_tenant_id())
           WITH CHECK (tenant_id = app.current_tenant_id())', r.tbl);
      -- No DELETE policy on purpose → DELETE denied (Policy 14, archive only).
    END IF;
  END LOOP;
END;
$$;

-- ----------------------------------------------------------------------------
-- tenants — a user only sees (and admins only update) their own tenant row.
-- Tenant lifecycle (create/plan/status) is Super Admin via service_role,
-- which bypasses RLS (docs/03).
-- ----------------------------------------------------------------------------
CREATE POLICY tenant_self_select ON tenants
  FOR SELECT USING (id = app.current_tenant_id());

CREATE POLICY tenant_self_update ON tenants
  FOR UPDATE USING (id = app.current_tenant_id() AND app.has_role('company_admin'))
  WITH CHECK (id = app.current_tenant_id());

-- ----------------------------------------------------------------------------
-- employee_compensation — Policy 9 (field-level salary security):
-- only Payroll / HR Manager / Finance / Company Admin. Even Personnel, who
-- manages the employee file, cannot see salaries. ESS may read their own row
-- (payslip view, docs/03 matrix).
-- NOTE: salary reads are additionally written to audit_log by the app layer
-- (Policy 9 + 16 — reads are an auditable event).
-- ----------------------------------------------------------------------------
CREATE POLICY comp_privileged_select ON employee_compensation
  FOR SELECT USING (
    tenant_id = app.current_tenant_id()
    AND (app.has_role('payroll') OR app.has_role('hr_manager')
         OR app.has_role('finance') OR app.has_role('company_admin'))
  );

CREATE POLICY comp_privileged_insert ON employee_compensation
  FOR INSERT WITH CHECK (
    tenant_id = app.current_tenant_id()
    AND (app.has_role('payroll') OR app.has_role('hr_manager')
         OR app.has_role('company_admin'))
  );

CREATE POLICY comp_privileged_update ON employee_compensation
  FOR UPDATE USING (
    tenant_id = app.current_tenant_id()
    AND (app.has_role('payroll') OR app.has_role('hr_manager')
         OR app.has_role('finance') OR app.has_role('company_admin'))
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY comp_self_select ON employee_compensation
  FOR SELECT USING (
    tenant_id = app.current_tenant_id()
    AND employee_id = app.current_employee_id()
  );

-- ----------------------------------------------------------------------------
-- employees — ESS self-SELECT (docs/03 principle 5: Employee scope = self).
-- This is additive to the generic tenant policy: a pure ESS user whose token
-- carries no roles still reads their own record via this policy even if the
-- app layer narrows the generic one later.
-- ----------------------------------------------------------------------------
CREATE POLICY employees_self_select ON employees
  FOR SELECT USING (
    tenant_id = app.current_tenant_id()
    AND id = app.current_employee_id()
  );

-- ----------------------------------------------------------------------------
-- audit_log — readable by Company Admin / HR Manager only (docs/03 matrix).
-- Rows are written by app.fn_audit() (SECURITY DEFINER, owner bypasses RLS);
-- no INSERT/UPDATE/DELETE policies → direct writes by app roles are denied.
-- ----------------------------------------------------------------------------
CREATE POLICY audit_log_admin_select ON audit_log
  FOR SELECT USING (
    tenant_id = app.current_tenant_id()
    AND (app.has_role('company_admin') OR app.has_role('hr_manager'))
  );
