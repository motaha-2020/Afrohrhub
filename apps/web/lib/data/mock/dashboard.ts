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

/** Headcount per project (project_id → demo figures). */
export const HEADCOUNT_BY_PROJECT: {
  project_id: string;
  headcount: number;
  pct: number;
}[] = [
  { project_id: "prj-benban", headcount: 1120, pct: 84 },
  { project_id: "prj-alamein", headcount: 846, pct: 62 },
  { project_id: "prj-assiut", headcount: 633, pct: 47 },
  { project_id: "prj-sokhna", headcount: 451, pct: 33 },
  { project_id: "prj-hq", headcount: 197, pct: 15 },
];
