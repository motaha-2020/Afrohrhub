import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Request-scoped Supabase client (anon key + the user's auth cookies). Every
 * query runs as the signed-in user, so PostgreSQL RLS (tenant isolation +
 * Policy 9 compensation confidentiality + ESS self-scope, see
 * supabase/README.md) is the source of truth — the app holds no service-role
 * key. Used by the server-component data layer and the auth actions.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase is wired (else the app runs on the in-repo mock + dev personas). */
export const isSupabaseConfigured = Boolean(url && anonKey);

export async function createServerSupabase(): Promise<SupabaseClient> {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Throws in Server Components (read-only cookies) — the middleware
        // refreshes the session, so this is safe to swallow here.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* no-op outside actions/route handlers */
        }
      },
    },
  });
}
