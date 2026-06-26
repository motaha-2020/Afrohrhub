/**
 * Mock data for the lifecycle / engine modules (approvals, SLA,
 * recruitment, onboarding, offboarding, payroll, attendance, leave).
 *
 * These mirror the approved demo (demo/afrohrhub-demo.html) and the module
 * docs under docs/modules/. Like the Core-HR seed, every shape is
 * snake_case and bilingual so swapping to Supabase queries later is a
 * type-compatible change. Figures here are illustrative, not authoritative.
 */

import { DEMO_TODAY } from "./seed";

export const TODAY = DEMO_TODAY; // "2026-06-12"

/* =============================== Approvals ============================== */

export type ApprovalPriority = "P0" | "P1" | "P2";
export type ApprovalState = "pending" | "approved" | "rejected" | "escalated";
export type SlaTone = "ok" | "warn" | "breach";

export interface ApprovalRequest {
  id: string;
  ref: string;
  type_ar: string;
  type_en: string;
  subject_ar: string;
  subject_en: string;
  requested_by_ar: string;
  requested_by_en: string;
  current_step_ar: string;
  current_step_en: string;
  priority: ApprovalPriority;
  state: ApprovalState;
  /** Hours left on the active SLA timer (negative = breached). */
  sla_hours_left: number;
  sla_tone: SlaTone;
  submitted_at: string;
}

export const APPROVALS: ApprovalRequest[] = [
  {
    id: "apr-2210",
    ref: "APR-2210",
    type_ar: "ترقية + علاوة",
    type_en: "Promotion + raise",
    subject_ar: "أحمد عبد الحليم سعد — الدرجة E3",
    subject_en: "Ahmed Abdel Halim Saad — Grade E3",
    requested_by_ar: "وليد الجندي (مدير المشروع)",
    requested_by_en: "Walid El-Gendy (Project Manager)",
    current_step_ar: "بانتظار: مدير الموارد البشرية",
    current_step_en: "Awaiting: HR Manager",
    priority: "P1",
    state: "pending",
    sla_hours_left: 6,
    sla_tone: "warn",
    submitted_at: "2026-06-11",
  },
  {
    id: "apr-2231",
    ref: "APR-2231",
    type_ar: "طلب توظيف",
    type_en: "Hiring request",
    subject_ar: "مهندس ميكانيكا موقع — مشروع بنبان (×2)",
    subject_en: "Mechanical Site Engineer — Benban (×2)",
    requested_by_ar: "سارة عادل (PMO)",
    requested_by_en: "Sara Adel (PMO)",
    current_step_ar: "بانتظار: company_admin",
    current_step_en: "Awaiting: Company Admin",
    priority: "P0",
    state: "escalated",
    sla_hours_left: -3,
    sla_tone: "breach",
    submitted_at: "2026-06-09",
  },
  {
    id: "apr-2240",
    ref: "APR-2240",
    type_ar: "سلفة على الراتب",
    type_en: "Salary advance",
    subject_ar: "كريم فوزي الشناوي — 8,000 ج.م",
    subject_en: "Karim Fawzy El-Shenawy — EGP 8,000",
    requested_by_ar: "كريم فوزي (عبر ESS)",
    requested_by_en: "Karim Fawzy (via ESS)",
    current_step_ar: "بانتظار: Finance",
    current_step_en: "Awaiting: Finance",
    priority: "P2",
    state: "pending",
    sla_hours_left: 31,
    sla_tone: "ok",
    submitted_at: "2026-06-11",
  },
  {
    id: "apr-2248",
    ref: "APR-2248",
    type_ar: "طلب إجازة سنوية",
    type_en: "Annual leave request",
    subject_ar: "محمود سيد النجار — 5 أيام (15–19/06)",
    subject_en: "Mahmoud El-Naggar — 5 days (15–19 Jun)",
    requested_by_ar: "محمود سيد (عبر ESS)",
    requested_by_en: "Mahmoud Sayed (via ESS)",
    current_step_ar: "بانتظار: المدير المباشر",
    current_step_en: "Awaiting: Direct Manager",
    priority: "P2",
    state: "pending",
    sla_hours_left: 19,
    sla_tone: "ok",
    submitted_at: "2026-06-12",
  },
  {
    id: "apr-2199",
    ref: "APR-2199",
    type_ar: "تسوية نهائية",
    type_en: "Final settlement",
    subject_ar: "خالد منصور إبراهيم — إنهاء خدمة",
    subject_en: "Khaled Mansour Ibrahim — Offboarding",
    requested_by_ar: "Personnel",
    requested_by_en: "Personnel",
    current_step_ar: "بانتظار: Finance ← Payroll",
    current_step_en: "Awaiting: Finance ← Payroll",
    priority: "P1",
    state: "pending",
    sla_hours_left: 14,
    sla_tone: "warn",
    submitted_at: "2026-06-10",
  },
  {
    id: "apr-2150",
    ref: "APR-2150",
    type_ar: "اعتماد دورة الرواتب",
    type_en: "Payroll cycle approval",
    subject_ar: "كشف يونيو 2026 — 3,247 موظف",
    subject_en: "June 2026 run — 3,247 employees",
    requested_by_ar: "Payroll",
    requested_by_en: "Payroll",
    current_step_ar: "اعتُمد بالكامل",
    current_step_en: "Fully approved",
    priority: "P1",
    state: "approved",
    sla_hours_left: 0,
    sla_tone: "ok",
    submitted_at: "2026-06-08",
  },
];

