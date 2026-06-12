"use client";

/**
 * ============================== DEV ONLY ==============================
 * Mock session: React context + cookie persistence around the "View as"
 * personas. Server components read the same cookie via
 * `lib/auth/session.server.ts`. Replaced by Supabase Auth later — the
 * `MockSession` shape intentionally mirrors what the JWT will carry
 * (roles + tenant in app_metadata).
 * ======================================================================
 */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "@/lib/rbac/roles";
import {
  getPersona,
  PERSONA_COOKIE,
  type Persona,
} from "./personas";

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

interface SessionContextValue {
  session: MockSession;
  persona: Persona;
  setPersonaId: (id: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

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

export function SessionProvider({
  initialPersonaId,
  tenant,
  children,
}: {
  initialPersonaId: string;
  tenant: SessionTenant;
  children: ReactNode;
}) {
  const [persona, setPersona] = useState<Persona>(() =>
    getPersona(initialPersonaId)
  );

  const setPersonaId = useCallback((id: string) => {
    const next = getPersona(id);
    setPersona(next);
    // Persist for server components (one year, lax — dev convenience only).
    document.cookie = `${PERSONA_COOKIE}=${next.id}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session: sessionFromPersona(persona, tenant),
        persona,
        setPersonaId,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within <SessionProvider>");
  }
  return ctx;
}
