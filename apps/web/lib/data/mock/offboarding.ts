import type {
  ClearanceDept,
  ClearanceItem,
  ClearanceStatus,
  FinalSettlement,
  OffboardingCase,
  OffboardingStage,
} from "../types";
import { DEMO_TODAY } from "./seed";

/**
 * Offboarding mock seed — the manual's Part III 6-stage exit workflow:
 * Initiation → Access Deactivation → Handover → Clearance → Legal &
 * Financial Closure → File Closure & Archiving. Mirrors
 * `supabase/migrations/0005_onboarding_offboarding.sql`.
 *
 * The Stage-5 final settlement encashes the unused annual-leave balance
 * (fed from the Leave module) at the daily wage, nets off outstanding
 * advances, and is gated behind Finance approval (Policy 13).
 */

function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const B = DEMO_TODAY; // "2026-06-12"

/* --------------------------- Clearance matrix --------------------------- */

interface ClearanceTemplate {
  key: string;
  dept: ClearanceDept;
  label_ar: string;
  label_en: string;
}

/** Generated per case from the manual's clearance table (Stage 4). */
const CLEARANCE_TEMPLATE: ClearanceTemplate[] = [
  { key: "it_laptop", dept: "it", label_ar: "إرجاع اللابتوب", label_en: "Return laptop" },
  { key: "it_email", dept: "it", label_ar: "إغلاق الإيميل", label_en: "Close corporate email" },
  { key: "it_devices", dept: "it", label_ar: "استرداد الأجهزة والصلاحيات", label_en: "Recover devices & access" },
  { key: "ops_id_card", dept: "operations_admin", label_ar: "إرجاع كارت الدخول (ID)", label_en: "Return access (ID) card" },
  { key: "ops_insurance_card", dept: "operations_admin", label_ar: "إرجاع كارت التأمين الطبي", label_en: "Return medical-insurance card" },
  { key: "ops_custody", dept: "operations_admin", label_ar: "إرجاع العهدة", label_en: "Return assigned custody" },
  { key: "fin_advances", dept: "finance", label_ar: "تسوية السلف والقروض", label_en: "Settle advances & loans" },
  { key: "fin_petty_cash", dept: "finance", label_ar: "تسوية العهدة النقدية (Petty Cash)", label_en: "Settle petty cash" },
  { key: "fin_obligations", dept: "finance", label_ar: "التحقق من الالتزامات", label_en: "Verify outstanding obligations" },
  { key: "mgr_handover", dept: "direct_manager", label_ar: "اعتماد الـ Handover", label_en: "Approve handover" },
];

function buildClearance(
  cleared: string[],
  blocked: string[] = []
): ClearanceItem[] {
  const clearedSet = new Set(cleared);
  const blockedSet = new Set(blocked);
  return CLEARANCE_TEMPLATE.map((tpl) => {
    let status: ClearanceStatus = "pending";
    if (clearedSet.has(tpl.key)) status = "cleared";
    else if (blockedSet.has(tpl.key)) status = "blocked";
    return {
      id: tpl.key,
      dept: tpl.dept,
      label_ar: tpl.label_ar,
      label_en: tpl.label_en,
      status,
    };
  });
}

const ALL_CLEARED = CLEARANCE_TEMPLATE.map((t) => t.key);

/* ----------------------------- Settlement ------------------------------- */

/** Build a settlement, computing leave encashment and the net automatically. */
function settlement(
  partial: Omit<
    FinalSettlement,
    "leave_encashment" | "net_settlement"
  >
): FinalSettlement {
  const leave_encashment = Math.round(
    partial.unused_leave_days * partial.daily_rate
  );
  const net_settlement =
    partial.last_salary +
    leave_encashment +
    partial.other_dues -
    partial.deductions;
  return { ...partial, leave_encashment, net_settlement };
}

/* ------------------------------- Cases ---------------------------------- */

const caseRow = (id: string, createdDaysAgo: number) => ({
  id,
  tenant_id: "tn-afro",
  created_at: addDays(B, -createdDaysAgo) + "T08:00:00Z",
  updated_at: B + "T08:00:00Z",
  archived_at: null,
});

