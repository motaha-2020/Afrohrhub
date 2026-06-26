import type { Role } from "@/lib/rbac/roles";
import type { Persona } from "./personas";

/**
 * Session shape shared by the client context and the server cookie reader.
 * Mirrors what the Supabase JWT will carry later (roles + tenant in
 * app_metadata).
 */
export interface SessionTenant {
  slug: string;
  name_ar: string;
  name_en: string;
}

export interface MockSession {
  user: { name_ar: string; name_en: string };
  roles: Role[];
  tenant: SessionTenant;
}

export function sessionFromPersona(
  persona: Persona,
  tenant: SessionTenant
): MockSession {
  return {
    user: { name_ar: persona.name_ar, name_en: persona.name_en },
    roles: persona.roles,
    tenant,
  };
}
