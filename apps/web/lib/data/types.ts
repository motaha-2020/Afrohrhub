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

/* --------------------------- Attendance ---------------------------- */
/* Out of manual scope — designed for construction sites (docs/modules/06). */

/** How a day's attendance was captured. */
export type AttendanceMethod = "gps" | "site_supervisor" | "manual";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "leave"
  | "assignment"
  | "weekend"
  | "holiday";

/**
 * Lifecycle of an attendance exception (unjustified absence / overtime).
 * `none` — nothing to review. `pending` — awaiting the direct manager.
 * `approved` deductions/overtime flow to Payroll Stage 5 (Policies 4 & 7).
 */
export type ExceptionStatus = "none" | "pending" | "approved" | "rejected";

export interface AttendanceRecord extends BaseRow {
  employee_id: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Local HH:mm or null when no check-in (absent / leave / weekend). */
  check_in: string | null;
  check_out: string | null;
  method: AttendanceMethod;
  /** Geofence-verified location, or null for manual / unverified entries. */
  verified_location_id: string | null;
  project_id: string | null;
  late_minutes: number;
  overtime_minutes: number;
  status: AttendanceStatus;
  exception_status: ExceptionStatus;
  exception_reason_ar: string | null;
  exception_reason_en: string | null;
}

/** Per-employee monthly roll-up that feeds the Payroll register. */
export interface AttendanceMonthSummary {
  employee_id: string;
  worked_days: number;
  absent_days: number;
  leave_days: number;
  assignment_days: number;
  late_minutes: number;
  overtime_minutes: number;
  /** Approved overtime value (EGP) added to gross at Payroll Stage 5. */
  overtime_amount: number;
  /** Approved unjustified-absence deduction (EGP), negative. */
  deduction_amount: number;
}

/* ----------------------------- Leave ------------------------------- */
/* Out of manual scope — built from Egyptian Labor Law (docs/modules/07). */

export type LeaveTypeCode =
  | "annual"
  | "casual"
  | "sick"
  | "maternity"
  | "hajj"
  | "unpaid";

/** How the leave affects pay: full, partial (sick), or none (unpaid). */
export type LeavePayRule = "paid" | "partial" | "unpaid";

export type LeaveRequestStatus =
  | "pending"
  | "manager_approved"
  | "approved"
  | "rejected"
  | "cancelled";

export interface LeaveType extends BaseRow {
  code: LeaveTypeCode;
  name_ar: string;
  name_en: string;
  /** Default yearly entitlement in days; 0 when computed per service/age. */
  annual_entitlement: number;
  pay_rule: LeavePayRule;
  /** Percentage of daily wage paid (100 / 75 / 0). */
  pay_pct: number;
  /** Special types (sick, maternity, hajj, unpaid) also need HR approval. */
  requires_hr_approval: boolean;
  note_ar: string;
  note_en: string;
}

