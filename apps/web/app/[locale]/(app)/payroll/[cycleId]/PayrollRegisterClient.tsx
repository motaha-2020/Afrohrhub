"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type {
  Employee,
  EmployeeCompensation,
  Grade,
  JobTitle,
  PayrollAdjustment,
  PayrollCycle,
  PayrollCycleStatus,
  PayrollItem,
  PayrollItemStatus,
  Project,
} from "@/lib/data/types";
import { CYCLE_STAGE_ORDER } from "@/lib/data/mock/payroll";

const CYCLE_STATUS_VARIANT: Record<PayrollCycleStatus, BadgeVariant> = {
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

const ITEM_STATUS_VARIANT: Record<PayrollItemStatus, BadgeVariant> = {
  draft:     "gray",
  validated: "blue",
  processed: "purple",
  paid:      "green",
};

interface EnrichedItem {
  item: PayrollItem;
  emp: Employee;
  comp: EmployeeCompensation | null;
  grade: Grade | null;
  jobTitle: JobTitle | null;
  primaryProject: Project | null;
  primaryAllocPct: number;
}

export function PayrollRegisterClient({
  cycle: initialCycle,
  enriched,
  adjustments,
  employeeMap,
}: {
  cycle: PayrollCycle;
  enriched: EnrichedItem[];
  adjustments: PayrollAdjustment[];
  employeeMap: Record<string, Employee>;
  locale: string;
}) {
  const t = useTranslations("payroll");
  const locale = useLocale();

  const [cycle, setCycle] = useState(initialCycle);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);

  const currentStageIdx = CYCLE_STAGE_ORDER.indexOf(cycle.status);
  const nextStage = CYCLE_STAGE_ORDER[currentStageIdx + 1] ?? null;
  const selectedEntry = enriched.find((e) => e.item.id === selectedItemId) ?? null;

  function advanceStage() {
    if (!nextStage || cycle.locked) return;
    setCycle((prev) => ({ ...prev, status: nextStage }));
    setAdvanced(true);
  }

  const month = new Date(cycle.month + "T12:00:00Z").toLocaleString(
    locale === "ar" ? "ar-EG" : "en-US",
    { month: "long", year: "numeric" }
  );

  const totalAdjustments = adjustments.reduce((s, a) => s + a.amount, 0);

  return (
    <>
      <div className="mb-4">
        <Link
          href="/payroll"
          className="text-[12.5px] font-semibold text-muted hover:text-ink"
        >
          ← {t("backToPayroll")}
        </Link>
      </div>

      {/* Cycle header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{month}</h1>
          <p className="text-[12.5px] text-muted">
            {t("register.title")} · {enriched.length} {t("employees")}
            {cycle.deadline_at && (
              <>
                {" "}· {t("deadline")}:{" "}
                {formatDate(cycle.deadline_at.slice(0, 10), locale)}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={CYCLE_STATUS_VARIANT[cycle.status]}>
            {t(`cycleStatus.${cycle.status}`)}
          </Badge>
          {!cycle.locked && nextStage && (
            <button
              onClick={advanceStage}
              className="rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
            >
              {t("advance")} →
            </button>
          )}
          {cycle.locked && <Badge variant="gray">{t("locked")}</Badge>}
        </div>
      </div>

      {advanced && (
        <div className="mb-4">
          <Alert variant="green">
            {t("advancedTo", { stage: t(`stages.${cycle.status}`) })}
          </Alert>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {(
          [
            {
              label: t("kpi.totalGross"),
              value: `${formatNumber(cycle.total_gross, locale)} ${t("egp")}`,
            },
            {
              label: t("kpi.adjustments"),
              value: `${formatNumber(totalAdjustments, locale)} ${t("egp")}`,
            },
            {
              label: t("kpi.totalNet"),
              value: `${formatNumber(cycle.total_net, locale)} ${t("egp")}`,
            },
          ] as const
        ).map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-line bg-card p-4 shadow-sm"
          >
            <p className="text-[11.5px] text-muted">{card.label}</p>
            <p className="mt-1 text-[18px] font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {/* Payroll register table */}
          <Card title={t("register.title")}>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line text-[11px] text-muted">
                    <th className="pb-2 pe-3 text-start font-medium">
                      {t("register.employee")}
                    </th>
                    <th className="pb-2 pe-3 text-start font-medium">
                      {t("register.grade")}
                    </th>
                    <th className="pb-2 pe-3 text-start font-medium">
                      {t("register.project")}
                    </th>
                    <th className="pb-2 pe-3 text-end font-medium">
                      {t("register.gross")}
                    </th>
                    <th className="pb-2 pe-3 text-end font-medium">
                      {t("register.taxes")}
                    </th>
                    <th className="pb-2 pe-3 text-end font-medium">
                      {t("register.si")}
                    </th>
                    <th className="pb-2 pe-3 text-end font-medium">
                      {t("register.net")}
                    </th>
                    <th className="pb-2 text-center font-medium">
                      {t("register.status")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.map(
                    ({ item, emp, grade, primaryProject, primaryAllocPct }) => {
                      const isSelected = item.id === selectedItemId;
                      return (
                        <tr
                          key={item.id}
                          onClick={() =>
                            setSelectedItemId(isSelected ? null : item.id)
                          }
                          className={[
                            "cursor-pointer border-b border-line/60 transition-colors last:border-0",
                            isSelected ? "bg-primary/5" : "hover:bg-page",
                          ].join(" ")}
                        >
                          <td className="py-2.5 pe-3">
                            <p className="font-semibold">
                              {locale === "ar" ? emp.name_ar : emp.name_en}
                            </p>
                            <p className="text-[11px] text-muted">
                              {emp.hr_code}
                            </p>
                          </td>
                          <td className="py-2.5 pe-3 text-muted">
                            {grade?.code ?? "—"}
                          </td>
                          <td className="py-2.5 pe-3 text-muted">
                            {primaryProject
                              ? `${locale === "ar" ? primaryProject.name_ar : primaryProject.name_en}${primaryAllocPct < 100 ? ` ${primaryAllocPct}%` : ""}`
                              : "—"}
                          </td>
                          <td className="py-2.5 pe-3 text-end tabular-nums">
                            {formatNumber(item.gross, locale)}
                          </td>
                          <td className="py-2.5 pe-3 text-end tabular-nums text-red">
                            ({formatNumber(item.taxes, locale)})
                          </td>
                          <td className="py-2.5 pe-3 text-end tabular-nums text-muted">
                            ({formatNumber(item.social_insurance, locale)})
                          </td>
                          <td className="py-2.5 pe-3 text-end font-bold tabular-nums">
                            {formatNumber(item.net, locale)}
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge variant={ITEM_STATUS_VARIANT[item.status]}>
                              {t(`itemStatus.${item.status}`)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Adjustments */}
          {adjustments.length > 0 && (
            <Card title={t("adjustments.title")}>
              <ul className="space-y-2">
                {adjustments.map((adj) => {
                  const emp = employeeMap[adj.employee_id];
                  return (
                    <li
                      key={adj.id}
                      className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 text-[12.5px] last:border-0"
                    >
                      <div>
                        <p className="font-semibold">
                          {locale === "ar" ? emp?.name_ar : emp?.name_en}
                        </p>
                        <p className="text-[11px] text-muted">
                          {t(`adjustments.types.${adj.type}`)} ·{" "}
                          {locale === "ar" ? adj.label_ar : adj.label_en}
                        </p>
                      </div>
                      <span className="font-bold tabular-nums text-red">
                        {formatNumber(adj.amount, locale)} {t("egp")}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[11px] text-muted">
                {t("adjustments.policyNote")}
              </p>
            </Card>
          )}
        </div>

        {/* Payslip panel */}
        {selectedEntry ? (
          <Card title={`📄 ${t("payslip.title")}`}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="text-[14px] font-bold">
                  {locale === "ar"
                    ? selectedEntry.emp.name_ar
                    : selectedEntry.emp.name_en}
                </p>
                <p className="text-[11.5px] text-muted">
                  {locale === "ar"
                    ? selectedEntry.jobTitle?.name_ar
                    : selectedEntry.jobTitle?.name_en}{" "}
                  · {selectedEntry.grade?.code}
                </p>
                <p className="text-[11px] text-muted">{month}</p>
              </div>
              <button
                onClick={() => setSelectedItemId(null)}
                className="text-[11px] text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Earnings */}
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
              {t("payslip.earnings")}
            </p>
            <dl className="space-y-1 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-muted">{t("payslip.basicSalary")}</dt>
                <dd className="font-semibold tabular-nums">
                  {formatNumber(
                    selectedEntry.item.components.basic_salary,
                    locale
                  )}
                </dd>
              </div>
              {Object.entries(selectedEntry.item.components.allowances).map(
                ([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-muted capitalize">
                      {t.has(`allowanceTypes.${key}`)
                        ? t(`allowanceTypes.${key}` as Parameters<typeof t>[0])
                        : key}
                    </dt>
                    <dd className="font-semibold tabular-nums">
                      {formatNumber(val, locale)}
                    </dd>
                  </div>
                )
              )}
              <div className="flex justify-between border-t border-line pt-1 font-bold">
                <dt>{t("payslip.gross")}</dt>
                <dd className="tabular-nums">
                  {formatNumber(selectedEntry.item.gross, locale)}
                </dd>
              </div>
            </dl>

            {/* Deductions */}
            <p className="mb-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest text-muted">
              {t("payslip.deductions")}
            </p>
            <dl className="space-y-1 text-[12px]">
              <div className="flex justify-between">
                <dt className="text-muted">{t("payslip.incomeTax")}</dt>
                <dd className="font-semibold tabular-nums text-red">
                  ({formatNumber(selectedEntry.item.taxes, locale)})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">
                  {t("payslip.socialInsurance")} (11%)
                </dt>
                <dd className="font-semibold tabular-nums text-red">
                  ({formatNumber(selectedEntry.item.social_insurance, locale)})
                </dd>
              </div>
              {adjustments
                .filter((a) => a.employee_id === selectedEntry.emp.id)
                .map((adj) => (
                  <div key={adj.id} className="flex justify-between">
                    <dt className="text-muted">
                      {locale === "ar" ? adj.label_ar : adj.label_en}
                    </dt>
                    <dd className="font-semibold tabular-nums text-red">
                      ({formatNumber(Math.abs(adj.amount), locale)})
                    </dd>
                  </div>
                ))}
              <div className="flex justify-between border-t border-line pt-1">
                <dt className="text-muted">{t("payslip.totalDeductions")}</dt>
                <dd className="font-semibold tabular-nums text-red">
                  (
                  {formatNumber(
                    selectedEntry.item.taxes +
                      selectedEntry.item.social_insurance +
                      Math.abs(
                        adjustments
                          .filter((a) => a.employee_id === selectedEntry.emp.id)
                          .reduce((s, a) => s + a.amount, 0)
                      ),
                    locale
                  )}
                  )
                </dd>
              </div>
            </dl>

            {/* Net pay */}
            <div className="mt-4 rounded-xl bg-green/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold">
                  {t("payslip.netPay")}
                </span>
                <span className="text-[16px] font-extrabold text-green tabular-nums">
                  {formatNumber(selectedEntry.item.net, locale)} {t("egp")}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[10.5px] text-muted">
              {t("payslip.taxNote")}
            </p>
          </Card>
        ) : (
          <Card>
            <div className="py-8 text-center">
              <p className="text-[13px] text-muted">
                {t("register.selectEmployee")}
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
