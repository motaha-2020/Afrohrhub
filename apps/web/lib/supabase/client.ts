import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon/publishable key). Reserved for the upcoming
 * Supabase Auth flow (phone/email OTP, docs/01) — once a user is signed in,
 * its JWT drives RLS in the database. Not used by the current server-rendered
 * screens, which read through the server admin client (see ./server.ts).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