/** A single employee's balance for one leave type (this entitlement year). */
export interface LeaveBalance {
  employee_id: string;
  type_code: LeaveTypeCode;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveRequest extends BaseRow {
  employee_id: string;
  type_code: LeaveTypeCode;
  start_date: string;
  end_date: string;
  days: number;
  reason_ar: string;
  reason_en: string;
  status: LeaveRequestStatus;
  requested_at: string;
}

/* --------------------------- Offboarding --------------------------- */
/* The manual's Part III — 6-stage exit workflow (docs/modules/04). */

/** The four exit triggers from the manual. */
export type OffboardingReason =
  | "resignation"
  | "contract_end"
  | "termination"
  | "project_end";

export type OffboardingStatus =
  | "in_progress"
  | "clearance"
  | "settlement"
  | "archived";

/** The 6 offboarding stages from the manual. */
export type OffboardingStage = 1 | 2 | 3 | 4 | 5 | 6;

/** Departments that sign off the Stage-4 clearance matrix. */
export type ClearanceDept =
  | "it"
  | "operations_admin"
  | "finance"
  | "direct_manager";

export type ClearanceStatus = "pending" | "cleared" | "blocked";

/** One line of the digital clearance form, owned by a department. */
export interface ClearanceItem {
  id: string;
  dept: ClearanceDept;
  label_ar: string;
  label_en: string;
  status: ClearanceStatus;
}

/**
 * Stage-5 final settlement (Policy 13 — Finance approval before payout).
 * Leave encashment is fed from the Leave module's unused annual balance.
 */
export interface FinalSettlement {
  /** Final-month salary, prorated to the last working day. */
  last_salary: number;
  /** Unused annual-leave days carried from the Leave module. */
  unused_leave_days: number;
  /** Daily wage = comprehensive monthly wage / 30. */
  daily_rate: number;
  /** unused_leave_days × daily_rate. */
  leave_encashment: number;
  /** Other dues (e.g. end-of-assignment bonus). */
  other_dues: number;
  /** Outstanding advances / loans / custody recovered (from advances_loans). */
  deductions: number;
  deduction_note_ar: string;
  deduction_note_en: string;
  /** last_salary + leave_encashment + other_dues − deductions. */
  net_settlement: number;
  /** Finance gate — payout is blocked until true (Policy 13). */
  finance_approved: boolean;
}

export interface OffboardingCase extends BaseRow {
  case_code: string;
  /** Core HR employee being offboarded (self-contained name fields too). */
  employee_id: string;
  employee_name_ar: string;
  employee_name_en: string;
  hr_code: string;
  job_title_ar: string;
  job_title_en: string;
  project_id: string;
  reason: OffboardingReason;
  initiated_at: string;
  last_working_day: string;
  priority: SlaPriority;
  status: OffboardingStatus;
  current_stage: OffboardingStage;
  /** Stage 2 — all access deactivated by the last working day. */
  access_revoked: boolean;
  /** Stage 3 — knowledge/task handover approved by the direct manager. */
  handover_approved: boolean;
  /** Stage 5 — exit interview captured. */
  exit_interview_done: boolean;
  /** Stage 5 — Social Insurance Form (6) filed. */
  si_form6_filed: boolean;
  /** Stage 6 — original documents returned with a signed receipt. */
  originals_returned: boolean;
  clearance: ClearanceItem[];
  settlement: FinalSettlement;
}

/* ----------------------- Notification channels --------------------- */
/* The multi-channel messaging engine (docs/modules/09-notifications). */

/** Delivery channels — WhatsApp/SMS are first-class (blue-collar reach). */
export type NotificationChannel = "in_app" | "email" | "whatsapp" | "sms";

/** WhatsApp templates must be pre-registered & approved with Meta. */
export type TemplateRegistrationStatus =
  | "approved"
  | "pending"
  | "not_required";

export type NotificationDeliveryStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "failed";

/** The source module an event belongs to (for grouping templates). */
export type NotificationModule =
  | "recruitment"
  | "onboarding"
  | "offboarding"
  | "payroll"
  | "documents"
  | "approvals"
  | "attendance";

/**
 * A bilingual message template for one event on one channel. Variables
 * such as {{employee_name}} are interpolated at send time; HR Managers
 * edit these and WhatsApp variants are registered with Meta beforehand.
 */
export interface NotificationTemplate extends BaseRow {
  event_key: string;
  module: NotificationModule;
  channel: NotificationChannel;
  name_ar: string;
  name_en: string;
  /** Template body with {{variable}} placeholders. */
  body_ar: string;
  body_en: string;
  /** Placeholder names available to this template (without braces). */
  variables: string[];
  registration_status: TemplateRegistrationStatus;
  /** Critical events bypass the daily digest and send immediately. */
  critical: boolean;
  active: boolean;
}

/** Per-channel delivery counters for the send-monitor dashboard. */
export interface ChannelDeliveryStat {
  channel: NotificationChannel;
  sent: number;
  delivered: number;
  failed: number;
}

/* ----------------------------- AI Layer ---------------------------- */
/* Claude API features (Session 11) — docs/07-roadmap.md. */

/** Document types the classifier can auto-tag on upload. */
export type DocClass =
  | "national_id"
  | "passport"
  | "qualification"
  | "contract"
  | "criminal_record"
  | "medical_report"
  | "syndicate_card"
  | "driving_license"
  | "other";

/** OCR extraction from a national ID / passport (auto-fills Core HR). */
export interface IdExtraction {
  name_ar: string;
  name_en: string;
  national_id: string;
  birth_date: string;
  gender: "male" | "female" | "";
  address: string;
  issue_date: string | null;
  expiry_date: string | null;
  /** 0–100 — surfaced so reviewers know when to double-check. */
  confidence: number;
}

export interface DocClassification {
  doc_class: DocClass;
  confidence: number;
  rationale_ar: string;
  rationale_en: string;
}

/** Structured candidate profile parsed from a raw CV. */
export interface ParsedCv {
  name_en: string;
  name_ar: string;
  title_en: string;
  years_experience: number;
  skills: string[];
  certifications: string[];
  education: string;
  summary_en: string;
}

/** Candidate ↔ job match score with explainable strengths / gaps. */
export interface MatchResult {
  match_pct: number;
  strengths: string[];
  gaps: string[];
  rationale_en: string;
  rationale_ar: string;
}

/** One ranked hit from semantic search across records / documents. */
export interface SearchHit {
  id: string;
  label: string;
  score: number;
  reason: string;
}
