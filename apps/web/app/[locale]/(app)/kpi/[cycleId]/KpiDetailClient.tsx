"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils/format";
import type {
  KpiCycle,
  KpiCycleStatus,
  KpiScore,
  Employee,
  Project,
} from "@/lib/data/types";
import { KPI_CYCLE_STAGE_ORDER } from "@/lib/data/mock/kpi";

const STATUS_VARIANT: Record<KpiCycleStatus, BadgeVariant> = {
  evaluation_receipt: "blue",
  bonus_calculation: "blue",
  validation: "purple",
  finance_submission: "yellow",
  payment: "yellow",
  cost_reporting: "green",
};

const SCORE_STATUS_VARIANT: Record<KpiScore["status"], BadgeVariant> = {
  draft: "gray",
  submitted: "blue",
  approved: "green",
  paid: "green",
};

function scoreColor(score: number): string {
  if (score >= 90) return "text-green font-extrabold";
  if (score >= 75) return "text-primary font-bold";
  if (score >= 60) return "text-yellow font-bold";
  return "text-red font-bold";
}

interface EnrichedScore {
  score: KpiScore;
  emp: Employee;
  project: Project;
}

export function KpiDetailClient({
  cycle: initialCycle,
  enriched,
  locale,
}: {
  cycle: KpiCycle;
  enriched: EnrichedScore[];
  locale: string;
}) {
  const t = useTranslations("kpi");
  const [cycle, setCycle] = useState(initialCycle);
  const [advancedBanner, setAdvancedBanner] = useState<string | null>(null);

  const stageIdx = KPI_CYCLE_STAGE_ORDER.indexOf(cycle.status);
  const nextStage = KPI_CYCLE_STAGE_ORDER[stageIdx + 1] ?? null;

  function advanceStage() {
    if (!nextStage || cycle.locked) return;
    setCycle((prev) => ({ ...prev, status: nextStage }));
    setAdvancedBanner(t(`stages.${nextStage}`));
  }

  const totalBonus = enriched.reduce((s, e) => s + e.score.bonus_amount, 0);
  const avgScore =
    enriched.length > 0
      ? Math.round(
          enriched.reduce((s, e) => s + e.score.score, 0) / enriched.length
        )
      : 0;

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/kpi"
            className="text-[12px] text-muted hover:underline"
          >
            ← {t("backToKpi")}
          </Link>
          <h1 className="mt-1 text-[21px] font-bold">
            {t("cycleTitle")} — {cycle.quarter}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[cycle.status]}>
            {t(`cycleStatus.${cycle.status}`)}
          </Badge>
          {!cycle.locked && nextStage && (
            <button
              onClick={advanceStage}
              className="rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-bold text-white hover:opacity-90"
            >
              {t("advance")} →
            </button>
          )}
          {cycle.locked && (
            <span className="rounded-lg bg-[#eef1f5] px-3 py-1.5 text-[12.5px] font-bold text-muted">
              🔒 {t("locked")}
            </span>
          )}
        </div>
      </div>

      {advancedBanner && (
        <div className="mb-4 rounded-xl bg-green-soft px-4 py-3 text-[13px] font-semibold text-green">
          ✓ {t("advancedTo", { stage: advancedBanner })}
        </div>
      )}

      {/* KPI summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          { label: t("kpi.employees"), value: String(cycle.employee_count) },
          { label: t("kpi.avgScore"), value: `${avgScore}%` },
          {
            label: t("kpi.totalBonus"),
            value: `${formatNumber(totalBonus, locale)} ${t("egp")}`,
          },
          { label: t("kpi.quarter"), value: cycle.quarter },
        ] as const).map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-line bg-card p-4 shadow-sm"
          >
            <p className="text-[11.5px] text-muted">{card.label}</p>
            <p className="mt-1 text-[20px] font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Stage progress */}
      <Card className="mb-4">
        <ol className="flex flex-wrap gap-2">
          {KPI_CYCLE_STAGE_ORDER.map((stage, idx) => {
            const done = idx < stageIdx;
            const active = idx === stageIdx;
            return (
              <li key={stage} className="flex items-center gap-1.5">
                <span
                  className={[
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                    done
                      ? "bg-green text-white"
                      : active
                        ? "bg-primary text-white"
                        : "bg-[#e3e8f0] text-muted",
                  ].join(" ")}
                >
                  {done ? "✓" : idx + 1}
                </span>
                <span
                  className={[
                    "text-[12px]",
                    done
                      ? "text-muted line-through"
                      : active
                        ? "font-semibold text-ink"
                        : "text-muted",
                  ].join(" ")}
                >
                  {t(`stages.${stage}`)}
                </span>
                {idx < KPI_CYCLE_STAGE_ORDER.length - 1 && (
                  <span className="text-muted">·</span>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Scores table */}
      <Card title={t("scoresTable.title")} flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("scoresTable.employee")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("scoresTable.project")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("scoresTable.score")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("scoresTable.bonus")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("scoresTable.evaluatedBy")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("scoresTable.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {enriched.map(({ score, emp, project }) => {
                const empName = locale === "ar" ? emp.name_ar : emp.name_en;
                const projectName =
                  locale === "ar" ? project.name_ar : project.name_en;
                const evaluatedBy =
                  locale === "ar"
                    ? score.evaluated_by_ar
                    : score.evaluated_by_en;
                return (
                  <tr
                    key={score.id}
                    className="border-b border-line/40 last:border-0"
                  >
                    <td className="px-[18px] py-2.5 font-medium">{empName}</td>
                    <td className="px-[18px] py-2.5 text-muted">
                      {projectName}
                    </td>
                    <td
                      className={`px-[18px] py-2.5 text-end tabular-nums ${scoreColor(score.score)}`}
                    >
                      {score.score}%
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums font-bold">
                      {formatNumber(score.bonus_amount, locale)} {t("egp")}
                    </td>
                    <td className="px-[18px] py-2.5 text-muted">
                      {evaluatedBy}
                    </td>
                    <td className="px-[18px] py-2.5 text-end">
                      <Badge variant={SCORE_STATUS_VARIANT[score.status]}>
                        {t(`scoreStatus.${score.status}`)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-[#fafbfd]">
                <td
                  colSpan={3}
                  className="px-[18px] py-2.5 text-[12px] font-bold text-muted"
                >
                  {t("scoresTable.total")}
                </td>
                <td className="px-[18px] py-2.5 text-end text-[14px] font-extrabold text-primary tabular-nums">
                  {formatNumber(totalBonus, locale)} {t("egp")}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="px-[18px] py-3 text-[11px] text-muted">
          {t("policyNote")}
        </p>
      </Card>
    </>
  );
}
