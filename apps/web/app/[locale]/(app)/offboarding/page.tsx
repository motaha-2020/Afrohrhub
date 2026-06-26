import { getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Stepper, type Step } from "@/components/ui/Stepper";
import {
  OFFBOARDING_CASES,
  OFFBOARDING_KPIS,
  OFFBOARDING_STAGE_LABELS,
  type OffboardingCase,
} from "@/lib/data/mock/modules";
import { formatDate, formatNumber } from "@/lib/utils/format";

function buildSteps(c: OffboardingCase, locale: string): Step[] {
  return OFFBOARDING_STAGE_LABELS.map((label, i) => {
    const n = i + 1;
    return {
      label: locale === "ar" ? label.ar : label.en,
      state: n < c.stage ? "done" : n === c.stage ? "current" : "upcoming",
    };
  });
}

export default async function OffboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("offboarding");
  const ar = locale === "ar";

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Button>{t("newCase")}</Button>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.openCases")} value={OFFBOARDING_KPIS.open_cases} />
        <KpiCard
          label={t("kpi.dueWeek")}
          value={OFFBOARDING_KPIS.due_this_week}
          sub={t("kpi.dueSub")}
          tone="down"
        />
        <KpiCard label={t("kpi.pendingClearance")} value={OFFBOARDING_KPIS.pending_clearance} />
        <KpiCard label={t("kpi.pendingSettlement")} value={OFFBOARDING_KPIS.pending_settlement} />
      </div>

      <div className="flex flex-col gap-3.5">
        {OFFBOARDING_CASES.map((c) => {
          const doneCount = c.clearance.filter((i) => i.done).length;
          return (
            <Card key={c.id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <b className="text-[15px]">{ar ? c.name_ar : c.name_en}</b>
                  <small className="block text-[11.5px] text-muted">
                    {ar ? c.reason_ar : c.reason_en} ·{" "}
                    {t("lastDay", { date: formatDate(c.last_working_day, locale) })}
                  </small>
                </div>
                <Badge variant={c.access_cut ? "green" : "red"}>
                  {c.access_cut ? t("accessCut") : t("accessActive")}
                </Badge>
              </div>

              {c.access_cut ? null : (
                <Alert variant="red" className="mb-3">
                  {t("accessWarning")}
                </Alert>
              )}

              <Stepper steps={buildSteps(c, locale)} />

              <div className="mt-2 grid gap-3.5 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-[12.5px] font-bold">
                    {t("clearanceTitle", { done: doneCount, total: c.clearance.length })}
                  </h4>
                  <ul className="flex flex-col gap-1.5">
                    {c.clearance.map((item) => (
                      <li
                        key={item.key}
                        className="flex items-center justify-between rounded-[8px] border border-line px-3 py-1.5 text-[12.5px]"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={
                              item.done
                                ? "text-green"
                                : "text-muted"
                            }
                          >
                            {item.done ? "✓" : "○"}
                          </span>
                          {ar ? item.name_ar : item.name_en}
                        </span>
                        <small className="text-[11px] text-muted">
                          {ar ? item.owner_ar : item.owner_en}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-[12.5px] font-bold">{t("settlementTitle")}</h4>
                  <div className="rounded-[10px] border border-line bg-[#fafbfd] p-3.5">
                    <div className="text-[11.5px] text-muted">{t("netSettlement")}</div>
                    <div className="my-1 text-[24px] font-extrabold">
                      {formatNumber(c.final_settlement_egp, locale)}{" "}
                      <span className="text-sm font-bold text-muted">{t("egp")}</span>
                    </div>
                    <Badge
                      variant={
                        c.settlement_state === "paid"
                          ? "green"
                          : c.settlement_state === "approved"
                            ? "blue"
                            : "yellow"
                      }
                    >
                      {t(`settlement.${c.settlement_state}`)}
                    </Badge>
                    <p className="mt-2 text-[11px] text-muted">{t("settlementNote")}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-1.5">
                <Button size="sm" variant="outline">
                  {t("openCase")}
                </Button>
                <Button size="sm">{t("advanceStage")}</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