export const APPROVAL_KPIS = {
  awaiting_me: 4,
  breached: 1,
  due_today: 2,
  approved_this_week: 27,
} as const;

/* ============================= SLA Engine ============================== */

export interface SlaMetric {
  key: string;
  name_ar: string;
  name_en: string;
  priority: ApprovalPriority;
  target_ar: string;
  target_en: string;
  open: number;
  breached: number;
  /** On-time percentage over the trailing window. */
  on_time_pct: number;
}

export const SLA_METRICS: SlaMetric[] = [
  {
    key: "hiring_screening",
    name_ar: "فرز طلبات التوظيف",
    name_en: "Hiring request screening",
    priority: "P1",
    target_ar: "5 أيام عمل",
    target_en: "5 working days",
    open: 14,
    breached: 1,
    on_time_pct: 92,
  },
  {
    key: "onboarding_activation",
    name_ar: "تفعيل الموظف الجديد",
    name_en: "New-hire activation",
    priority: "P0",
    target_ar: "10 أيام عمل",
    target_en: "10 working days",
    open: 23,
    breached: 2,
    on_time_pct: 88,
  },
  {
    key: "leave_decision",
    name_ar: "قرار طلب الإجازة",
    name_en: "Leave request decision",
    priority: "P2",
    target_ar: "48 ساعة عمل",
    target_en: "48 working hours",
    open: 9,
    breached: 0,
    on_time_pct: 97,
  },
  {
    key: "advance_decision",
    name_ar: "قرار السلفة",
    name_en: "Salary advance decision",
    priority: "P2",
    target_ar: "72 ساعة عمل",
    target_en: "72 working hours",
    open: 3,
    breached: 0,
    on_time_pct: 100,
  },
  {
    key: "offboarding_clearance",
    name_ar: "إخلاء طرف الخروج",
    name_en: "Offboarding clearance",
    priority: "P1",
    target_ar: "آخر يوم عمل",
    target_en: "By last working day",
    open: 12,
    breached: 1,
    on_time_pct: 90,
  },
  {
    key: "final_settlement",
    name_ar: "التسوية النهائية",
    name_en: "Final settlement",
    priority: "P1",
    target_ar: "دورة الرواتب التالية",
    target_en: "Next payroll cycle",
    open: 4,
    breached: 0,
    on_time_pct: 95,
  },
];

export const SLA_KPIS = {
  open_total: 65,
  breached_total: 4,
  on_time_pct: 93,
  escalations_week: 3,
} as const;

/* ============================ Recruitment ============================= */

export type PipelineStageKey =
  | "request"
  | "sourcing"
  | "screening"
  | "interview"
  | "offer"
  | "handover";

export interface PipelineStage {
  key: PipelineStageKey;
  name_ar: string;
  name_en: string;
  count: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { key: "request", name_ar: "طلب معتمد", name_en: "Approved request", count: 14 },
  { key: "sourcing", name_ar: "بحث وترشيح", name_en: "Sourcing", count: 58 },
  { key: "screening", name_ar: "فرز", name_en: "Screening", count: 31 },
  { key: "interview", name_ar: "مقابلات", name_en: "Interviews", count: 12 },
  { key: "offer", name_ar: "عرض", name_en: "Offer", count: 5 },
  { key: "handover", name_ar: "تسليم للـ Onboarding", name_en: "Handover", count: 3 },
];

