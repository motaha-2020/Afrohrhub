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
import {
  createServerSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export type SessionMode = "auth" | "dev";

export interface ServerSession {
  /** Null in auth mode when no user is signed in (caller redirects to login). */
  session: MockSession | null;
  mode: SessionMode;
  /** Dev-mode only — the active "View as" persona. */
  persona: Persona | null;
}

const FALLBACK_TENANT = {
  slug: MOCK_TENANT.slug,
  name_ar: MOCK_TENANT.name_ar,
  name_en: MOCK_TENANT.name_en,
};

/**
 * Resolves the current session. With Supabase configured this reads the
 * signed-in user and derives roles/tenant/employee from the JWT app_metadata
 * (the same claims that drive RLS). Without it, the dev "View as" persona
 * cookie is used so the app runs with the in-repo mock and no login.
 */
export async function getServerSession(): Promise<ServerSession> {
  if (!isSupabaseConfigured) {
    const store = await cookies();
    const persona = getPersona(
      store.get(PERSONA_COOKIE)?.value ?? DEFAULT_PERSONA_ID
    );
    return {
      mode: "dev",
      persona,
      session: sessionFromPersona(persona, FALLBACK_TENANT),
    };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { mode: "auth", persona: null, session: null };

  const appMeta = (user.app_metadata ?? {}) as {
    roles?: Role[];
    tenant_id?: string;
    employee_id?: string;
  };
  const userMeta = (user.user_metadata ?? {}) as {
    name_ar?: string;
    name_en?: string;
  };

  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("slug,name_ar,name_en")
    .maybeSingle();

  const fallbackName = user.email?.split("@")[0] ?? "User";
  return {
    mode: "auth",
    persona: null,
    session: {
      user: {
        name_ar: userMeta.name_ar ?? fallbackName,
        name_en: userMeta.name_en ?? fallbackName,
      },
      roles: appMeta.roles ?? [],
      tenant: tenantRow ?? FALLBACK_TENANT,
      employee_id: appMeta.employee_id ?? null,
    },
  };
}
