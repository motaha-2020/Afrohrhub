/**
 * Domain types — snake_case, mirroring the SQL schema in
 * docs/02-data-model.md so swapping the mock repositories for Supabase
 * queries is a type-compatible change.
 */

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
