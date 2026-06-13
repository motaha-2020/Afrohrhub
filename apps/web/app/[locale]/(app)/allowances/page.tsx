import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ALLOWANCE_CYCLES,
  ALLOWANCE_CYCLE_STAGE_ORDER,
} from "@/lib/data/mock/allowances";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { AllowanceCycleStatus } from "@/lib/data/types";

const STATUS_VARIANT: Record<AllowanceCycleStatus, BadgeVariant> = {
  request_collection: "blue",
  preparation: "blue",
  validation: "purple",
  finance_submission: "yellow",
  payment: "yellow",
  cost_reporting: "green",
};

export default async function AllowancesPage() {
  const locale = await getLocale();
  const t = await getTranslations("allowances");

  const [current, ...history] = ALLOWANCE_CYCLES;
  const currentStageIdx = ALLOWANCE_CYCLE_STAGE_ORDER.indexOf(current.status);

  const month = new Date(current.month + "T12:00:00Z").toLocaleString(
    locale === "ar" ? "ar-EG" : "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          {
            label: t("kpi.projects"),
            value: String(current.project_count),
          },
          {
            label: t("kpi.employees"),
            value: String(current.employee_count),
          },
          {
            label: t("kpi.totalAmount"),
            value: `${formatNumber(current.total_amount, locale)} ${t("egp")}`,
          },
          {
            label: t("kpi.deadline"),
            value: current.deadline_at
              ? formatDate(current.deadline_at.slice(0, 10), locale)
              : "—",
          },
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

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Current cycle — 6-step stepper */}
        <Card>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11.5px] font-semibold text-muted">
                {t("currentCycle")}
              </p>
              <h2 className="text-[17px] font-bold">{month}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANT[current.status]}>
                {t(`cycleStatus.${current.status}`)}
              </Badge>
              <Link
                href={`/allowances/${current.id}`}
                className="rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-bold text-white hover:opacity-90"
              >
                {t("viewCycle")} →
              </Link>
            </div>
          </div>

          <ol className="space-y-2">
            {ALLOWANCE_CYCLE_STAGE_ORDER.map((stage, idx) => {
              const done = idx < currentStageIdx;
              const active = idx === currentStageIdx;
              return (
                <li key={stage} className="flex items-center gap-3">
                  <span
                    className={[
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                      done
                        ? "bg-green text-white"
                        : active
                          ? "bg-primary text-white"
                          : "bg-[#e3e8f0] text-muted",
                    ].join(" ")}
                  >
                    {done ? "✓" : idx + 1}
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span
                      className={[
                        "text-[12.5px]",
                        done
                          ? "text-muted line-through"
                          : active
                            ? "font-semibold text-ink"
                            : "text-muted",
                      ].join(" ")}
                    >
                      {t(`stages.${stage}`)}
                    </span>
                    <span className="text-[11px] text-muted tabular-nums">
                      {t(`stageDays.${stage}`)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 text-[11px] text-muted">{t("policyNote")}</p>
        </Card>

        {/* History */}
        <Card title={t("history")}>
          <ul className="space-y-2">
            {history.map((cycle) => {
              const m = new Date(cycle.month + "T12:00:00Z").toLocaleString(
                locale === "ar" ? "ar-EG" : "en-US",
                { month: "long", year: "numeric" }
              );
              return (
                <li
                  key={cycle.id}
                  className="border-b border-line/60 pb-2 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold">{m}</p>
                      <p className="text-[11px] text-muted">
                        {cycle.project_count} {t("projects")} ·{" "}
                        {formatNumber(cycle.total_amount, locale)} {t("egp")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[cycle.status]}>
                        {t(`cycleStatus.${cycle.status}`)}
                      </Badge>
                      <Link
                        href={`/allowances/${cycle.id}`}
                        className="text-[11.5px] font-semibold text-primary hover:underline"
                      >
                        {t("view")}
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