export interface Candidate {
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  project_ar: string;
  project_en: string;
  stage: PipelineStageKey;
  match_pct: number;
  source_ar: string;
  source_en: string;
  updated_at: string;
}

export const CANDIDATES: Candidate[] = [
  {
    id: "cand-101",
    name_ar: "هاني صلاح الدين",
    name_en: "Hany Salah",
    role_ar: "مهندس ميكانيكا موقع",
    role_en: "Mechanical Site Engineer",
    project_ar: "محطة بنبان",
    project_en: "Benban Substation",
    stage: "offer",
    match_pct: 94,
    source_ar: "Talent Pool",
    source_en: "Talent Pool",
    updated_at: "2026-06-11",
  },
  {
    id: "cand-102",
    name_ar: "منة الله رضا",
    name_en: "Mennatallah Reda",
    role_ar: "مهندسة تخطيط",
    role_en: "Planning Engineer",
    project_ar: "أبراج العلمين",
    project_en: "Alamein Towers",
    stage: "interview",
    match_pct: 88,
    source_ar: "LinkedIn",
    source_en: "LinkedIn",
    updated_at: "2026-06-10",
  },
  {
    id: "cand-103",
    name_ar: "عبد الرحمن فتحي",
    name_en: "Abdelrahman Fathy",
    role_ar: "لحّام أرجون",
    role_en: "Argon Welder",
    project_ar: "مصنع السخنة",
    project_en: "Sokhna Plant",
    stage: "screening",
    match_pct: 81,
    source_ar: "إحالة موظف",
    source_en: "Employee referral",
    updated_at: "2026-06-12",
  },
  {
    id: "cand-104",
    name_ar: "ياسمين أحمد كمال",
    name_en: "Yasmin Ahmed Kamal",
    role_ar: "محاسبة موقع",
    role_en: "Site Accountant",
    project_ar: "كوبري أسيوط",
    project_en: "Assiut Bridge",
    stage: "interview",
    match_pct: 79,
    source_ar: "موقع التوظيف",
    source_en: "Careers page",
    updated_at: "2026-06-09",
  },
  {
    id: "cand-105",
    name_ar: "محمد جمال عبد الله",
    name_en: "Mohamed Gamal",
    role_ar: "ريجر",
    role_en: "Rigger",
    project_ar: "محطة بنبان",
    project_en: "Benban Substation",
    stage: "handover",
    match_pct: 90,
    source_ar: "Talent Pool",
    source_en: "Talent Pool",
    updated_at: "2026-06-08",
  },
  {
    id: "cand-106",
    name_ar: "نور هشام",
    name_en: "Nour Hesham",
    role_ar: "فني كهرباء",
    role_en: "Electrical Technician",
    project_ar: "مصنع السخنة",
    project_en: "Sokhna Plant",
    stage: "sourcing",
    match_pct: 72,
    source_ar: "إعلان وظيفة",
    source_en: "Job ad",
    updated_at: "2026-06-12",
  },
];

export const RECRUITMENT_KPIS = {
  open_requests: 14,
  active_candidates: 109,
  offers_out: 5,
  avg_time_to_hire_days: 27,
} as const;

/* ============================== Onboarding ============================= */

export interface OnboardingCase {
  id: string;
  employee_id: string | null;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  /** 1..9 — docs/modules/03-onboarding.md */
  stage: number;
  stage_label_ar: string;
  stage_label_en: string;
  priority: ApprovalPriority;
  sla_days_left: number;
  sla_tone: SlaTone;
  /** Activation conditions met out of 6. */
  conditions_met: number;
  start_date: string;
}

export const ONBOARDING_STAGE_LABELS: { ar: string; en: string }[] = [
  { ar: "قبول العرض", en: "Offer accepted" },
  { ar: "خطاب التعيين", en: "Hiring email" },
  { ar: "تجهيز الملف", en: "File preparation" },
  { ar: "استلام المستندات", en: "Documents collection" },
  { ar: "العقد والتوقيع", en: "Contract & signing" },
  { ar: "التأمينات", en: "Social insurance" },
  { ar: "متطلبات الـ HSE", en: "HSE requirements" },
  { ar: "تجهيز الحسابات والعهدة", en: "Accounts & assets" },
  { ar: "التفعيل", en: "Activation" },
];

