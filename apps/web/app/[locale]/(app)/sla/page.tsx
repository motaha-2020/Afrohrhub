import { getTranslations } from "next-intl/server";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { SlaCountdown } from "@/components/ui/SlaCountdown";
import { SLA_ITEMS } from "@/lib/data/mock/approvals";
import type { SlaItem } from "@/lib/data/types";

const MODULE_ICON: Record<SlaItem["module"], string> = {
  recruitment: "🎯",
  onboarding: "🚀",
  payroll: "💰",
  leave: "🏖",
  offboarding: "📦",
  advance: "💵",
};

const STATUS_VARIANT: Record<
  SlaItem["sla_status"],
  "green" | "yellow" | "red"
> = {
  on_time: "green",
  warning: "yellow",
  breach: "red",
};

export default async function SlaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("sla");

  const total = SLA_ITEMS.length;
  const p0Count = SLA_ITEMS.filter((i) => i.priority === "P0").length;
  const breachCount = SLA_ITEMS.filter((i) => i.sla_status === "breach").length;
  const onTimeCount = SLA_ITEMS.filter((i) => i.sla_status === "on_time").length;

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("kpi.total")} value={total} />
        <KpiCard
          label={t("kpi.p0")}
          value={p0Count}
          sub={
            <Badge variant="red">
              {t("kpi.p0")}
            </Badge>
          }
        />
        <KpiCard
          label={t("kpi.breached")}
          value={breachCount}
          sub={<Badge variant="red">{t("statuses.breach")}</Badge>}
        />
        <KpiCard
          label={t("kpi.onTime")}
          value={onTimeCount}
          sub={<Badge variant="green">{t("statuses.on_time")}</Badge>}
          tone="up"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">{t("columns.module")}</th>
              <th className="px-5 py-3">{t("columns.subject")}</th>
              <th className="px-5 py-3 max-lg:hidden">{t("columns.owner")}</th>
              <th className="px-5 py-3">{t("columns.remaining")}</th>
              <th className="px-5 py-3">{t("columns.status")}</th>
            </tr>
          </thead>
          <tbody>
            {SLA_ITEMS.sort(
              (a, b) => a.hours_remaining - b.hours_remaining
            ).map((item) => {
              const subject =
                locale === "ar" ? item.subject_ar : item.subject_en;
              const owner =
                locale === "ar" ? item.owner_name_ar : item.owner_name_en;

              return (
                <tr
                  key={item.id}
                  className="border-b border-line last:border-b-0 hover:bg-page/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span>{MODULE_ICON[item.module]}</span>
                      <Badge variant="gray">
                        {t(`modules.${item.module}`)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{subject}</td>
                  <td className="px-5 py-3.5 max-lg:hidden text-muted">
                    {owner}
                  </td>
                  <td className="px-5 py-3.5">
                    <SlaCountdown
                      hours={item.hours_remaining}
                      priority={item.priority}
                      locale={locale}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_VARIANT[item.sla_status]}>
                      {t(`statuses.${item.sla_status}`)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
