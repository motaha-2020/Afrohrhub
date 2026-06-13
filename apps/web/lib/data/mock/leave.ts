import type { LeaveBalance, LeaveRequest, LeaveType } from "../types";
import { DEMO_TODAY } from "./seed";

const B = DEMO_TODAY; // "2026-06-12"

function base(id: string) {
  return {
    id,
    tenant_id: "tn-afro",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: B + "T08:00:00Z",
    archived_at: null,
  };
}

/* ------------------------------------------------------------------ */
/* Leave types — seeded from Egyptian Labor Law (configurable per tenant) */
/* ------------------------------------------------------------------ */

export const LEAVE_TYPES: LeaveType[] = [
  {
    ...base("lt-annual"),
    code: "annual",
    name_ar: "إجازة سنوية",
    name_en: "Annual Leave",
    annual_entitlement: 21,
    pay_rule: "paid",
    pay_pct: 100,
    requires_hr_approval: false,
    note_ar: "15 يوماً أول سنة، 21 يوماً بعدها، 30 يوماً بعد 10 سنوات أو سن الخمسين",
    note_en: "15 days in year 1, 21 thereafter, 30 after 10 years' service or age 50",
  },
  {
    ...base("lt-casual"),
    code: "casual",
    name_ar: "إجازة عارضة",
    name_en: "Casual Leave",
    annual_entitlement: 7,
    pay_rule: "paid",
    pay_pct: 100,
    requires_hr_approval: false,
    note_ar: "7 أيام سنوياً (يومان متصلان كحد أقصى) — تُخصم من الرصيد السنوي",
    note_en: "7 days/year (max 2 consecutive) — deducted from the annual balance",
  },
  {
    ...base("lt-sick"),
    code: "sick",
    name_ar: "إجازة مرضية",
    name_en: "Sick Leave",
    annual_entitlement: 0,
    pay_rule: "partial",
    pay_pct: 75,
    requires_hr_approval: true,
    note_ar: "بتقرير طبي معتمد — 75% من الأجر وفق قواعد التأمين الاجتماعي",
    note_en: "With approved medical report — 75% of wage per social-insurance rules",
  },
  {
    ...base("lt-maternity"),
    code: "maternity",
    name_ar: "إجازة وضع",
    name_en: "Maternity Leave",
    annual_entitlement: 0,
    pay_rule: "paid",
    pay_pct: 100,
    requires_hr_approval: true,
    note_ar: "4 أشهر (قانون العمل 14 لسنة 2025) — مرتان طوال مدة الخدمة",
    note_en: "4 months (Labor Law 14/2025) — twice over the service period",
  },
  {
    ...base("lt-hajj"),
    code: "hajj",
    name_ar: "إجازة حج / عمرة",
    name_en: "Hajj / Umrah Leave",
    annual_entitlement: 0,
    pay_rule: "paid",
    pay_pct: 100,
    requires_hr_approval: true,
    note_ar: "شهر واحد مرة واحدة طوال الخدمة — لمن أمضى 5 سنوات",
    note_en: "One month, once in service — for employees with 5+ years",
  },
  {
    ...base("lt-unpaid"),
    code: "unpaid",
    name_ar: "إجازة بدون أجر",
    name_en: "Unpaid Leave",
    annual_entitlement: 0,
    pay_rule: "unpaid",
    pay_pct: 0,
    requires_hr_approval: true,
    note_ar: "باعتماد خاص — توقف الاستحقاقات وتُخصم من الـ Payroll",
    note_en: "Special approval — entitlements pause and days are deducted in Payroll",
  },
];

export function leaveType(code: string): LeaveType | undefined {
  return LEAVE_TYPES.find((t) => t.code === code);
}

/* ------------------------------------------------------------------ */
/* Balances (entitlement year 2026) — annual + casual are the trackable */
/* allotments; special types are request-gated with no standing balance.*/
/* ------------------------------------------------------------------ */

function balance(
  employee_id: string,
  type_code: LeaveBalance["type_code"],
  entitled: number,
  used: number,
  pending: number
): LeaveBalance {
  return {
    employee_id,
    type_code,
    entitled,
    used,
    pending,
    remaining: entitled - used - pending,
  };
}

export const LEAVE_BALANCES: LeaveBalance[] = [
  // emp-001 — hired 2024, 21-day annual band
  balance("emp-001", "annual", 21, 6, 0),
  balance("emp-001", "casual", 7, 2, 0),
  // emp-002 — hired 2023
  balance("emp-002", "annual", 21, 9, 1),
  balance("emp-002", "casual", 7, 3, 0),
  // emp-003 — hired 2025, still in first 21-day band
  balance("emp-003", "annual", 21, 4, 2),
  balance("emp-003", "casual", 7, 1, 0),
  // emp-006 — hired 2022
  balance("emp-006", "annual", 21, 12, 0),
  balance("emp-006", "casual", 7, 5, 0),
  // emp-007 — hired 2019, 30-day band (10+ years)
  balance("emp-007", "annual", 30, 8, 5),
  balance("emp-007", "casual", 7, 0, 0),
];

export function balancesFor(employeeId: string): LeaveBalance[] {
  return LEAVE_BALANCES.filter((b) => b.employee_id === employeeId);
}

/* ------------------------------------------------------------------ */
/* Requests                                                             */
/* ------------------------------------------------------------------ */

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    ...base("lr-001"),
    employee_id: "emp-003",
    type_code: "annual",
    start_date: "2026-06-11",
    end_date: "2026-06-12",
    days: 2,
    reason_ar: "ظروف عائلية",
    reason_en: "Family matters",
    status: "approved",
    requested_at: "2026-06-02T09:15:00Z",
  },
  {
    ...base("lr-002"),
    employee_id: "emp-007",
    type_code: "annual",
    start_date: "2026-06-22",
    end_date: "2026-06-26",
    days: 5,
    reason_ar: "إجازة صيفية",
    reason_en: "Summer break",
    status: "manager_approved",
    requested_at: "2026-06-08T11:40:00Z",
  },
  {
    ...base("lr-003"),
    employee_id: "emp-002",
    type_code: "casual",
    start_date: "2026-06-15",
    end_date: "2026-06-15",
    days: 1,
    reason_ar: "مراجعة حكومية",
    reason_en: "Government appointment",
    status: "pending",
    requested_at: B + "T07:30:00Z",
  },
  {
    ...base("lr-004"),
    employee_id: "emp-006",
    type_code: "sick",
    start_date: "2026-06-16",
    end_date: "2026-06-18",
    days: 3,
    reason_ar: "تقرير طبي — التهاب حاد",
    reason_en: "Medical report — acute infection",
    status: "pending",
    requested_at: B + "T08:05:00Z",
  },
  {
    ...base("lr-005"),
    employee_id: "emp-002",
    type_code: "annual",
    start_date: "2026-05-04",
    end_date: "2026-05-06",
    days: 3,
    reason_ar: "إجازة شخصية",
    reason_en: "Personal leave",
    status: "approved",
    requested_at: "2026-04-25T10:00:00Z",
  },
  {
    ...base("lr-006"),
    employee_id: "emp-006",
    type_code: "unpaid",
    start_date: "2026-04-20",
    end_date: "2026-04-21",
    days: 2,
    reason_ar: "سفر شخصي بعد نفاد الرصيد",
    reason_en: "Personal travel after balance exhausted",
    status: "rejected",
    requested_at: "2026-04-15T13:20:00Z",
  },
];

export function pendingRequests(): LeaveRequest[] {
  return LEAVE_REQUESTS.filter(
    (r) => r.status === "pending" || r.status === "manager_approved"
  );
}