export const ONBOARDING_CASES: OnboardingCase[] = [
  {
    id: "onb-004",
    employee_id: "emp-004",
    name_ar: "أحمد رجب عطية",
    name_en: "Ahmed Ragab Attia",
    role_ar: "ريجر CM/PM",
    role_en: "CM/PM Rigger",
    stage: 7,
    stage_label_ar: "متطلبات الـ HSE",
    stage_label_en: "HSE requirements",
    priority: "P0",
    sla_days_left: 3,
    sla_tone: "warn",
    conditions_met: 4,
    start_date: "2026-06-01",
  },
  {
    id: "onb-201",
    employee_id: null,
    name_ar: "محمد جمال عبد الله",
    name_en: "Mohamed Gamal",
    role_ar: "ريجر",
    role_en: "Rigger",
    stage: 2,
    stage_label_ar: "خطاب التعيين",
    stage_label_en: "Hiring email",
    priority: "P0",
    sla_days_left: 9,
    sla_tone: "ok",
    conditions_met: 1,
    start_date: "2026-06-09",
  },
  {
    id: "onb-202",
    employee_id: null,
    name_ar: "هاني صلاح الدين",
    name_en: "Hany Salah",
    role_ar: "مهندس ميكانيكا موقع",
    role_en: "Mechanical Site Engineer",
    stage: 4,
    stage_label_ar: "استلام المستندات",
    stage_label_en: "Documents collection",
    priority: "P0",
    sla_days_left: 6,
    sla_tone: "ok",
    conditions_met: 2,
    start_date: "2026-06-05",
  },
  {
    id: "onb-203",
    employee_id: null,
    name_ar: "ياسمين أحمد كمال",
    name_en: "Yasmin Ahmed Kamal",
    role_ar: "محاسبة موقع",
    role_en: "Site Accountant",
    stage: 9,
    stage_label_ar: "التفعيل",
    stage_label_en: "Activation",
    priority: "P0",
    sla_days_left: 1,
    sla_tone: "warn",
    conditions_met: 6,
    start_date: "2026-05-30",
  },
];

export const ONBOARDING_KPIS = {
  in_progress: 23,
  ready_to_activate: 9,
  hse_pending: 6,
  overdue: 2,
} as const;

/* ============================= Offboarding ============================ */

export interface ClearanceItem {
  key: string;
  name_ar: string;
  name_en: string;
  owner_ar: string;
  owner_en: string;
  done: boolean;
}

export interface OffboardingCase {
  id: string;
  employee_id: string;
  name_ar: string;
  name_en: string;
  reason_ar: string;
  reason_en: string;
  /** 1..6 — docs/modules/04-offboarding.md */
  stage: number;
  stage_label_ar: string;
  stage_label_en: string;
  last_working_day: string;
  access_cut: boolean;
  clearance: ClearanceItem[];
  final_settlement_egp: number;
  settlement_state: "pending" | "approved" | "paid";
}

export const OFFBOARDING_STAGE_LABELS: { ar: string; en: string }[] = [
  { ar: "فتح الحالة", en: "Case opened" },
  { ar: "قطع الصلاحيات", en: "Access cutoff" },
  { ar: "إخلاء الطرف", en: "Clearance" },
  { ar: "رد العهدة", en: "Asset return" },
  { ar: "التسوية النهائية", en: "Final settlement" },
  { ar: "الأرشفة", en: "Archival" },
];

export const OFFBOARDING_CASES: OffboardingCase[] = [
  {
    id: "off-005",
    employee_id: "emp-005",
    name_ar: "خالد منصور إبراهيم",
    name_en: "Khaled Mansour Ibrahim",
    reason_ar: "استقالة (عبر ESS)",
    reason_en: "Resignation (via ESS)",
    stage: 3,
    stage_label_ar: "إخلاء الطرف",
    stage_label_en: "Clearance",
    last_working_day: "2026-06-19",
    access_cut: true,
    clearance: [
      { key: "it", name_ar: "تقنية المعلومات", name_en: "IT", owner_ar: "IT", owner_en: "IT", done: true },
      { key: "finance", name_ar: "المالية — السلف", name_en: "Finance — advances", owner_ar: "Finance", owner_en: "Finance", done: true },
      { key: "assets", name_ar: "العهدة (3 أصناف)", name_en: "Assets (3 items)", owner_ar: "Operations", owner_en: "Operations", done: false },
      { key: "hse", name_ar: "السلامة — المعدات", name_en: "HSE — PPE", owner_ar: "HSE", owner_en: "HSE", done: false },
      { key: "hr", name_ar: "الموارد البشرية", name_en: "HR", owner_ar: "HR", owner_en: "HR", done: false },
    ],
    final_settlement_egp: 41250,
    settlement_state: "pending",
  },
];

