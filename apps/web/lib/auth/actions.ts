"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

function safeLocale(locale: string): string {
  return routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;
}

/** Email + password sign-in. Returns an error message or redirects on success. */
export async function signIn(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = safeLocale(String(formData.get("locale") ?? ""));
  const next = String(formData.get("next") ?? "") || `/${locale}/dashboard`;

  if (!email || !password) {
    return { error: "missing" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "invalid" };
  }

  redirect(next);
}

/** Sign the current user out and return to the login screen. */
export async function signOut(locale: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${safeLocale(locale)}/login`);
}
