import { getTranslations } from "next-intl/server";
import { getServerSession } from "@/lib/auth/session.server";
import {
  ATTENDANCE_RECORDS,
  ATTENDANCE_SUMMARY,
  ATTENDANCE_MONTH,
} from "@/lib/data/mock/attendance";
import {
  balancesFor,
  LEAVE_REQUESTS,
  LEAVE_TYPES,
} from "@/lib/data/mock/leave";
import {
  PAYROLL_CYCLES,
  PAYROLL_ITEMS,
  employeeAdjustments,
} from "@/lib/data/mock/payroll";
import {
  DEMO_TODAY,
  DOCUMENT_TYPES,
  EMPLOYEE_DOCUMENTS,
  EMPLOYEES,
  JOB_TITLES,
} from "@/lib/data/mock/seed";
import { daysBetween } from "@/lib/utils/format";
import { EssPortalClient, type EssData } from "./EssPortalClient";

/** Falls back to the demo ESS employee when the persona has no link. */
const DEFAULT_ESS_EMPLOYEE = "emp-002";

export default async function EssPage() {
  const { persona } = await getServerSession();
  const t = await getTranslations("ess");
  const employeeId = persona.employee_id ?? DEFAULT_ESS_EMPLOYEE;

  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  if (!employee) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
        <p className="text-[15px] font-bold">{t("notLinked.title")}</p>
        <p className="mt-1 text-[13px] text-muted">{t("notLinked.body")}</p>
      </div>
    );
  }

  const jobTitle = JOB_TITLES.find((j) => j.id === employee.job_title_id);
  const todayRecord =
    ATTENDANCE_RECORDS.find(
      (r) => r.employee_id === employeeId && r.date === DEMO_TODAY
    ) ?? null;
  const monthSummary =
    ATTENDANCE_SUMMARY.find((s) => s.employee_id === employeeId) ?? null;
  const balances = balancesFor(employeeId);
  const requests = LEAVE_REQUESTS.filter((r) => r.employee_id === employeeId);

  const currentCycle = PAYROLL_CYCLES[0];
  const payslip =
    PAYROLL_ITEMS.find(
      (i) => i.employee_id === employeeId && i.cycle_id === currentCycle.id
    ) ?? null;
  const adjustments = payslip
    ? employeeAdjustments(currentCycle.id, employeeId)
    : [];

  const documents = EMPLOYEE_DOCUMENTS.filter(
    (d) => d.employee_id === employeeId
  )
    .map((d) => {
      const type = DOCUMENT_TYPES.find((dt) => dt.id === d.document_type_id)!;
      return {
        id: d.id,
        name_ar: type.name_ar,
        name_en: type.name_en,
        status: d.status,
        expiry_date: d.expiry_date,
        days_left: d.expiry_date
          ? daysBetween(DEMO_TODAY, d.expiry_date)
          : null,
        sort_order: type.sort_order,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  const data: EssData = {
    employee: {
      id: employee.id,
      hr_code: employee.hr_code,
      name_ar: employee.name_ar,
      name_en: employee.name_en,
      mobile: employee.mobile,
      job_title_ar: jobTitle?.name_ar ?? "—",
      job_title_en: jobTitle?.name_en ?? "—",
      collar: employee.collar,
    },
    today: todayRecord,
    monthSummary,
    month: ATTENDANCE_MONTH,
    balances,
    requests,
    leaveTypes: LEAVE_TYPES.map((lt) => ({
      code: lt.code,
      name_ar: lt.name_ar,
      name_en: lt.name_en,
    })),
    payslip,
    adjustments,
    payMonth: currentCycle.month,
    documents,
  };

  return <EssPortalClient data={data} />;
}
