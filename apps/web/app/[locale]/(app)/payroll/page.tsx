import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PAYROLL_CYCLES, CYCLE_STAGE_ORDER } from "@/lib/data/mock/payroll";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { PayrollCycleStatus } from "@/lib/data/types";

const STATUS_VARIANT: Record<PayrollCycleStatus, BadgeVariant> = {
  new_hires:            "blue",
  validation:           "blue",
  register_updated:     "blue",
  allocations_review:   "purple",
  adjustments:          "purple",
  processing:           "purple",
  submitted_to_finance: "yellow",
  paid:                 "green",
  cost_reported:        "green",
};

export default async function PayrollPage() {
  const locale = await getLocale();
  const t = await getTranslations("payroll");

  const [current, ...history] = PAYROLL_CYCLES;
  const currentStageIdx = CYCLE_STAGE_ORDER.indexOf(current.status);

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
          { label: t("kpi.activeEmployees"), value: String(current.employee_count) },
          {
            label: t("kpi.totalGross"),
            value: `${formatNumber(current.total_gross, locale)} ${t("egp")}`,
          },
          {
            label: t("kpi.totalNet"),
            value: `${formatNumber(current.total_net, locale)} ${t("egp")}`,
          },
          {
            label: t("kpi.nextDeadline"),
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
        {/* Current cycle — 9-step stepper */}
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
                href={`/payroll/${current.id}`}
                className="rounded-lg bg-primary px-3 py-1.5 text-[12.5px] font-bold text-white hover:opacity-90"
              >
                {t("viewCycle")} →
              </Link>
            </div>
          </div>

          <ol className="space-y-2">
            {CYCLE_STAGE_ORDER.map((stage, idx) => {
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
                        {cycle.employee_count} {t("employees")} ·{" "}
                        {formatNumber(cycle.total_gross, locale)} {t("egp")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[cycle.status]}>
                        {t(`cycleStatus.${cycle.status}`)}
                      </Badge>
                      <Link
                        href={`/payroll/${cycle.id}`}
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
          <p className="mt-3 text-[11px] text-muted">{t("policyNote")}</p>
        </Card>
      </div>
    </>
  );
}
