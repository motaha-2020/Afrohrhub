"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils/format";
import type {
  AllowanceCycle,
  AllowanceCycleStatus,
  AllowanceEntry,
  Employee,
  Project,
} from "@/lib/data/types";
import { ALLOWANCE_CYCLE_STAGE_ORDER } from "@/lib/data/mock/allowances";

const STATUS_VARIANT: Record<AllowanceCycleStatus, BadgeVariant> = {
  request_collection: "blue",
  preparation: "blue",
  validation: "purple",
  finance_submission: "yellow",
  payment: "yellow",
  cost_reporting: "green",
};

const ENTRY_STATUS_VARIANT: Record<AllowanceEntry["status"], BadgeVariant> = {
  draft: "gray",
  submitted: "blue",
  validated: "green",
  paid: "green",
};

interface EnrichedEntry {
  entry: AllowanceEntry;
  emp: Employee;
  project: Project;
}

export function AllowanceDetailClient({
  cycle: initialCycle,
  enriched,
  projectMap,
  employeeMap: _employeeMap,
  locale,
}: {
  cycle: AllowanceCycle;
  enriched: EnrichedEntry[];
  projectMap: Record<string, Project>;
  employeeMap: Record<string, Employee>;
  locale: string;
}) {
  const t = useTranslations("allowances");
  const [cycle, setCycle] = useState(initialCycle);
  const [advancedBanner, setAdvancedBanner] = useState<string | null>(null);

  const stageIdx = ALLOWANCE_CYCLE_STAGE_ORDER.indexOf(cycle.status);
  const nextStage = ALLOWANCE_CYCLE_STAGE_ORDER[stageIdx + 1] ?? null;

  const month = new Date(cycle.month + "T12:00:00Z").toLocaleString(
    locale === "ar" ? "ar-EG" : "en-US",
    { month: "long", year: "numeric" }
  );

  function advanceStage() {
    if (!nextStage || cycle.locked) return;
    setCycle((prev) => ({ ...prev, status: nextStage }));
    setAdvancedBanner(t(`stages.${nextStage}`));
  }

  const groupedByProject = enriched.reduce<
    Record<string, { project: Project; entries: EnrichedEntry[] }>
  >((acc, item) => {
    const pid = item.entry.project_id;
    if (!acc[pid]) acc[pid] = { project: item.project, entries: [] };
    acc[pid].entries.push(item);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/allowances"
            className="text-[12px] text-muted hover:underline"
          >
            ← {t("backToAllowances")}
          </Link>
          <h1 className="mt-1 text-[21px] font-bold">
            {t("cycleTitle")} — {month}
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

      {/* Stage progress */}
      <Card className="mb-4">
        <ol className="flex flex-wrap gap-2">
          {ALLOWANCE_CYCLE_STAGE_ORDER.map((stage, idx) => {
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
                {idx < ALLOWANCE_CYCLE_STAGE_ORDER.length - 1 && (
                  <span className="text-muted">·</span>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Per-project allowance entries */}
      {Object.values(groupedByProject).map(({ project, entries }) => {
        const projectName =
          locale === "ar" ? project.name_ar : project.name_en;
        const projectTotal = entries.reduce((s, e) => s + e.entry.total, 0);

        return (
          <Card
            key={project.id}
            title={
              <span>
                {projectName}{" "}
                <span className="text-[12px] font-normal text-muted">
                  — {project.code}
                </span>
              </span>
            }
            action={
              <span className="text-[13px] font-extrabold text-ink">
                {formatNumber(projectTotal, locale)} {t("egp")}
              </span>
            }
            flush
            className="mb-4"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="py-2 text-start font-semibold">
                      {t("register.employee")}
                    </th>
                    <th className="py-2 text-end font-semibold">
                      {t("register.site")}
                    </th>
                    <th className="py-2 text-end font-semibold">
                      {t("register.transport")}
                    </th>
                    <th className="py-2 text-end font-semibold">
                      {t("register.meal")}
                    </th>
                    <th className="py-2 text-end font-semibold">
                      {t("register.total")}
                    </th>
                    <th className="py-2 text-end font-semibold">
                      {t("register.status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(({ entry, emp }) => {
                    const empName =
                      locale === "ar" ? emp.name_ar : emp.name_en;
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-line/40 last:border-0"
                      >
                        <td className="py-2 font-medium">{empName}</td>
                        <td className="py-2 text-end tabular-nums">
                          {entry.site_allowance > 0
                            ? formatNumber(entry.site_allowance, locale)
                            : "—"}
                        </td>
                        <td className="py-2 text-end tabular-nums">
                          {entry.transport_allowance > 0
                            ? formatNumber(entry.transport_allowance, locale)
                            : "—"}
                        </td>
                        <td className="py-2 text-end tabular-nums">
                          {entry.meal_allowance > 0
                            ? formatNumber(entry.meal_allowance, locale)
                            : "—"}
                        </td>
                        <td className="py-2 text-end font-bold tabular-nums">
                          {formatNumber(entry.total, locale)}
                        </td>
                        <td className="py-2 text-end">
                          <Badge variant={ENTRY_STATUS_VARIANT[entry.status]}>
                            {t(`entryStatus.${entry.status}`)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {/* Summary */}
      <Card title={t("summary.title")}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[11.5px] text-muted">{t("summary.projects")}</p>
            <p className="text-[18px] font-extrabold">{cycle.project_count}</p>
          </div>
          <div>
            <p className="text-[11.5px] text-muted">
              {t("summary.employees")}
            </p>
            <p className="text-[18px] font-extrabold">{cycle.employee_count}</p>
          </div>
          <div>
            <p className="text-[11.5px] text-muted">{t("summary.total")}</p>
            <p className="text-[18px] font-extrabold text-primary">
              {formatNumber(cycle.total_amount, locale)} {t("egp")}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted">{t("policyNote")}</p>
      </Card>
    </>
  );
}
