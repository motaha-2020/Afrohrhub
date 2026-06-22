/** Dashboard sample figures from the approved demo (mock-only). */

export const DASHBOARD_KPIS = {
  active_employees: 3247,
  active_delta_month: 38,
  open_hiring_requests: 14,
  open_p0: 5,
  onboarding_in_progress: 23,
  ready_for_activation: 9,
  payroll_window: "20–23",
} as const;

export const DIRECTORY_COUNTS = {
  active: 3247,
  pending: 41,
  offboarding: 12,
} as const;

/** Headcount per project, keyed by project code so it resolves against both
 * the mock seed and the real DB (whose ids are UUIDs). */
export const HEADCOUNT_BY_PROJECT: {
  code: string;
  headcount: number;
  pct: number;
}[] = [
  { code: "PRJ-014", headcount: 1120, pct: 84 },
  { code: "PRJ-009", headcount: 846, pct: 62 },
  { code: "PRJ-021", headcount: 633, pct: 47 },
  { code: "PRJ-017", headcount: 451, pct: 33 },
  { code: "HQ-001", headcount: 197, pct: 15 },
];
