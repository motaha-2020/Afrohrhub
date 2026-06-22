/**
 * Domain types — snake_case, mirroring the SQL schema in
 * docs/02-data-model.md so swapping the mock repositories for Supabase
 * queries is a type-compatible change.
 */
import type { Role } from "@/lib/rbac/roles";

/** Standard columns shared by every table (docs/02, header). */
export interface BaseRow {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

/* ----------------------------- Enums ----------------------------- */

export type EmployeeStatus =
  | "pending"
  | "active"
  | "suspended"
  | "offboarding"
  | "archived";

export type Collar = "white" | "blue";

export type EmploymentType = "permanent" | "temporary" | "project";

export type ProjectStatus = "active" | "on_hold" | "closed";

export type DocumentStatus = "required" | "received" | "verified" | "expired";

export type DocumentAppliesTo = "all" | "engineers" | "technicians";

export type EmployeeEventType =
  | "hire"
  | "promotion"
  | "transfer"
  | "salary_change"
  | "penalty"
  | "contract_renewal"
  | "status_change";

export type HseRecordType = "medical_exam" | "safety_course";

export type HseResult = "fit" | "unfit" | "pass" | "fail";

export type PaymentMethod = "bank_transfer" | "cash" | "wallet";

/* ----------------------------- Core ------------------------------ */

export interface Tenant {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  plan: string;
  status: string;
}

export interface JobTitle extends BaseRow {
  name_ar: string;
  name_en: string;
  grade_id: string | null;
}

export interface Grade extends BaseRow {
  code: string;
}

export interface WorkLocation extends BaseRow {
  name_ar: string;
  name_en: string;
  type: "office" | "site";
}

export interface Project extends BaseRow {
  code: string;
  name_ar: string;
  name_en: string;
  status: ProjectStatus;
  project_manager_id: string | null;
  location_id: string | null;
}

/* ---------------------------- Core HR ----------------------------- */

export interface Employee extends BaseRow {
  hr_code: string;
  name_ar: string;
  name_en: string;
  national_id: string;
  mobile: string;
  personal_email: string | null;
  work_email: string | null;
  photo_path: string | null;
  job_title_id: string;
  grade_id: string | null;
  department_id: string | null;
  direct_manager_id: string | null;
  employment_type: EmploymentType;
  collar: Collar;
  hire_date: string;
  contract_signing_date: string | null;
  status: EmployeeStatus;
  social_insurance_number: string | null;
  insurance_office: string | null;
  is_rehire: boolean;
  requires_medical_exam: boolean;
  safety_sensitive_role: boolean;
}

/** 1:1 with employees — strict RLS, Policy 9 roles only. */
export interface EmployeeCompensation extends BaseRow {
  employee_id: string;
  net_salary: number;
  gross_salary: number;
  insurable_salary: number;
  /** Fixed monthly allowances, keyed by allowance code (site/transport/meal...). */
  allowances: Record<string, number>;
  bank_name: string | null;
  bank_account: string | null;
  bank_verified: boolean;
  bank_verified_by: string | null;
  bank_verified_at: string | null;
  payment_method: PaymentMethod;
}

export interface DocumentType extends BaseRow {
  name_ar: string;
  name_en: string;
  applies_to: DocumentAppliesTo;
  is_original: boolean;
  requires_expiry: boolean;
  sort_order: number;
}

export interface EmployeeDocument extends BaseRow {
  employee_id: string;
  document_type_id: string;
  file_path: string | null;
  status: DocumentStatus;
  expiry_date: string | null;
  original_received: boolean;
  received_by: string | null;
  received_at: string | null;
  original_returned_at: string | null;
  /** Free-form review note (mock convenience; maps to ai_classification jsonb later). */
  note_ar?: string;
  note_en?: string;
}

/** Append-only timeline (docs/02 `employee_events`). */
export interface EmployeeEvent extends BaseRow {
  employee_id: string;
  event_type: EmployeeEventType;
  effective_date: string;
  payload: {
    title_ar: string;
    title_en: string;
    note_ar?: string;
    note_en?: string;
  };
  attachment_path: string | null;
  approval_request_id: string | null;
}

/** Cost allocation — active allocations must total 100% (Policy 12). */
export interface ProjectAllocation extends BaseRow {
  employee_id: string;
  project_id: string;
  allocation_pct: number;
  work_location_id: string | null;
  start_date: string;
  end_date: string | null;
}

export interface HseRecord extends BaseRow {
  employee_id: string;
  type: HseRecordType;
  course_key: string | null;
  name_ar: string;
  name_en: string;
  result: HseResult;
  certificate_path: string | null;
  issued_at: string;
  expiry_date: string | null;
}

/* -------------------------- Approval Engine -------------------------- */

/** Entity types routed through the single Approval Engine (docs/05). */
export type ApprovalEntityType =
  | "hiring_request"
  | "job_offer"
  | "payroll_adjustment"
  | "final_settlement"
  | "leave_request";

export type ApprovalDecision = "approve" | "reject" | "return_for_edit";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

/** Per-step SLA derived state used for the inbox badge (docs/04). */
export type ApprovalSlaState = "on_time" | "due_soon" | "overdue";

/** A bilingual key/value line from the frozen `payload_snapshot` (docs/05). */
export interface ApprovalSummaryLine {
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
}

/**
 * One row of the approval chain — a configured `approval_step` joined with
 * its `approval_action` once decided (`decision === null` ⇒ not yet reached).
 */
export interface ApprovalStepResult {
  step_order: number;
  approver_label_ar: string;
  approver_label_en: string;
  decision: ApprovalDecision | null;
  actor_name_ar?: string;
  actor_name_en?: string;
  comment_ar?: string;
  comment_en?: string;
  at?: string;
}

/** Operational `approval_requests` row, denormalized for the inbox (docs/05). */
export interface ApprovalRequest extends BaseRow {
  entity_type: ApprovalEntityType;
  entity_id: string;
  title_ar: string;
  title_en: string;
  /** Snapshot lines describing what is being approved (immutable after send). */
  summary: ApprovalSummaryLine[];
  /** Monetary value in EGP for adjustments/settlements, when relevant. */
  amount: number | null;
  requested_by_name_ar: string;
  requested_by_name_en: string;
  requested_at: string;
  current_step: number;
  status: ApprovalStatus;
  sla_state: ApprovalSlaState;
  sla_label_ar: string;
  sla_label_en: string;
  steps: ApprovalStepResult[];
  /**
   * Roles whose decision the current step is waiting on (mock convenience;
   * resolved from `approver_type` at runtime later). Empty once resolved.
   */
  awaiting_roles: Role[];
}
