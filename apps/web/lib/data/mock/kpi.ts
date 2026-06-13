import type { KpiCycle, KpiScore } from "../types";
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

function scoreBase(id: string, cycleId: string) {
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
/* KPI Cycles                                                           */
/* ------------------------------------------------------------------ */

export const KPI_CYCLES: KpiCycle[] = [
  {
    ...cycleBase("kpi-q2-2026"),
    quarter: "Q2-2026",
    quarter_start: "2026-04-01",
    status: "bonus_calculation",
    deadline_at: "2026-06-25T23:59:00Z",
    total_bonus: 84500,
    employee_count: 5,
  },
  {
    ...cycleBase("kpi-q1-2026"),
    quarter: "Q1-2026",
    quarter_start: "2026-01-01",
    status: "cost_reporting",
    deadline_at: null,
    locked: true,
    total_bonus: 79000,
    employee_count: 5,
  },
  {
    ...cycleBase("kpi-q4-2025"),
    quarter: "Q4-2025",
    quarter_start: "2025-10-01",
    status: "payment",
    deadline_at: null,
    locked: true,
    total_bonus: 65000,
    employee_count: 4,
  },
];

/* ------------------------------------------------------------------ */
/* KPI Scores for Q2 2026                                              */
/* ------------------------------------------------------------------ */

export const KPI_SCORES: KpiScore[] = [
  {
    ...scoreBase("ks-q2-001", "kpi-q2-2026"),
    employee_id: "emp-001",
    project_id: "prj-benban",
    score: 88,
    bonus_amount: 18000,
    evaluated_by_ar: "سارة عادل توفيق",
    evaluated_by_en: "Sara Adel Tawfik",
    evaluation_date: "2026-06-05",
    status: "submitted",
  },
  {
    ...scoreBase("ks-q2-002", "kpi-q2-2026"),
    employee_id: "emp-002",
    project_id: "prj-sokhna",
    score: 75,
    bonus_amount: 8500,
    evaluated_by_ar: "وليد الجندي",
    evaluated_by_en: "Walid El-Gendy",
    evaluation_date: "2026-06-05",
    status: "submitted",
  },
  {
    ...scoreBase("ks-q2-003", "kpi-q2-2026"),
    employee_id: "emp-003",
    project_id: "prj-hq",
    score: 92,
    bonus_amount: 21000,
    evaluated_by_ar: "وليد الجندي",
    evaluated_by_en: "Walid El-Gendy",
    evaluation_date: "2026-06-06",
    status: "approved",
  },
  {
    ...scoreBase("ks-q2-006", "kpi-q2-2026"),
    employee_id: "emp-006",
    project_id: "prj-benban",
    score: 70,
    bonus_amount: 7000,
    evaluated_by_ar: "وليد الجندي",
    evaluated_by_en: "Walid El-Gendy",
    evaluation_date: "2026-06-06",
    status: "draft",
  },
  {
    ...scoreBase("ks-q2-007", "kpi-q2-2026"),
    employee_id: "emp-007",
    project_id: "prj-benban",
    score: 95,
    bonus_amount: 30000,
    evaluated_by_ar: "سارة عادل توفيق",
    evaluated_by_en: "Sara Adel Tawfik",
    evaluation_date: "2026-06-04",
    status: "approved",
  },
];

export function cycleScores(cycleId: string): KpiScore[] {
  return KPI_SCORES.filter((s) => s.cycle_id === cycleId);
}

export const KPI_CYCLE_STAGE_ORDER: KpiCycle["status"][] = [
  "evaluation_receipt",
  "bonus_calculation",
  "validation",
  "finance_submission",
  "payment",
  "cost_reporting",
];
