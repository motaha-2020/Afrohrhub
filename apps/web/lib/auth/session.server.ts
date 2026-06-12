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

/**
 * DEV ONLY — server-side counterpart of the mock session: resolves the
 * active persona from the dev cookie. Swapped for Supabase Auth
 * (`auth.getUser()` + JWT app_metadata) later.
 */
export async function getServerSession(): Promise<{
  session: MockSession;
  persona: Persona;
}> {
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