export const OFFBOARDING_CASES: OffboardingCase[] = [
  {
    // emp-005 — resignation via ESS; clearance done, settlement awaiting Finance
    ...caseRow("ofb-001", 8),
    case_code: "OFB-2026-004",
    employee_id: "emp-005",
    employee_name_ar: "خالد منصور إبراهيم",
    employee_name_en: "Khaled Mansour Ibrahim",
    hr_code: "AFR-2021-0233",
    job_title_ar: "محاسب موقع",
    job_title_en: "Site Accountant",
    project_id: "prj-assiut",
    reason: "resignation",
    initiated_at: addDays(B, -7),
    last_working_day: addDays(B, 7), // 2026-06-19
    priority: "P0",
    status: "settlement",
    current_stage: 5,
    access_revoked: true,
    handover_approved: true,
    exit_interview_done: true,
    si_form6_filed: true,
    originals_returned: false,
    clearance: buildClearance(ALL_CLEARED),
    settlement: settlement({
      last_salary: 11_083, // 19/30 of EGP 17,500 net, prorated to the LWD
      unused_leave_days: 15, // from LEAVE_BALANCES (emp-005 annual remaining)
      daily_rate: 727, // gross 21,800 / 30
      other_dues: 0,
      deductions: 2_000,
      deduction_note_ar: "سلفة راتب قائمة (advances_loans)",
      deduction_note_en: "Outstanding salary advance (advances_loans)",
      finance_approved: false,
    }),
  },
  {
    // contract end — clearance in progress, manager handover still pending
    ...caseRow("ofb-002", 3),
    case_code: "OFB-2026-005",
    employee_id: "emp-ext-220",
    employee_name_ar: "صابر علي حسن",
    employee_name_en: "Saber Ali Hassan",
    hr_code: "AFR-2024-0190",
    job_title_ar: "سائق معدات ثقيلة",
    job_title_en: "Heavy-Equipment Driver",
    project_id: "prj-sokhna",
    reason: "contract_end",
    initiated_at: addDays(B, -3),
    last_working_day: addDays(B, 2),
    priority: "P1",
    status: "clearance",
    current_stage: 4,
    access_revoked: true,
    handover_approved: false,
    exit_interview_done: false,
    si_form6_filed: false,
    originals_returned: false,
    clearance: buildClearance(
      ["it_laptop", "it_email", "it_devices", "ops_id_card", "ops_insurance_card"],
      ["fin_advances"] // blocked — an unsettled advance is holding the payout
    ),
    settlement: settlement({
      last_salary: 6_200,
      unused_leave_days: 4,
      daily_rate: 410,
      other_dues: 0,
      deductions: 3_400,
      deduction_note_ar: "سلفة قائمة معلّقة لدى المالية",
      deduction_note_en: "Outstanding advance pending Finance settlement",
      finance_approved: false,
    }),
  },
  {
    // project end — fully closed & archived this month
    ...caseRow("ofb-003", 28),
    case_code: "OFB-2026-003",
    employee_id: "emp-ext-188",
    employee_name_ar: "نادر فهمي رزق",
    employee_name_en: "Nader Fahmy Rezk",
    hr_code: "AFR-2023-0188",
    job_title_ar: "فني سقالات",
    job_title_en: "Scaffolding Technician",
    project_id: "prj-alamein",
    reason: "project_end",
    initiated_at: addDays(B, -28),
    last_working_day: addDays(B, -14),
    priority: "P1",
    status: "archived",
    current_stage: 6,
    access_revoked: true,
    handover_approved: true,
    exit_interview_done: true,
    si_form6_filed: true,
    originals_returned: true,
    clearance: buildClearance(ALL_CLEARED),
    settlement: settlement({
      last_salary: 7_400,
      unused_leave_days: 9,
      daily_rate: 433,
      other_dues: 1_500, // end-of-project completion bonus
      deductions: 0,
      deduction_note_ar: "لا استقطاعات",
      deduction_note_en: "No deductions",
      finance_approved: true,
    }),
  },
];

/* ------------------------------ Helpers --------------------------------- */

export function offboardingCase(id: string): OffboardingCase | null {
  return OFFBOARDING_CASES.find((c) => c.id === id) ?? null;
}

export function clearanceProgress(c: OffboardingCase): {
  done: number;
  total: number;
} {
  return {
    done: c.clearance.filter((i) => i.status === "cleared").length,
    total: c.clearance.length,
  };
}

/**
 * Stage progress out of 6, derived from the case flags + clearance matrix.
 * Mirrors how a case advances through the manual's six stages.
 */
export function stageProgress(c: OffboardingCase): {
  done: number;
  total: 6;
} {
  const cleared = c.clearance.every((i) => i.status === "cleared");
  const stageDone: Record<OffboardingStage, boolean> = {
    1: true, // initiated (the case exists)
    2: c.access_revoked,
    3: c.handover_approved,
    4: cleared,
    5: c.exit_interview_done && c.si_form6_filed && c.settlement.finance_approved,
    6: c.originals_returned && c.status === "archived",
  };
  let done = 0;
  for (let s = 1 as OffboardingStage; s <= 6; s++) {
    if (stageDone[s]) done++;
  }
  return { done, total: 6 };
}
