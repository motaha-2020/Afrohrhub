"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

function safeLocale(value: FormDataEntryValue | null): string {
  const v = String(value ?? "");
  return (routing.locales as readonly string[]).includes(v)
    ? v
    : routing.defaultLocale;
}

export interface SignInState {
  error?: string;
}

/** Email/password sign-in (Supabase Auth). On success redirects to dashboard. */
export async function signInAction(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = safeLocale(formData.get("locale"));

  if (!email || !password) return { error: "missing" };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "invalid" };

  redirect(`/${locale}/dashboard`);
}

/** One-click demo sign-in (plain form action). Email/password from the form. */
export async function demoSignInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const locale = safeLocale(formData.get("locale"));
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  redirect(error ? `/${locale}/login` : `/${locale}/dashboard`);
}

/** Sign out and return to the login screen. */
export async function signOutAction(formData: FormData): Promise<void> {
  const locale = safeLocale(formData.get("locale"));
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}
