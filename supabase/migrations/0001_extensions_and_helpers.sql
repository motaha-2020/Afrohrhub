-- ============================================================================
-- 0001 — Extensions, schemas & helper functions
-- AfroHR Hub — multi-tenant HR SaaS for construction companies (Egypt)
-- Source of truth: docs/01-architecture.md, docs/02-data-model.md
-- ============================================================================

-- Application schema for helper functions (kept out of `public` so the
-- PostgREST-exposed surface stays clean).
CREATE SCHEMA IF NOT EXISTS app;

-- gen_random_uuid(), crypt() etc.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- NOTE (deliberately skipped for now):
--   * pgvector  — candidates.embedding (semantic CV search, docs/02 §3) will be
--                 added in a later migration once the AI pipeline lands.
--                 CREATE EXTENSION vector; + ALTER TABLE candidates ADD COLUMN embedding vector(1536);
--   * pg_cron   — the 15-minute SLA timer refresh job (docs/04-sla-engine.md)
--                 is scheduled on the hosted Supabase project, not in migrations,
--                 because pg_cron is not available in all local/CI environments.

-- ----------------------------------------------------------------------------
-- auth schema stub
-- On a real Supabase project the `auth` schema and `auth.jwt()` already exist
-- (provided by GoTrue). For plain PostgreSQL (CI, local psql) we create a
-- compatible stub that reads the same place Supabase puts the verified JWT:
-- the `request.jwt.claims` GUC. The DO block only creates the function when it
-- is missing, so this migration is a no-op on Supabase.
-- ----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS auth;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'jwt'
  ) THEN
    CREATE FUNCTION auth.jwt() RETURNS jsonb
      LANGUAGE sql STABLE
      AS $fn$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claims', true), '')::jsonb,
          '{}'::jsonb
        )
      $fn$;
    COMMENT ON FUNCTION auth.jwt() IS
      'Stub for plain PostgreSQL — Supabase provides the real auth.jwt(). Reads request.jwt.claims GUC.';
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- app.current_tenant_id()
-- Tenant id is injected into the JWT as app_metadata.tenant_id at login.
-- Every RLS policy compares tenant_id with this function (docs/01, docs/03).
-- Fallback: a top-level `tenant_id` claim in request.jwt.claims (useful for
-- tests / service tooling).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS uuid
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_claims jsonb;
  v_tenant text;
BEGIN
  v_claims := auth.jwt();
  v_tenant := v_claims -> 'app_metadata' ->> 'tenant_id';

  IF v_tenant IS NULL THEN
    -- fallback: top-level claim (e.g. SET request.jwt.claims = '{"tenant_id": "..."}')
    v_tenant := COALESCE(
      v_claims ->> 'tenant_id',
      NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id'
    );
  END IF;

  RETURN v_tenant::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL; -- malformed claims must never grant access
END;
$$;

COMMENT ON FUNCTION app.current_tenant_id() IS
  'Tenant of the current JWT (app_metadata.tenant_id, fallback top-level tenant_id claim). NULL = no access via RLS.';

-- ----------------------------------------------------------------------------
-- app.has_role(text)
-- Roles (the 13 roles of docs/03-rbac-permissions.md) are stored in
-- users.roles and injected into the JWT as app_metadata.roles (json array).
-- A user may hold several roles; effective permission = union of roles.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.has_role(p_role text) RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' -> 'roles') ? p_role, false);
$$;

COMMENT ON FUNCTION app.has_role(text) IS
  'True when app_metadata.roles in the JWT contains the given role (docs/03 RBAC).';

-- ----------------------------------------------------------------------------
-- app.fn_validate_national_id(text)
-- Egyptian national id = 14 digits: C YYMMDD GG SSSS K
--   C  (pos 1)      century: 2 = 1900–1999, 3 = 2000–2099
--   YYMMDD (2–7)    birth date
--   GG (8–9)        governorate code (01 Cairo … 88 abroad)
--   SSSS (10–13)    registration sequence; parity of pos 13: odd = male, even = female
--   K  (pos 14)     check digit (algorithm not officially published — not validated)
-- Returns jsonb: {valid, birth_date, gender, governorate_code}
-- Used by Core HR for de-duplication, rehire detection and basic forgery
-- checks (docs/modules/01-core-hr.md).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.fn_validate_national_id(p_nid text)
RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_century   int;
  v_year      int;
  v_birth     date;
  v_gov       text;
  v_gender    text;
  v_invalid   jsonb := jsonb_build_object(
                 'valid', false, 'birth_date', NULL,
                 'gender', NULL, 'governorate_code', NULL);
BEGIN
  IF p_nid IS NULL OR p_nid !~ '^[0-9]{14}$' THEN
    RETURN v_invalid;
  END IF;

  v_century := substr(p_nid, 1, 1)::int;
  IF v_century NOT IN (2, 3) THEN
    RETURN v_invalid;
  END IF;

  v_year := (CASE v_century WHEN 2 THEN 1900 ELSE 2000 END) + substr(p_nid, 2, 2)::int;

  BEGIN
    v_birth := make_date(v_year, substr(p_nid, 4, 2)::int, substr(p_nid, 6, 2)::int);
  EXCEPTION WHEN OTHERS THEN
    RETURN v_invalid; -- impossible month/day
  END;

  IF v_birth > current_date THEN
    RETURN v_invalid;
  END IF;

  v_gov    := substr(p_nid, 8, 2);
  v_gender := CASE WHEN substr(p_nid, 13, 1)::int % 2 = 1 THEN 'male' ELSE 'female' END;

  RETURN jsonb_build_object(
    'valid',            true,
    'birth_date',       to_char(v_birth, 'YYYY-MM-DD'),
    'gender',           v_gender,
    'governorate_code', v_gov
  );
END;
$$;

COMMENT ON FUNCTION app.fn_validate_national_id(text) IS
  'Structural validation of the Egyptian 14-digit national id; extracts birth_date, gender, governorate (docs/modules/01-core-hr.md).';