export const OFFBOARDING_KPIS = {
  open_cases: 12,
  due_this_week: 3,
  pending_clearance: 7,
  pending_settlement: 4,
} as const;

/* =============================== Payroll ============================== */

export type PayrollStageKey =
  | "open"
  | "inputs"
  | "variable"
  | "calc"
  | "review"
  | "hr_approve"
  | "finance_approve"
  | "disburse"
  | "payslips";

export interface PayrollStage {
  key: PayrollStageKey;
  name_ar: string;
  name_en: string;
}

export const PAYROLL_STAGES: PayrollStage[] = [
  { key: "open", name_ar: "فتح الدورة", name_en: "Open cycle" },
  { key: "inputs", name_ar: "إدخال الثوابت", name_en: "Fixed inputs" },
  { key: "variable", name_ar: "المتغيرات والسلف", name_en: "Variables & advances" },
  { key: "calc", name_ar: "الحساب", name_en: "Calculation" },
  { key: "review", name_ar: "المراجعة", name_en: "Review" },
  { key: "hr_approve", name_ar: "اعتماد HR", name_en: "HR approval" },
  { key: "finance_approve", name_ar: "اعتماد المالية", name_en: "Finance approval" },
  { key: "disburse", name_ar: "الصرف", name_en: "Disbursement" },
  { key: "payslips", name_ar: "قسائم الرواتب", name_en: "Payslips" },
];

export interface PayrollCycle {
  id: string;
  period_ar: string;
  period_en: string;
  /** index into PAYROLL_STAGES of the current stage */
  current_stage: number;
  headcount: number;
  gross_egp: number;
  deductions_egp: number;
  net_egp: number;
  insurance_egp: number;
  tax_egp: number;
  window_ar: string;
  window_en: string;
}

export const CURRENT_PAYROLL: PayrollCycle = {
  id: "pay-2026-06",
  period_ar: "يونيو 2026",
  period_en: "June 2026",
  current_stage: 4,
  headcount: 3247,
  gross_egp: 58420000,
  deductions_egp: 9870000,
  net_egp: 48550000,
  insurance_egp: 4120000,
  tax_egp: 3950000,
  window_ar: "20–23 يونيو",
  window_en: "20–23 Jun",
};

export interface PayrollProjectCost {
  project_ar: string;
  project_en: string;
  headcount: number;
  cost_egp: number;
  pct: number;
}

export const PAYROLL_BY_PROJECT: PayrollProjectCost[] = [
  { project_ar: "محطة بنبان", project_en: "Benban Substation", headcount: 1120, cost_egp: 18600000, pct: 38 },
  { project_ar: "أبراج العلمين", project_en: "Alamein Towers", headcount: 846, cost_egp: 13200000, pct: 27 },
  { project_ar: "كوبري أسيوط", project_en: "Assiut Bridge", headcount: 633, cost_egp: 8900000, pct: 18 },
  { project_ar: "مصنع السخنة", project_en: "Sokhna Plant", headcount: 451, cost_egp: 5400000, pct: 11 },
  { project_ar: "المكتب الرئيسي", project_en: "Head Office", headcount: 197, cost_egp: 2450000, pct: 6 },
];

/* =========================== Attendance ============================== */

export type AttendanceState = "present" | "late" | "absent" | "leave" | "remote";

export interface AttendanceRow {
  id: string;
  employee_id: string;
  name_ar: string;
  name_en: string;
  project_ar: string;
  project_en: string;
  check_in: string | null;
  check_out: string | null;
  state: AttendanceState;
  /** GPS verified against the assigned site geofence. */
  gps_ok: boolean;
  hours: number;
}

