import type {
  ActivationCondition,
  HiringEmail,
  OnboardingCase,
  OnboardingOwnerRole,
  OnboardingStage,
  OnboardingTask,
  TaskStatus,
} from "../types";
import { DEMO_TODAY } from "./seed";

/**
 * Onboarding mock seed — cases opened from accepted offers / handovers,
 * the 9-stage task template generated per case, and the Stage-9 activation
 * gate (the six conditions of app.fn_can_activate). Mirrors
 * `supabase/migrations/0005_onboarding_offboarding.sql`.
 */

function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const B = DEMO_TODAY;

/* ----------------------------- Task template ---------------------------- */

interface TaskTemplate {
  stage: OnboardingStage;
  task_key: string;
  title_ar: string;
  title_en: string;
  owner_role: OnboardingOwnerRole;
  /** Only emitted for safety-sensitive / medical-required roles when true. */
  conditional?: "safety_sensitive" | "requires_medical";
}

/** The 9-stage onboarding template — generated when a case opens. */
const TASK_TEMPLATE: TaskTemplate[] = [
  // Stage 1 — Onboarding Initiation (TA)
  { stage: 1, task_key: "hiring_email", title_ar: "إصدار الـ Hiring Email المعتمد", title_en: "Issue approved Hiring Email", owner_role: "talent_acquisition" },
  { stage: 1, task_key: "new_hire_form", title_ar: "نموذج New Hire Onboarding", title_en: "New Hire Onboarding form", owner_role: "talent_acquisition" },
  // Stage 2 — Hiring Notification & Personnel Initiation
  { stage: 2, task_key: "hiring_notification", title_ar: "إصدار الـ Hiring Notification الرسمي", title_en: "Issue official Hiring Notification", owner_role: "personnel" },
  { stage: 2, task_key: "open_record", title_ar: "فتح سجل الموظف (Pending) في Core HR", title_en: "Open employee record (Pending) in Core HR", owner_role: "personnel" },
  // Stage 3 — Document Collection & Verification
  { stage: 3, task_key: "doc_checklist_sent", title_ar: "إرسال Checklist المستندات الـ 13", title_en: "Send the 13-document checklist", owner_role: "personnel" },
  { stage: 3, task_key: "doc_verified", title_ar: "استلام وتحقق المستندات", title_en: "Receive & verify documents", owner_role: "personnel" },
  // Stage 4 — Contracting & Compliance
  { stage: 4, task_key: "contract_signed", title_ar: "توقيع عقد العمل", title_en: "Sign employment contract", owner_role: "personnel" },
  { stage: 4, task_key: "si_form1", title_ar: "نموذج تأمينات اجتماعية (1)", title_en: "Social Insurance Form (1)", owner_role: "personnel" },
  { stage: 4, task_key: "handbook_ack", title_ar: "إقرار استلام كتيب السياسات", title_en: "Policy handbook acknowledgement", owner_role: "personnel" },
  { stage: 4, task_key: "bank_letter", title_ar: "خطاب فتح حساب بنكي للراتب", title_en: "Salary bank-account letter", owner_role: "personnel" },
  { stage: 4, task_key: "payroll_registration", title_ar: "تسجيل في الـ Payroll", title_en: "Payroll registration", owner_role: "personnel" },
  // Stage 5 — System Setup Registration
  { stage: 5, task_key: "erp_profile", title_ar: "إنشاء البروفايل وتوليد HR Code", title_en: "Create ERP profile & generate HR Code", owner_role: "personnel" },
  { stage: 5, task_key: "corporate_email", title_ar: "طلب إنشاء إيميل الشركة", title_en: "Request corporate email", owner_role: "it" },
  { stage: 5, task_key: "system_access", title_ar: "منح صلاحيات الأنظمة", title_en: "Grant system access", owner_role: "it" },
  // Stage 6 — Equipment & Operational Preparation
  { stage: 6, task_key: "laptop", title_ar: "تخصيص لابتوب", title_en: "Assign laptop", owner_role: "it" },
  { stage: 6, task_key: "ppe", title_ar: "تجهيز أدوات السلامة PPE", title_en: "Issue PPE kit", owner_role: "operations_admin" },
  { stage: 6, task_key: "uniform", title_ar: "تسليم اليونيفورم", title_en: "Issue uniform", owner_role: "operations_admin" },
  { stage: 6, task_key: "access_card", title_ar: "إصدار كارت الدخول", title_en: "Issue access card", owner_role: "operations_admin" },
  // Stage 7 — HSE Requirements
  { stage: 7, task_key: "medical_exam", title_ar: "الفحص الطبي (Fit)", title_en: "Medical exam (Fit)", owner_role: "hse", conditional: "requires_medical" },
  { stage: 7, task_key: "course_firefighting", title_ar: "كورس مكافحة الحريق", title_en: "Fire-fighting course", owner_role: "hse", conditional: "safety_sensitive" },
  { stage: 7, task_key: "course_heights", title_ar: "كورس العمل في المرتفعات", title_en: "Working-at-heights course", owner_role: "hse", conditional: "safety_sensitive" },
  // Stage 8 — Orientation & Induction
  { stage: 8, task_key: "hr_orientation", title_ar: "توجيه HR (السياسات والمزايا)", title_en: "HR orientation (policies & benefits)", owner_role: "hr_manager" },
  { stage: 8, task_key: "hse_orientation", title_ar: "توجيه HSE (السلامة والطوارئ)", title_en: "HSE orientation (safety & emergencies)", owner_role: "hse" },
  { stage: 8, task_key: "ops_induction", title_ar: "تعريف تشغيلي بالمشروع", title_en: "Operational project induction", owner_role: "operations_admin" },
  // Stage 9 — Employment Activation (the gate itself)
  { stage: 9, task_key: "activation", title_ar: "بوابة التفعيل (الشروط الستة)", title_en: "Activation gate (six conditions)", owner_role: "hr_manager" },
];

