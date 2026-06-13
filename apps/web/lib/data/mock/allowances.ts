import type { AllowanceCycle, AllowanceEntry } from "../types";
import { DEMO_TODAY } from "./seed";

const B = DEMO_TODAY;

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

function entryBase(id: string, cycleId: string) {
  return {
    id,
    tenant_id: "tn-afro",
    cycle_id: cycleId,
    created_at: B + "T08:00:00Z",
    updated_at: B + "T08:00:00Z",
    archived_at: null,
  };
}

/* ------------------------------------------------------------------ */
/* Cycles                                                               */
/* ------------------------------------------------------------------ */

export const ALLOWANCE_CYCLES: AllowanceCycle[] = [
  {
    ...cycleBase("alc-2026-06"),
    month: "2026-06-01",
    status: "validation",
    deadline_at: "2026-06-17T23:59:00Z",
    total_amount: 48200,
    project_count: 3,
    employee_count: 5,
  },
  {
    ...cycleBase("alc-2026-05"),
    month: "2026-05-01",
    status: "cost_reporting",
    deadline_at: null,
    locked: true,
    total_amount: 47600,
    project_count: 3,
    employee_count: 5,
  },
  {
    ...cycleBase("alc-2026-04"),
    month: "2026-04-01",
    status: "payment",
    deadline_at: null,
    locked: true,
    total_amount: 36400,
    project_count: 2,
    employee_count: 4,
  },
];

/* ------------------------------------------------------------------ */
/* Allowance entries for June 2026 cycle                               */
/* ------------------------------------------------------------------ */

export const ALLOWANCE_ENTRIES: AllowanceEntry[] = [
  {
    ...entryBase("ale-2026-06-001", "alc-2026-06"),
    project_id: "prj-benban",
    employee_id: "emp-001",
    site_allowance: 4000,
    transport_allowance: 1400,
    meal_allowance: 1000,
    total: 6400,
    submitted_by_ar: "وليد الجندي",
    submitted_by_en: "Walid El-Gendy",
    bank_verified: true,
    status: "validated",
  },
  {
    ...entryBase("ale-2026-06-002", "alc-2026-06"),
    project_id: "prj-sokhna",
    employee_id: "emp-002",
    site_allowance: 1500,
    transport_allowance: 0,
    meal_allowance: 800,
    total: 2300,
    submitted_by_ar: "وليد الجندي",
    submitted_by_en: "Walid El-Gendy",
    bank_verified: true,
    status: "validated",
  },
  {
    ...entryBase("ale-2026-06-003", "alc-2026-06"),
    project_id: "prj-hq",
    employee_id: "emp-003",
    site_allowance: 0,
    transport_allowance: 1200,
    meal_allowance: 0,
    total: 1200,
    submitted_by_ar: "أحمد عبد الحليم سعد",
    submitted_by_en: "Ahmed Abdel Halim Saad",
    bank_verified: true,
    status: "validated",
  },
  {
    ...entryBase("ale-2026-06-006", "alc-2026-06"),
    project_id: "prj-benban",
    employee_id: "emp-006",
    site_allowance: 1200,
    transport_allowance: 0,
    meal_allowance: 800,
    total: 2000,
    submitted_by_ar: "وليد الجندي",
    submitted_by_en: "Walid El-Gendy",
    bank_verified: true,
    status: "draft",
  },
  {
    ...entryBase("ale-2026-06-007", "alc-2026-06"),
    project_id: "prj-benban",
    employee_id: "emp-007",
    site_allowance: 0,
    transport_allowance: 2000,
    meal_allowance: 0,
    total: 2000,
    submitted_by_ar: "أحمد عبد الحليم سعد",
    submitted_by_en: "Ahmed Abdel Halim Saad",
    bank_verified: true,
    status: "validated",
  },
];

export function cycleEntries(cycleId: string): AllowanceEntry[] {
  return ALLOWANCE_ENTRIES.filter((e) => e.cycle_id === cycleId);
}

export const ALLOWANCE_CYCLE_STAGE_ORDER: AllowanceCycle["status"][] = [
  "request_collection",
  "preparation",
  "validation",
  "finance_submission",
  "payment",
  "cost_reporting",
];
