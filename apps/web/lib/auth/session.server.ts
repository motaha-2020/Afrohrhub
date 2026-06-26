import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_PERSONA_ID,
  getPersona,
  PERSONA_COOKIE,
  type Persona,
} from "./personas";
import { sessionFromPersona, type MockSession } from "./types";
import { MOCK_TENANT } from "@/lib/data/mock/seed";
import type { Role } from "@/lib/rbac/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Resolves the active session. Primary path is Supabase Auth: the logged-in
 * `auth.users` row is joined to the tenant `users` row (roles + tenant +
 * linked employee). In development, if no real session exists we fall back
 * to the dev persona cookie so screens can still be exercised per-role.
 */
export async function getServerSession(): Promise<{
  session: MockSession;
  persona: Persona;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select(
        `roles, employee_id, locale,
         tenant:tenants!tenant_id(slug, name_ar, name_en),
         employee:employees!employee_id(name_ar, name_en)`
      )
      .eq("auth_user_id", user.id)
      .is("archived_at", null)
      .single();

    if (profile) {
      const tenant = profile.tenant as unknown as {
        slug: string;
        name_ar: string;
        name_en: string;
      };
      const emp = profile.employee as unknown as {
        name_ar: string;
        name_en: string;
      } | null;
      const fallbackName = user.email?.split("@")[0] ?? "User";

      const persona: Persona = {
        id: user.id,
        name_ar: emp?.name_ar ?? fallbackName,
        name_en: emp?.name_en ?? fallbackName,
        roles: (profile.roles as Role[]) ?? [],
        employee_id: (profile.employee_id as string | null) ?? undefined,
      };

      return {
        session: {
          user: { name_ar: persona.name_ar, name_en: persona.name_en },
          roles: persona.roles,
          tenant: {
            slug: tenant?.slug ?? MOCK_TENANT.slug,
            name_ar: tenant?.name_ar ?? MOCK_TENANT.name_ar,
            name_en: tenant?.name_en ?? MOCK_TENANT.name_en,
          },
        },
        persona,
      };
    }
  }

  // DEV fallback — persona cookie.
  const store = await cookies();
  const persona = getPersona(
    store.get(PERSONA_COOKIE)?.value ?? DEFAULT_PERSONA_ID
  );
  return {
    session: sessionFromPersona(persona, {
      slug: MOCK_TENANT.slug,
      name_ar: MOCK_TENANT.name_ar,
      name_en: MOCK_TENANT.name_en,
    }),
    persona,
  };
}

/** Whether a real Supabase Auth user is present (no dev-persona fallback). */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}