/* ------------------------------- Cases ---------------------------------- */

function email(partial: Partial<HiringEmail> & Pick<HiringEmail, "name_en" | "name_ar">): HiringEmail {
  return {
    national_id: "—",
    mobile: "—",
    job_title: "—",
    project_code: "—",
    project_name: "—",
    direct_manager: "—",
    work_location: "—",
    net_salary: 0,
    allowances: "—",
    social_insurance_number: "—",
    contract_signing_date: null,
    joining_date: B,
    ...partial,
  };
}

const caseRow = (id: string, createdDaysAgo: number) => ({
  id,
  tenant_id: "tn-afro",
  created_at: addDays(B, -createdDaysAgo) + "T08:00:00Z",
  updated_at: B + "T08:00:00Z",
  archived_at: null,
});

export const ONBOARDING_CASES: OnboardingCase[] = [
  {
    ...caseRow("onb-001", 8),
    case_code: "ONB-2026-017",
    job_offer_id: "off-002",
    candidate_name_ar: "سيد عبد العاطي",
    candidate_name_en: "Sayed Abdel Aty",
    job_title_ar: "لحّام أرجون",
    job_title_en: "Argon Welder",
    project_id: "prj-assiut",
    joining_date: addDays(B, 1),
    priority: "P0",
    status: "in_progress",
    current_stage: 9,
    safety_sensitive_role: true,
    requires_medical_exam: true,
    hiring_email: email({
      name_en: "Sayed Abdel Aty",
      name_ar: "سيد عبد العاطي",
      national_id: "28906152233445",
      mobile: "0101 555 0011",
      job_title: "Argon Welder / لحّام أرجون",
      project_code: "PRJ-021",
      project_name: "Nile Bridge — Assiut",
      direct_manager: "Eng. Mohamed Omar",
      work_location: "Assiut site",
      net_salary: 11000,
      allowances: "Site + Transport + Meal",
      social_insurance_number: "28906152233445",
      contract_signing_date: addDays(B, -3),
      joining_date: addDays(B, 1),
    }),
    activated_at: null,
  },
  {
    ...caseRow("onb-002", 5),
    case_code: "ONB-2026-018",
    job_offer_id: null,
    candidate_name_ar: "م. كريم الدسوقي",
    candidate_name_en: "Eng. Karim El-Desouky",
    job_title_ar: "مهندس موقع مدني",
    job_title_en: "Civil Site Engineer",
    project_id: "prj-alamein",
    joining_date: addDays(B, 10),
    priority: "P1",
    status: "in_progress",
    current_stage: 6,
    safety_sensitive_role: false,
    requires_medical_exam: false,
    hiring_email: email({
      name_en: "Eng. Karim El-Desouky",
      name_ar: "م. كريم الدسوقي",
      national_id: "29001234567890",
      mobile: "0102 555 0077",
      job_title: "Civil Site Engineer / مهندس موقع مدني",
      project_code: "PRJ-009",
      project_name: "New Alamein Towers",
      direct_manager: "Eng. Tarek El-Shazly",
      work_location: "Alamein site",
      net_salary: 23000,
      allowances: "Site + Transport",
      social_insurance_number: "29001234567890",
      contract_signing_date: addDays(B, -1),
      joining_date: addDays(B, 10),
    }),
    activated_at: null,
  },
  {
    ...caseRow("onb-003", 2),
    case_code: "ONB-2026-019",
    job_offer_id: null,
    candidate_name_ar: "عبد الرحمن قطب",
    candidate_name_en: "Abdelrahman Qotb",
    job_title_ar: "فني تركيبات كهربائية",
    job_title_en: "Electrical Installer",
    project_id: "prj-benban",
    joining_date: addDays(B, 14),
    priority: "P0",
    status: "in_progress",
    current_stage: 3,
    safety_sensitive_role: true,
    requires_medical_exam: false,
    hiring_email: email({
      name_en: "Abdelrahman Qotb",
      name_ar: "عبد الرحمن قطب",
      national_id: "29405061122334",
      mobile: "0111 777 1003",
      job_title: "Electrical Installer / فني تركيبات كهربائية",
      project_code: "PRJ-014",
      project_name: "Benban 500kV Substation",
      direct_manager: "Eng. Ahmed Abdel Halim",
      work_location: "Benban site — Aswan",
      net_salary: 9500,
      allowances: "Site + Transport",
      social_insurance_number: "29405061122334",
      contract_signing_date: null,
      joining_date: addDays(B, 14),
    }),
    activated_at: null,
  },
  {
    ...caseRow("onb-004", 40),
    case_code: "ONB-2026-009",
    job_offer_id: null,
    candidate_name_ar: "أ. منى الشرقاوي",
    candidate_name_en: "Ms. Mona El-Sharkawy",
    job_title_ar: "محاسبة مواقع",
    job_title_en: "Site Accountant",
    project_id: "prj-sokhna",
    joining_date: addDays(B, -25),
    priority: "P1",
    status: "activated",
    current_stage: 9,
    safety_sensitive_role: false,
    requires_medical_exam: false,
    hiring_email: email({
      name_en: "Ms. Mona El-Sharkawy",
      name_ar: "أ. منى الشرقاوي",
      national_id: "29307081234567",
      mobile: "0128 777 1004",
      job_title: "Site Accountant / محاسبة مواقع",
      project_code: "PRJ-017",
      project_name: "Ain Sokhna Cement Plant",
      direct_manager: "Mr. Hany Rashad",
      work_location: "Ain Sokhna site",
      net_salary: 12000,
      allowances: "Site",
      social_insurance_number: "29307081234567",
      contract_signing_date: addDays(B, -30),
      joining_date: addDays(B, -25),
    }),
    activated_at: addDays(B, -25) + "T09:00:00Z",
  },
];

