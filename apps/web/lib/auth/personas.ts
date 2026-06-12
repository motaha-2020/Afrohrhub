import type { Role } from "@/lib/rbac/roles";

/**
 * ============================== DEV ONLY ==============================
 * Mock personas for the topbar "View as" switcher — they exist so every
 * screen can be exercised under each of the demo roles before Supabase
 * Auth lands. When real auth ships, this file and the persona cookie are
 * deleted and `getServerSession()` reads the Supabase JWT instead.
 * ======================================================================
 */
export interface Persona {
  id: string;
  name_ar: string;
  name_en: string;
  roles: Role[];
  /** Linked employee record (ESS scope), when applicable. */
  employee_id?: string;
}

export const PERSONAS: Persona[] = [
  { id: "hrm", name_ar: "منى طه", name_en: "Mona Taha", roles: ["hr_manager"] },
  {
    id: "ta",
    name_ar: "هبة سمير",
    name_en: "Heba Samir",
    roles: ["talent_acquisition"],
  },
  {
    id: "personnel",
    name_ar: "مصطفى كامل",
    name_en: "Mostafa Kamel",
    roles: ["personnel"],
  },
  {
    id: "payroll",
    name_ar: "نرمين لطفي",
    name_en: "Nermin Lotfy",
    roles: ["payroll"],
  },
  {
    id: "finance",
    name_ar: "شريف أنور",
    name_en: "Sherif Anwar",
    roles: ["finance"],
  },
  { id: "hse", name_ar: "طارق سليم", name_en: "Tarek Selim", roles: ["hse"] },
  {
    id: "pm",
    name_ar: "وليد الجندي",
    name_en: "Walid El-Gendy",
    roles: ["direct_manager"],
  },
  {
    id: "ess",
    name_ar: "محمود النجار",
    name_en: "Mahmoud El-Naggar",
    roles: ["employee"],
    employee_id: "emp-002",
  },
];

export const DEFAULT_PERSONA_ID = "hrm";

/** Cookie that persists the active dev persona across reloads. */
export const PERSONA_COOKIE = "afrohr_persona";

export function getPersona(id: string | undefined): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
