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

/* ---------------------- Engines & Notifications ---------------------- */

export type NotificationType =
  | "approval_requested"
  | "approval_done"
  | "sla_warning"
  | "sla_breach"
  | "document_expiring"
  | "onboarding_task";

export interface Notification extends BaseRow {
  user_id: string;
  type: NotificationType;
  title_ar: string;
  title_en: string;
  body_ar: string | null;
  body_en: string | null;
  link: string | null;
  read_at: string | null;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "delegated";

export type ApprovalModule =
  | "recruitment"
  | "leave"
  | "advance"
  | "offboarding_settlement"
  | "salary_change"
  | "penalty"
  | "onboarding";

export interface ApprovalTask extends BaseRow {
  module: ApprovalModule;
  subject_ar: string;
  subject_en: string;
  requested_by_name_ar: string;
  requested_by_name_en: string;
  requested_at: string;
  sla_deadline: string;
  sla_hours_remaining: number;
  sla_priority: "P0" | "P1";
  status: ApprovalStatus;
  comment: string | null;
}

export type SlaPriority = "P0" | "P1";

/* --------------------------- Onboarding ---------------------------- */

export type OnboardingStatus =
  | "open"
  | "in_progress"
  | "activated"
  | "cancelled";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "blocked"
  | "skipped";

/** The 9 onboarding stages from the manual (docs/modules/03-onboarding.md). */
export type OnboardingStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type OnboardingOwnerRole =
  | "talent_acquisition"
  | "personnel"
  | "it"
  | "hse"
  | "operations_admin"
  | "hr_manager";

export interface OnboardingTask extends BaseRow {
  case_id: string;
  stage: OnboardingStage;
  task_key: string;
  title_ar: string;
  title_en: string;
  owner_role: OnboardingOwnerRole;
  due_date: string | null;
  status: TaskStatus;
  completed_at: string | null;
}

/** The 14 mandatory fields of the manual's Hiring Email (Stage 1). */
export interface HiringEmail {
  name_en: string;
  name_ar: string;
  national_id: string;
  mobile: string;
  job_title: string;
  project_code: string;
  project_name: string;
  direct_manager: string;
  work_location: string;
  net_salary: number;
  allowances: string;
  social_insurance_number: string;
  contract_signing_date: string | null;
  joining_date: string;
}

export interface OnboardingCase extends BaseRow {
  case_code: string;
  job_offer_id: string | null;
  candidate_name_ar: string;
  candidate_name_en: string;
  job_title_ar: string;
  job_title_en: string;
  project_id: string;
  joining_date: string;
  priority: SlaPriority;
  status: OnboardingStatus;
  /** Furthest stage that has at least one task in progress / done. */
  current_stage: OnboardingStage;
  safety_sensitive_role: boolean;
  requires_medical_exam: boolean;
  hiring_email: HiringEmail;
  activated_at: string | null;
}

/** The six activation-gate conditions of Stage 9 (app.fn_can_activate). */
export type ActivationConditionKey =
  | "documents_complete"
  | "contracts_signed"
  | "hse_requirements"
  | "medical_exam"
  | "systems_ready"
  | "certificates_valid";

export interface ActivationCondition {
  key: ActivationConditionKey;
  met: boolean;
  /** Owner role responsible for clearing it (for the missing-items list). */
  owner_role: OnboardingOwnerRole;
}

/* --------------------------- Recruitment --------------------------- */

/** The 8 pipeline stages from the manual (docs/modules/02-recruitment.md). */
export type RecruitmentStage =
  | "hiring_request"
  | "sourcing_screening"
  | "requester_review"
  | "interviews"
  | "final_selection"
  | "offer_issuance"
  | "offer_acceptance"
  | "handover";

export const RECRUITMENT_STAGES: RecruitmentStage[] = [
  "hiring_request",
  "sourcing_screening",
  "requester_review",
  "interviews",
  "final_selection",
  "offer_issuance",
  "offer_acceptance",
  "handover",
];

export type HiringRequestStatus =
  | "pending_approval"
  | "approved"
  | "in_progress"
  | "filled"
  | "cancelled";

export type HiringRequestType = "new_position" | "replacement";

export type WorkplaceType = "office" | "site";

export interface HiringRequest extends BaseRow {
  request_code: string;
  job_title_ar: string;
  job_title_en: string;
  openings: number;
  filled: number;
  project_id: string;
  direct_manager_name_ar: string;
  direct_manager_name_en: string;
  workplace: WorkplaceType;
  salary_min: number;
  salary_max: number;
  qualifications_ar: string;
  qualifications_en: string;
  priority: SlaPriority;
  request_type: HiringRequestType;
  /** Replacement only — validated against Core HR. */
  replaced_hr_code: string | null;
  replaced_employee_name_ar: string | null;
  replaced_employee_name_en: string | null;
  status: HiringRequestStatus;
  requested_by_name_ar: string;
  requested_by_name_en: string;
  requested_at: string;
}

export type CandidateSource =
  | "talent_pool"
  | "referral"
  | "job_board"
  | "agency"
  | "walk_in";

export type CandidateStatus = "active" | "rejected" | "handed_over";

/** Digital evaluation forms — Stage 4 (technical / HSE / HR). */
export interface CandidateEvaluation {
  /** 1–5 per the manual's scoring forms. */
  technical: number | null;
  /** Safety-sensitive roles only. */
  hse: number | null;
  hr: number | null;
  recommendation_ar: string | null;
  recommendation_en: string | null;
}

export interface Candidate extends BaseRow {
  hiring_request_id: string;
  name_ar: string;
  name_en: string;
  mobile: string;
  email: string | null;
  source: CandidateSource;
  years_experience: number;
  /** Phone-screen salary expectation — auto-compared to the approved range. */
  expected_salary: number;
  /** Notice period / availability in days. */
  readiness_days: number;
  /** AI matching score (Session 11 fills this for real). */
  match_pct: number;
  stage: RecruitmentStage;
  stage_entered_at: string;
  sla_hours_remaining: number;
  status: CandidateStatus;
  rejection_reason_ar: string | null;
  rejection_reason_en: string | null;
  evaluation: CandidateEvaluation;
}

export type OfferStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export interface JobOffer extends BaseRow {
  candidate_id: string;
  status: OfferStatus;
  offered_salary: number;
  proposed_start_date: string;
  sent_at: string | null;
  /** 30 calendar days from sending (manual hard limit). */
  expires_at: string | null;
  responded_at: string | null;
  /** Public acceptance-page token (no-login link sent to the candidate). */
  token: string;
}

/** Searchable CV bank — Stage 2 sourcing (semantic search in Session 11). */
export interface TalentPoolEntry extends BaseRow {
  name_ar: string;
  name_en: string;
  title_ar: string;
  title_en: string;
  years_experience: number;
  skills: string[];
  expected_salary: number | null;
  mobile: string;
  source: CandidateSource;
  last_contacted_at: string | null;
  cv_path: string | null;
}
export type SlaStatus = "on_time" | "warning" | "breach";
export type SlaModule =
  | "recruitment"
  | "onboarding"
  | "payroll"
  | "leave"
  | "offboarding"
  | "advance";

export interface SlaItem extends BaseRow {
  module: SlaModule;
  subject_ar: string;
  subject_en: string;
  priority: SlaPriority;
  deadline: string;
  sla_status: SlaStatus;
  owner_name_ar: string;
  owner_name_en: string;
  hours_remaining: number;
}

/* ----------------------------- Payroll ----------------------------- */

export type PayrollCycleStatus =
  | "new_hires"
  | "validation"
  | "register_updated"
  | "allocations_review"
  | "adjustments"
  | "processing"
  | "submitted_to_finance"
  | "paid"
  | "cost_reported";

export type PayrollItemStatus = "draft" | "validated" | "processed" | "paid";

export type AdjustmentType =
  | "medical_deduction"
  | "insurance_update"
  | "advance"
  | "loan_deduction"
  | "reimbursement"
  | "correction";

export interface PayrollComponents {
  basic_salary: number;
  allowances: Record<string, number>;
}

export interface PayrollCycle extends BaseRow {
  month: string;
  status: PayrollCycleStatus;
  deadline_at: string | null;
  locked: boolean;
  employee_count: number;
  total_gross: number;
  total_net: number;
}

export interface PayrollItem extends BaseRow {
  cycle_id: string;
  employee_id: string;
  gross: number;
  net: number;
  taxes: number;
  social_insurance: number;
  components: PayrollComponents;
  status: PayrollItemStatus;
}

export interface PayrollAdjustment extends BaseRow {
  cycle_id: string;
  employee_id: string;
  type: AdjustmentType;
  amount: number;
  label_ar: string;
  label_en: string;
  supporting_doc_path: string;
  approval_request_id: string;
}

/* --------------------------- Allowances ---------------------------- */

export type AllowanceCycleStatus =
  | "request_collection"
  | "preparation"
  | "validation"
  | "finance_submission"
  | "payment"
  | "cost_reporting";

export type AllowanceItemStatus = "draft" | "submitted" | "validated" | "paid";

export interface AllowanceCycle extends BaseRow {
  month: string;
  status: AllowanceCycleStatus;
  deadline_at: string | null;
  locked: boolean;
  total_amount: number;
  project_count: number;
  employee_count: number;
}

export interface AllowanceEntry extends BaseRow {
  cycle_id: string;
  project_id: string;
  employee_id: string;
  site_allowance: number;
  transport_allowance: number;
  meal_allowance: number;
  total: number;
  submitted_by_ar: string;
  submitted_by_en: string;
  bank_verified: boolean;
  status: AllowanceItemStatus;
}

/* ------------------------------ KPI -------------------------------- */

export type KpiCycleStatus =
  | "evaluation_receipt"
  | "bonus_calculation"
  | "validation"
  | "finance_submission"
  | "payment"
  | "cost_reporting";

export type KpiScoreStatus = "draft" | "submitted" | "approved" | "paid";

export interface KpiCycle extends BaseRow {
  quarter: string;
  quarter_start: string;
  status: KpiCycleStatus;
  deadline_at: string | null;
  locked: boolean;
  total_bonus: number;
  employee_count: number;
}

export interface KpiScore extends BaseRow {
  cycle_id: string;
  employee_id: string;
  project_id: string;
  score: number;
  bonus_amount: number;
  evaluated_by_ar: string;
  evaluated_by_en: string;
  evaluation_date: string;
  status: KpiScoreStatus;
}

/* -------------------------- Cost Reports --------------------------- */

export interface ProjectCostLine {
  project_id: string;
  payroll_cost: number;
  allowance_cost: number;
  kpi_cost: number;
  total_cost: number;
  employee_count: number;
  allocation_pct_sum: number;
}

export interface CostReport extends BaseRow {
  month: string;
  total_payroll: number;
  total_allowances: number;
  total_kpi: number;
  total_cost: number;
  lines: ProjectCostLine[];
  status: "draft" | "final";
}
