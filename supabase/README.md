# AfroHR Hub — Database (Supabase / PostgreSQL)

PostgreSQL schema for the multi-tenant HR SaaS described in `/docs`. Pure SQL
migrations, PostgreSQL 15+, no ORM.

## Layout

```
supabase/
└── migrations/
    ├── 0001_extensions_and_helpers.sql   -- app schema, pgcrypto, auth.jwt() stub, tenant/role/national-id helpers
    ├── 0002_core_tenancy.sql             -- tenants, users, departments, grades, job_titles, work_locations, projects, holidays
    ├── 0003_core_hr.sql                  -- employees, compensation, allocations, document vault, timeline, audit, fn_can_activate
    ├── 0004_recruitment.sql              -- hiring requests, candidates, applications, interviews, offers
    ├── 0005_onboarding_offboarding.sql   -- onboarding/offboarding cases, tasks, HSE records, clearance, settlements
    ├── 0006_payroll.sql                  -- payroll/allowance/KPI cycles & items, adjustments, advances, cost reports
    ├── 0007_attendance_leave.sql         -- shifts, attendance, leave types/balances/requests
    ├── 0008_engines.sql                  -- approval engine, SLA engine, notifications
    ├── 0009_rls.sql                      -- RLS on every table (tenant isolation + role exceptions)
    └── 0010_seed.sql                     -- demo tenant "Afro Egypt Contracting" with deterministic UUIDs
```

## Applying the migrations

### With the Supabase CLI

```bash
supabase start        # local stack
supabase db reset     # applies supabase/migrations in lexical order, ends with seed
```

(`0010_seed.sql` is a migration on purpose so `db reset` always produces a
ready-to-demo database. Move it to `supabase/seed.sql` if you prefer
seedless deploys.)

### With plain psql

```bash
createdb afrohrhub
for f in supabase/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -d afrohrhub -f "$f"
done
```

## How JWT claims drive RLS

All tenant isolation and role checks happen **in the database**, not the UI
(docs/03). Supabase injects the verified JWT into the `request.jwt.claims`
GUC; `auth.jwt()` exposes it (a stub with identical behavior is created on
plain PostgreSQL). Three helpers read it:

| Helper | Claim | Used by |
|---|---|---|
| `app.current_tenant_id()` | `app_metadata.tenant_id` | the standard tenant-isolation policy on every table |
| `app.has_role(text)` | `app_metadata.roles` (array, union of the 13 docs/03 roles) | compensation (Policy 9), audit log, tenants update |
| `app.current_employee_id()` | `app_metadata.employee_id` | ESS self-scope (own employee row & payslip) |

Sample claims for an HR Manager who is also an employee:

```json
{
  "sub": "8f1d2c3b-0000-4000-8000-123456789abc",
  "role": "authenticated",
  "app_metadata": {
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "employee_id": "00000000-0000-0000-0010-000000000005",
    "roles": ["hr_manager"]
  }
}
```

To impersonate in a psql session (e.g. for testing policies):

```sql
SET ROLE authenticated;  -- any non-owner role; create one if needed
SET request.jwt.claims = '{"sub":"8f1d2c3b-0000-4000-8000-123456789abc","app_metadata":{"tenant_id":"00000000-0000-0000-0000-000000000001","employee_id":"00000000-0000-0000-0010-000000000005","roles":["hr_manager"]}}';
SELECT count(*) FROM employees;          -- visible: tenant rows only
SELECT * FROM employee_compensation;     -- visible: hr_manager has Policy-9 access
```

Key RLS decisions (see `0009_rls.sql` header for the full rationale):

- Standard policy on every table: `tenant_id = app.current_tenant_id()` for
  SELECT / INSERT / UPDATE.
- **No DELETE policies anywhere** — deletes are denied by default. Archiving
  via `archived_at` is the only removal (Policy 14).
- `employee_compensation` is readable/writable only by
  `payroll` / `hr_manager` / `finance` / `company_admin` (+ ESS reads own row)
  — Policy 9.
- `FORCE ROW LEVEL SECURITY` is intentionally **not** used: the table owner
  (migration role) bypasses RLS so seeds and data migrations run without a
  JWT. App traffic uses non-owner roles, for which RLS always applies.

## DB-enforced business rules

| Rule | Where |
|---|---|
| Policy 1 — no payroll for non-active employees | `app.tg_payroll_item_guard` (BEFORE INSERT on `payroll_items`) |
| Policy 6 — no payment without verified bank account | same trigger |
| Policy 4 + 7 — adjustments need document + approval | NOT NULL on `payroll_adjustments.supporting_doc_path` / `approval_request_id` |
| Onboarding Stage 9 — six activation conditions | `app.fn_can_activate(uuid)` + activation guard trigger on `employees` |
| Cost allocation ≤ 100% | constraint trigger on `employee_project_allocations` |
| Append-only timeline & audit | block triggers on `employee_events`, `audit_log` |
| Egyptian national id validation | `app.fn_validate_national_id(text)` → `{valid, birth_date, gender, governorate_code}` |

## Seed data (`0010_seed.sql`)

Tenant **Afro Egypt Contracting** (`00000000-0000-0000-0000-000000000001`)
with deterministic UUIDs (`00000000-0000-0000-SSSS-0000000000NN`, segment map
in the file header): 7 departments, 12 grades, 5 demo projects (PRJ-014
Benban, PRJ-009 Alamein, PRJ-021 Assiut, PRJ-017 Sokhna, HQ-001), the 12
manual document types, 6 Egyptian leave types, the full verbatim SLA matrix
from docs/04 (including the documented Screening P1 = 5 working days
correction), 4 default approval workflows, and 8 demo employees with
compensation, allocations and document-vault rows — including Ahmed Ragab
Attia (pending, unverified bank) so Policy 1/6 failures can be exercised.

Deferred on purpose (commented in the migrations): `pgvector`
(candidate embeddings), `pg_cron` (SLA refresh job), monthly partitioning of
`attendance_records` / `audit_log`.
