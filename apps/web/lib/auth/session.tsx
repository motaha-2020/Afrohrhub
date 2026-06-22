"use client";

/**
 * Client session context. In Supabase auth mode it simply holds the
 * server-resolved session (from the JWT). In dev mode (no Supabase) it wraps
 * the "View as" personas with cookie persistence so server components re-read
 * the same cookie via lib/auth/session.server.ts.
 */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { getPersona, PERSONA_COOKIE, type Persona } from "./personas";
import {
  sessionFromPersona,
  type MockSession,
  type SessionTenant,
} from "./types";

export type { MockSession, SessionTenant } from "./types";
export type SessionMode = "auth" | "dev";

interface SessionContextValue {
  session: MockSession;
  mode: SessionMode;
  /** Dev mode only. */
  persona: Persona | null;
  setPersonaId: (id: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  mode,
  session,
  tenant,
  initialPersonaId,
  children,
}: {
  mode: SessionMode;
  /** Server-resolved session (used as-is in auth mode). */
  session: MockSession;
  /** Used to rebuild the session from the active persona in dev mode. */
  tenant: SessionTenant;
  initialPersonaId?: string;
  children: ReactNode;
}) {
  const [persona, setPersona] = useState<Persona | null>(() =>
    mode === "dev" && initialPersonaId ? getPersona(initialPersonaId) : null
  );

  const setPersonaId = useCallback((id: string) => {
    const next = getPersona(id);
    setPersona(next);
    // Persist for server components (one year, lax — dev convenience only).
    document.cookie = `${PERSONA_COOKIE}=${next.id}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const effectiveSession =
    mode === "dev" && persona ? sessionFromPersona(persona, tenant) : session;

  return (
    <SessionContext.Provider
      value={{ session: effectiveSession, mode, persona, setPersonaId }}
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
