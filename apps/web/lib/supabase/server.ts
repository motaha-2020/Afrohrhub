import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase admin client (service role).
 *
 * INTERIM (docs/07 session 1 — "ربط الآن + Auth لاحقاً"): until Supabase
 * Auth lands, server components read the database with the service-role key,
 * which bypasses RLS. Tenant scoping is therefore enforced explicitly in the
 * repositories (`tenant_id = DEMO_TENANT_ID`) and field-level confidentiality
 * (Policy 9) stays gated in the UI via `canViewCompensation`.
 *
 * The service-role key is read on the server only and is never sent to the
 * browser. When real auth ships, screens switch to the anon client + a JWT
 * whose claims drive RLS in the database (see supabase/README.md), and this
 * file is reduced to admin-only tasks.
 */

/** Demo tenant "Afro Egypt Contracting" — supabase/migrations/0010_seed.sql. */
export const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when server-side Supabase access is configured (else: mock data). */
export const isSupabaseConfigured = Boolean(url && serviceRoleKey);

let cached: SupabaseClient | null = null;

/** Singleton admin client; throws if env is missing (guard with the flag). */
export function getAdminClient(): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase server env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  cached ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
