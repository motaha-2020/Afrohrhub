import { getLocale, getTranslations } from "next-intl/server";
import { KPI_CYCLES, cycleScores } from "@/lib/data/mock/kpi";
import { EMPLOYEES, PROJECTS } from "@/lib/data/mock/seed";
import { KpiDetailClient } from "./KpiDetailClient";

export default async function KpiCyclePage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;
  const locale = await getLocale();
  const t = await getTranslations("kpi");

  const cycle = KPI_CYCLES.find((c) => c.id === cycleId) ?? null;

  if (!cycle) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
        <p className="text-[15px] font-bold">{t("notFound")}</p>
      </div>
    );
  }

  const scores = cycleScores(cycleId);

  const enriched = scores.map((score) => {
    const emp = EMPLOYEES.find((e) => e.id === score.employee_id)!;
    const project = PROJECTS.find((p) => p.id === score.project_id)!;
    return { score, emp, project };
  });

  return (
    <KpiDetailClient
      cycle={cycle}
      enriched={enriched}
      locale={locale}
    />
  );
}
