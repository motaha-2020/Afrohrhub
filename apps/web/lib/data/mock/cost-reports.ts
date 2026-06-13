import type { CostReport } from "../types";
import { DEMO_TODAY } from "./seed";

const B = DEMO_TODAY;

function reportBase(id: string) {
  return {
    id,
    tenant_id: "tn-afro",
    created_at: B + "T08:00:00Z",
    updated_at: B + "T08:00:00Z",
    archived_at: null,
  };
}

export const COST_REPORTS: CostReport[] = [
  {
    ...reportBase("rpt-2026-05"),
    month: "2026-05-01",
    total_payroll: 159600,
    total_allowances: 47600,
    total_kpi: 0,
    total_cost: 207200,
    status: "final",
    lines: [
      {
        project_id: "prj-benban",
        payroll_cost: 64288,
        allowance_cost: 20160,
        kpi_cost: 0,
        total_cost: 84448,
        employee_count: 3,
        allocation_pct_sum: 180,
      },
      {
        project_id: "prj-sokhna",
        payroll_cost: 17800,
        allowance_cost: 2300,
        kpi_cost: 0,
        total_cost: 20100,
        employee_count: 1,
        allocation_pct_sum: 100,
      },
      {
        project_id: "prj-hq",
        payroll_cost: 46792,
        allowance_cost: 14440,
        kpi_cost: 0,
        total_cost: 61232,
        employee_count: 2,
        allocation_pct_sum: 120,
      },
      {
        project_id: "prj-alamein",
        payroll_cost: 30720,
        allowance_cost: 10700,
        kpi_cost: 0,
        total_cost: 41420,
        employee_count: 1,
        allocation_pct_sum: 100,
      },
    ],
  },
  {
    ...reportBase("rpt-2026-04"),
    month: "2026-04-01",
    total_payroll: 107600,
    total_allowances: 36400,
    total_kpi: 65000,
    total_cost: 209000,
    status: "final",
    lines: [
      {
        project_id: "prj-benban",
        payroll_cost: 55200,
        allowance_cost: 18600,
        kpi_cost: 32500,
        total_cost: 106300,
        employee_count: 2,
        allocation_pct_sum: 160,
      },
      {
        project_id: "prj-sokhna",
        payroll_cost: 17800,
        allowance_cost: 2300,
        kpi_cost: 8500,
        total_cost: 28600,
        employee_count: 1,
        allocation_pct_sum: 100,
      },
      {
        project_id: "prj-hq",
        payroll_cost: 34600,
        allowance_cost: 15500,
        kpi_cost: 24000,
        total_cost: 74100,
        employee_count: 1,
        allocation_pct_sum: 100,
      },
    ],
  },
];
