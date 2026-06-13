import { getLocale, getTranslations } from "next-intl/server";
import { ALLOWANCE_CYCLES, cycleEntries } from "@/lib/data/mock/allowances";
import { EMPLOYEES, PROJECTS } from "@/lib/data/mock/seed";
import { AllowanceDetailClient } from "./AllowanceDetailClient";

export default async function AllowanceCyclePage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("allowances");

  const cycle = ALLOWANCE_CYCLES.find((c) => c.id === cycleId) ?? null;

  if (!cycle) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
        <p className="text-[15px] font-bold">{t("notFound")}</p>
      </div>
    );
  }

  const entries = cycleEntries(cycleId);

  const enriched = entries.map((entry) => {
    const emp = EMPLOYEES.find((e) => e.id === entry.employee_id)!;
    const project = PROJECTS.find((p) => p.id === entry.project_id)!;
    return { entry, emp, project };
  });

  const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
  const employeeMap = Object.fromEntries(EMPLOYEES.map((e) => [e.id, e]));

  return (
    <AllowanceDetailClient
      cycle={cycle}
      enriched={enriched}
      projectMap={projectMap}
      employeeMap={employeeMap}
      locale={locale}
    />
  );
}