/* ------------------------- Per-case progress ---------------------------- */

/**
 * Completed `task_key`s per case (everything else is pending / in-progress).
 * Drives both the stage checklist and the activation conditions.
 */
const DONE_TASKS: Record<string, string[]> = {
  // onb-001 — everything done; ready to activate
  "onb-001": [
    "hiring_email", "new_hire_form", "hiring_notification", "open_record",
    "doc_checklist_sent", "doc_verified", "contract_signed", "si_form1",
    "handbook_ack", "bank_letter", "payroll_registration", "erp_profile",
    "corporate_email", "system_access", "laptop", "ppe", "uniform",
    "access_card", "medical_exam", "course_firefighting", "course_heights",
    "hr_orientation", "hse_orientation", "ops_induction",
  ],
  // onb-002 — through stage 5, equipment in progress; docs/contracts done
  "onb-002": [
    "hiring_email", "new_hire_form", "hiring_notification", "open_record",
    "doc_checklist_sent", "doc_verified", "contract_signed", "si_form1",
    "handbook_ack", "bank_letter", "payroll_registration", "erp_profile",
    "corporate_email", "system_access", "laptop",
  ],
  // onb-003 — early; notification done, documents being collected
  "onb-003": [
    "hiring_email", "new_hire_form", "hiring_notification", "open_record",
    "doc_checklist_sent",
  ],
  // onb-004 — activated; all done
  "onb-004": [
    "hiring_email", "new_hire_form", "hiring_notification", "open_record",
    "doc_checklist_sent", "doc_verified", "contract_signed", "si_form1",
    "handbook_ack", "bank_letter", "payroll_registration", "erp_profile",
    "corporate_email", "system_access", "laptop", "ppe", "uniform",
    "access_card", "hr_orientation", "hse_orientation", "ops_induction",
    "activation",
  ],
};