export const ATTENDANCE_TODAY: AttendanceRow[] = [
  {
    id: "att-001",
    employee_id: "emp-001",
    name_ar: "أحمد عبد الحليم سعد",
    name_en: "Ahmed Abdel Halim Saad",
    project_ar: "محطة بنبان",
    project_en: "Benban Substation",
    check_in: "07:02",
    check_out: "16:10",
    state: "present",
    gps_ok: true,
    hours: 9,
  },
  {
    id: "att-002",
    employee_id: "emp-002",
    name_ar: "محمود سيد النجار",
    name_en: "Mahmoud Sayed El-Naggar",
    project_ar: "مصنع السخنة",
    project_en: "Sokhna Plant",
    check_in: "07:41",
    check_out: "16:05",
    state: "late",
    gps_ok: true,
    hours: 8.4,
  },
  {
    id: "att-006",
    employee_id: "emp-006",
    name_ar: "كريم فوزي الشناوي",
    name_en: "Karim Fawzy El-Shenawy",
    project_ar: "محطة بنبان",
    project_en: "Benban Substation",
    check_in: "06:58",
    check_out: null,
    state: "present",
    gps_ok: true,
    hours: 0,
  },
  {
    id: "att-003",
    employee_id: "emp-003",
    name_ar: "سارة عادل توفيق",
    name_en: "Sara Adel Tawfik",
    project_ar: "المكتب الرئيسي",
    project_en: "Head Office",
    check_in: "09:05",
    check_out: null,
    state: "remote",
    gps_ok: false,
    hours: 0,
  },
  {
    id: "att-007",
    employee_id: "emp-007",
    name_ar: "وليد الجندي",
    name_en: "Walid El-Gendy",
    project_ar: "محطة بنبان",
    project_en: "Benban Substation",
    check_in: null,
    check_out: null,
    state: "leave",
    gps_ok: false,
    hours: 0,
  },
];

export const ATTENDANCE_KPIS = {
  present: 2981,
  late: 142,
  absent: 38,
  on_leave: 86,
  present_pct: 92,
} as const;

/* ============================== Leave ================================ */

export type LeaveState = "pending" | "approved" | "rejected";

export interface LeaveTypeBalance {
  key: string;
  name_ar: string;
  name_en: string;
  /** legal annual entitlement (Egyptian Labour Law) */
  entitled: number;
  used: number;
  balance: number;
}

/** Sample balances for the signed-in / selected employee. */
export const LEAVE_BALANCES: LeaveTypeBalance[] = [
  { key: "annual", name_ar: "اعتيادية", name_en: "Annual", entitled: 21, used: 8, balance: 13 },
  { key: "casual", name_ar: "عارضة", name_en: "Casual", entitled: 7, used: 3, balance: 4 },
  { key: "sick", name_ar: "مرضية", name_en: "Sick", entitled: 180, used: 2, balance: 178 },
];

export interface LeaveRequest {
  id: string;
  employee_id: string;
  name_ar: string;
  name_en: string;
  type_ar: string;
  type_en: string;
  from_date: string;
  to_date: string;
  days: number;
  state: LeaveState;
  approver_ar: string;
  approver_en: string;
}

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "lv-101",
    employee_id: "emp-002",
    name_ar: "محمود سيد النجار",
    name_en: "Mahmoud Sayed El-Naggar",
    type_ar: "اعتيادية",
    type_en: "Annual",
    from_date: "2026-06-15",
    to_date: "2026-06-19",
    days: 5,
    state: "pending",
    approver_ar: "المدير المباشر",
    approver_en: "Direct Manager",
  },
  {
    id: "lv-102",
    employee_id: "emp-006",
    name_ar: "كريم فوزي الشناوي",
    name_en: "Karim Fawzy El-Shenawy",
    type_ar: "عارضة",
    type_en: "Casual",
    from_date: "2026-06-13",
    to_date: "2026-06-13",
    days: 1,
    state: "approved",
    approver_ar: "وليد الجندي",
    approver_en: "Walid El-Gendy",
  },
  {
    id: "lv-103",
    employee_id: "emp-001",
    name_ar: "أحمد عبد الحليم سعد",
    name_en: "Ahmed Abdel Halim Saad",
    type_ar: "اعتيادية",
    type_en: "Annual",
    from_date: "2026-07-01",
    to_date: "2026-07-03",
    days: 3,
    state: "pending",
    approver_ar: "المدير المباشر",
    approver_en: "Direct Manager",
  },
  {
    id: "lv-104",
    employee_id: "emp-003",
    name_ar: "سارة عادل توفيق",
    name_en: "Sara Adel Tawfik",
    type_ar: "مرضية",
    type_en: "Sick",
    from_date: "2026-06-08",
    to_date: "2026-06-09",
    days: 2,
    state: "approved",
    approver_ar: "الموارد البشرية",
    approver_en: "HR",
  },
];

export const LEAVE_KPIS = {
  pending: 9,
  approved_month: 64,
  on_leave_today: 86,
  avg_decision_hours: 21,
} as const;
