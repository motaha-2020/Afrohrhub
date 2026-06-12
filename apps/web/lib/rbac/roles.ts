/**
 * The 13 system roles — docs/03-rbac-permissions.md.
 * A user may hold several roles (`users.roles text[]`); effective permission
 * is the union of their roles. UI checks here are convenience only — the
 * real enforcement lives in Postgres RLS policies.
 */
export type Role =
  | "super_admin"
  | "company_admin"
  | "hr_manager"
  | "talent_acquisition"
  | "personnel"
  | "payroll"
  | "finance"
  | "hse"
  | "it"
  | "operations_admin"
  | "pmo"
  | "direct_manager"
  | "employee";

export const ALL_ROLES: Role[] = [
  "super_admin",
  "company_admin",
  "hr_manager",
  "talent_acquisition",
  "personnel",
  "payroll",
  "finance",
  "hse",
  "it",
  "operations_admin",
  "pmo",
  "direct_manager",
  "employee",
];

/** Roles allowed to read `employee_compensation` (Policy 9). */
const COMPENSATION_ROLES: ReadonlySet<Role> = new Set([
  "payroll",
  "hr_manager",
  "finance",
  "company_admin",
]);

export function hasAnyRole(
  userRoles: readonly Role[],
  allowed: readonly Role[] | "all"
): boolean {
  if (allowed === "all") return true;
  return userRoles.some((role) => allowed.includes(role));
}

/**
 * Field-level salary confidentiality (Policy 9): Payroll, HR Manager,
 * Finance and Company Admin only. Even Personnel — who owns the employee
 * file — must not see compensation.
 */
export function canViewCompensation(userRoles: readonly Role[]): boolean {
  return userRoles.some((role) => COMPENSATION_ROLES.has(role));
}