/** "in progress" task per case — the single next task being worked on. */
const IN_PROGRESS_TASK: Record<string, string> = {
  "onb-002": "ppe",
  "onb-003": "doc_verified",
};

function tasksForCase(c: OnboardingCase): OnboardingTask[] {
  const done = new Set(DONE_TASKS[c.id] ?? []);
  const inProgress = IN_PROGRESS_TASK[c.id];
  return TASK_TEMPLATE.filter((tpl) => {
    if (tpl.conditional === "safety_sensitive") return c.safety_sensitive_role;
    if (tpl.conditional === "requires_medical") return c.requires_medical_exam;
    return true;
  }).map((tpl, idx) => {
    let status: TaskStatus = "pending";
    if (done.has(tpl.task_key)) status = "done";
    else if (inProgress === tpl.task_key) status = "in_progress";
    return {
      id: `${c.id}-t${idx}`,
      tenant_id: c.tenant_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      archived_at: null,
      case_id: c.id,
      stage: tpl.stage,
      task_key: tpl.task_key,
      title_ar: tpl.title_ar,
      title_en: tpl.title_en,
      owner_role: tpl.owner_role,
      due_date: c.joining_date,
      status,
      completed_at: status === "done" ? c.updated_at : null,
    };
  });
}

const TASKS_BY_CASE: Record<string, OnboardingTask[]> = Object.fromEntries(
  ONBOARDING_CASES.map((c) => [c.id, tasksForCase(c)])
);

export function onboardingTasks(caseId: string): OnboardingTask[] {
  return TASKS_BY_CASE[caseId] ?? [];
}

/**
 * The six activation conditions of Stage 9, derived from task completion
 * (mirrors app.fn_can_activate's logic on the mock data).
 */
export function activationConditions(c: OnboardingCase): ActivationCondition[] {
  const tasks = onboardingTasks(c.id);
  const isDone = (key: string) =>
    tasks.find((t) => t.task_key === key)?.status === "done";
  // For roles without the conditional tasks, the condition is auto-met.
  const hseDone = c.safety_sensitive_role
    ? isDone("course_firefighting") && isDone("course_heights")
    : true;
  const medicalDone = c.requires_medical_exam ? isDone("medical_exam") : true;
  return [
    { key: "documents_complete", met: isDone("doc_verified"), owner_role: "personnel" },
    { key: "contracts_signed", met: isDone("contract_signed") && isDone("si_form1"), owner_role: "personnel" },
    { key: "hse_requirements", met: hseDone, owner_role: "hse" },
    { key: "medical_exam", met: medicalDone, owner_role: "hse" },
    { key: "systems_ready", met: isDone("erp_profile") && isDone("system_access"), owner_role: "it" },
    { key: "certificates_valid", met: hseDone, owner_role: "hse" },
  ];
}

export function canActivate(c: OnboardingCase): boolean {
  return activationConditions(c).every((cond) => cond.met);
}

/** Stage progress: count of stages with all (applicable) tasks done. */
export function stageProgress(caseId: string): { done: number; total: 9 } {
  const tasks = onboardingTasks(caseId);
  let done = 0;
  for (let stage = 1 as OnboardingStage; stage <= 9; stage++) {
    const inStage = tasks.filter((t) => t.stage === stage);
    if (inStage.length > 0 && inStage.every((t) => t.status === "done")) done++;
  }
  return { done, total: 9 };
}
