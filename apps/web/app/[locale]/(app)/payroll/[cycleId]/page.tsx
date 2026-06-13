import { getLocale, getTranslations } from "next-intl/server";
import {
  PAYROLL_CYCLES,
  cycleItems,
  cycleAdjustments,
} from "@/lib/data/mock/payroll";
import {
  EMPLOYEES,
  COMPENSATIONS,
  GRADES,
  JOB_TITLES,
  PROJECTS,
  ALLOCATIONS,
} from "@/lib/data/mock/seed";
import { PayrollRegisterClient } from "./PayrollRegisterClient";

export default async function PayrollCyclePage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("payroll");

  const cycle = PAYROLL_CYCLES.find((c) => c.id === cycleId) ?? null;

  if (!cycle) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
        <p className="text-[15px] font-bold">{t("notFound")}</p>
      </div>
    );
  }

  const items = cycleItems(cycleId);
  const adjustments = cycleAdjustments(cycleId);

  const enriched = items.map((item) => {
    const emp = EMPLOYEES.find((e) => e.id === item.employee_id)!;
    const comp = COMPENSATIONS.find((c) => c.employee_id === item.employee_id) ?? null;
    const grade = GRADES.find((g) => g.id === emp.grade_id) ?? null;
    const jobTitle = JOB_TITLES.find((j) => j.id === emp.job_title_id) ?? null;
    const alloc = ALLOCATIONS.filter((a) => a.employee_id === emp.id);
    const primaryProject = alloc[0]
      ? PROJECTS.find((p) => p.id === alloc[0].project_id) ?? null
      : null;
    return {
      item,
      emp,
      comp,
      grade,
      jobTitle,
      primaryProject,
      primaryAllocPct: alloc[0]?.allocation_pct ?? 100,
    };
  });

  const employeeMap = Object.fromEntries(EMPLOYEES.map((e) => [e.id, e]));

  return (
    <PayrollRegisterClient
      cycle={cycle}
      enriched={enriched}
      adjustments={adjustments}
      employeeMap={employeeMap}
      locale={locale}
    />
  );
}
