import type {
  AdjustmentType,
  PayrollAdjustment,
  PayrollCycle,
  PayrollItem,
} from "../types";
import { DEMO_TODAY } from "./seed";

const B = DEMO_TODAY; // "2026-06-12"

function cycleBase(id: string) {
  return {
    id,
    tenant_id: "tn-afro",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: B + "T08:00:00Z",
    archived_at: null,
    locked: false,
    deadline_at: null,
  };
}

function itemBase(id: string, cycleId: string) {
  return {
    id,
    tenant_id: "tn-afro",
    cycle_id: cycleId,
    created_at: "2026-01-01T08:00:00Z",
    updated_at: B + "T08:00:00Z",
    archived_at: null,
  };
}

/* ------------------------------------------------------------------ */
/* Cycles                                                               */
/* ------------------------------------------------------------------ */

export const PAYROLL_CYCLES: PayrollCycle[] = [
  {
    ...cycleBase("cyc-2026-06"),
    month: "2026-06-01",
    status: "adjustments",
    deadline_at: "2026-06-23T23:59:00Z",
    employee_count: 5,
    total_gross: 159600,
    total_net: 122198.25,
  },
  {
    ...cycleBase("cyc-2026-05"),
    month: "2026-05-01",
    status: "cost_reported",
    deadline_at: null,
    locked: true,
    employee_count: 5,
    total_gross: 159600,
    total_net: 122198.25,
  },
  {
    ...cycleBase("cyc-2026-04"),
    month: "2026-04-01",
    status: "paid",
    deadline_at: null,
    locked: true,
    employee_count: 4,
    total_gross: 107600,
    total_net: 83538.25,
  },
];

/* ------------------------------------------------------------------ */
/* Payroll items for June 2026 cycle                                    */
/* ------------------------------------------------------------------ */

export const PAYROLL_ITEMS: PayrollItem[] = [
  {
    ...itemBase("pi-2026-06-001", "cyc-2026-06"),
    employee_id: "emp-001",
    gross: 36200,
    taxes: 6831.25,
    social_insurance: 1298,
    net: 28070.75,
    components: {
      basic_salary: 29800,
      allowances: { site: 4000, transport: 1400, meal: 1000 },
    },
    status: "validated",
  },
  {
    ...itemBase("pi-2026-06-002", "cyc-2026-06"),
    employee_id: "emp-002",
    gross: 17800,
    taxes: 2653.75,
    social_insurance: 990,
    net: 13156.25,
    components: {
      basic_salary: 16300,
      allowances: { site: 1500 },
    },
    status: "validated",
  },
  {
    ...itemBase("pi-2026-06-003", "cyc-2026-06"),
    employee_id: "emp-003",
    gross: 39400,
    taxes: 7631.25,
    social_insurance: 1298,
    net: 30470.75,
    components: {
      basic_salary: 38200,
      allowances: { transport: 1200 },
    },
    status: "validated",
  },
  {
    ...itemBase("pi-2026-06-006", "cyc-2026-06"),
    employee_id: "emp-006",
    gross: 14200,
    taxes: 1933.75,
    social_insurance: 924,
    net: 10892.25,
    components: {
      basic_salary: 13000,
      allowances: { site: 1200 },
    },
    status: "draft",
  },
  {
    ...itemBase("pi-2026-06-007", "cyc-2026-06"),
    employee_id: "emp-007",
    gross: 52000,
    taxes: 11093.75,
    social_insurance: 1298,
    net: 39608.25,
    components: {
      basic_salary: 50000,
      allowances: { transport: 2000 },
    },
    status: "validated",
  },
];

/* ------------------------------------------------------------------ */
/* Adjustments for June 2026 cycle                                     */
/* ------------------------------------------------------------------ */

function adjBase(
  id: string,
  cycleId: string,
  empId: string,
  type: AdjustmentType
) {
  return {
    id,
    tenant_id: "tn-afro",
    cycle_id: cycleId,
    employee_id: empId,
    type,
    created_at: "2026-06-11T09:00:00Z",
    updated_at: B + "T08:00:00Z",
    archived_at: null,
    supporting_doc_path: `tn-afro/${empId}/adjustment-${id}.pdf`,
    approval_request_id: `apr-adj-${id}`,
  };
}

export const PAYROLL_ADJUSTMENTS: PayrollAdjustment[] = [
  {
    ...adjBase("adj-2026-06-001", "cyc-2026-06", "emp-002", "loan_deduction"),
    amount: -1000,
    label_ar: "قسط قرض شهري",
    label_en: "Monthly loan installment",
  },
  {
    ...adjBase(
      "adj-2026-06-002",
      "cyc-2026-06",
      "emp-006",
      "medical_deduction"
    ),
    amount: -450,
    label_ar: "خصم تأمين صحي",
    label_en: "Health insurance deduction",
  },
];

export function cycleItems(cycleId: string): PayrollItem[] {
  return PAYROLL_ITEMS.filter((i) => i.cycle_id === cycleId);
}

export function cycleAdjustments(cycleId: string): PayrollAdjustment[] {
  return PAYROLL_ADJUSTMENTS.filter((a) => a.cycle_id === cycleId);
}

/** All adjustments for a specific employee in a cycle. */
export function employeeAdjustments(
  cycleId: string,
  employeeId: string
): PayrollAdjustment[] {
  return PAYROLL_ADJUSTMENTS.filter(
    (a) => a.cycle_id === cycleId && a.employee_id === employeeId
  );
}

export const CYCLE_STAGE_ORDER: import("../types").PayrollCycleStatus[] = [
  "new_hires",
  "validation",
  "register_updated",
  "allocations_review",
  "adjustments",
  "processing",
  "submitted_to_finance",
  "paid",
  "cost_reported",
];
