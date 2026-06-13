import type { AttendanceMonthSummary, AttendanceRecord } from "../types";
import { DEMO_TODAY } from "./seed";

const B = DEMO_TODAY; // "2026-06-12"

function recordBase(id: string) {
  return {
    id,
    tenant_id: "tn-afro",
    created_at: B + "T18:00:00Z",
    updated_at: B + "T18:00:00Z",
    archived_at: null,
  };
}

/* ------------------------------------------------------------------ */
/* Today's attendance sheet (2026-06-12)                                */
/*                                                                      */
/* emp-004 (pending) and emp-005 (offboarding) are excluded — only the  */
/* active workforce is tracked, mirroring the Payroll register gate.    */
/* ------------------------------------------------------------------ */

export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    ...recordBase("att-2026-06-12-001"),
    employee_id: "emp-001",
    date: B,
    check_in: "07:52",
    check_out: "17:10",
    method: "gps",
    verified_location_id: "loc-benban",
    project_id: "prj-benban",
    late_minutes: 0,
    overtime_minutes: 70,
    status: "present",
    exception_status: "pending",
    exception_reason_ar: "أوفرتايم 70 دقيقة بانتظار اعتماد المدير",
    exception_reason_en: "70 min overtime awaiting manager approval",
  },
  {
    ...recordBase("att-2026-06-12-002"),
    employee_id: "emp-002",
    date: B,
    check_in: "08:24",
    check_out: "16:30",
    method: "site_supervisor",
    verified_location_id: "loc-sokhna",
    project_id: "prj-sokhna",
    late_minutes: 24,
    overtime_minutes: 0,
    status: "present",
    exception_status: "none",
    exception_reason_ar: null,
    exception_reason_en: null,
  },
  {
    ...recordBase("att-2026-06-12-003"),
    employee_id: "emp-003",
    date: B,
    check_in: null,
    check_out: null,
    method: "manual",
    verified_location_id: null,
    project_id: "prj-hq",
    late_minutes: 0,
    overtime_minutes: 0,
    status: "leave",
    exception_status: "none",
    exception_reason_ar: "إجازة سنوية معتمدة",
    exception_reason_en: "Approved annual leave",
  },
  {
    ...recordBase("att-2026-06-12-006"),
    employee_id: "emp-006",
    date: B,
    check_in: null,
    check_out: null,
    method: "manual",
    verified_location_id: null,
    project_id: "prj-benban",
    late_minutes: 0,
    overtime_minutes: 0,
    status: "absent",
    exception_status: "pending",
    exception_reason_ar: "غياب دون إخطار — بانتظار مراجعة المدير المباشر",
    exception_reason_en: "Unnotified absence — pending direct manager review",
  },
  {
    ...recordBase("att-2026-06-12-007"),
    employee_id: "emp-007",
    date: B,
    check_in: "08:05",
    check_out: "16:45",
    method: "gps",
    verified_location_id: "loc-cairo",
    project_id: "prj-hq",
    late_minutes: 5,
    overtime_minutes: 0,
    status: "assignment",
    exception_status: "none",
    exception_reason_ar: "مأمورية بين موقعَي بنبان والقاهرة",
    exception_reason_en: "Assignment between Benban and Cairo sites",
  },
];

export function recordsForDate(date: string): AttendanceRecord[] {
  return ATTENDANCE_RECORDS.filter((r) => r.date === date);
}

export function pendingExceptions(): AttendanceRecord[] {
  return ATTENDANCE_RECORDS.filter((r) => r.exception_status === "pending");
}

/* ------------------------------------------------------------------ */
/* Monthly summary → Payroll feed (June 2026, days 1–12 worked so far)  */
/*                                                                      */
/* overtime_amount and deduction_amount are the *approved* values that  */
/* enter Payroll Stage 5 as adjustments (Policies 4 & 7).               */
/* ------------------------------------------------------------------ */

export const ATTENDANCE_MONTH = "2026-06-01";

export const ATTENDANCE_SUMMARY: AttendanceMonthSummary[] = [
  {
    employee_id: "emp-001",
    worked_days: 10,
    absent_days: 0,
    leave_days: 0,
    assignment_days: 0,
    late_minutes: 0,
    overtime_minutes: 320,
    overtime_amount: 1850,
    deduction_amount: 0,
  },
  {
    employee_id: "emp-002",
    worked_days: 9,
    absent_days: 0,
    leave_days: 1,
    assignment_days: 0,
    late_minutes: 96,
    overtime_minutes: 0,
    overtime_amount: 0,
    deduction_amount: 0,
  },
  {
    employee_id: "emp-003",
    worked_days: 8,
    absent_days: 0,
    leave_days: 2,
    assignment_days: 0,
    late_minutes: 0,
    overtime_minutes: 0,
    overtime_amount: 0,
    deduction_amount: 0,
  },
  {
    employee_id: "emp-006",
    worked_days: 8,
    absent_days: 1,
    leave_days: 0,
    assignment_days: 0,
    late_minutes: 0,
    overtime_minutes: 0,
    overtime_amount: 0,
    deduction_amount: -590,
  },
  {
    employee_id: "emp-007",
    worked_days: 7,
    absent_days: 0,
    leave_days: 0,
    assignment_days: 3,
    late_minutes: 12,
    overtime_minutes: 0,
    overtime_amount: 0,
    deduction_amount: 0,
  },
];
