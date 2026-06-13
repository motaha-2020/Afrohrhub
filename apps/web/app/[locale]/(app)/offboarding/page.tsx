import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { SlaCountdown } from "@/components/ui/SlaCountdown";
import {
  OFFBOARDING_CASES,
  clearanceProgress,
  stageProgress,
} from "@/lib/data/mock/offboarding";
import { PROJECTS } from "@/lib/data/mock/seed";
import {
  daysBetween,
  formatDate,
  formatNumber,
  localizedName,
} from "@/lib/utils/format";
import type { OffboardingStatus } from "@/lib/data/types";

const STATUS_VARIANT: Record<OffboardingStatus, BadgeVariant> = {
  in_progress: "blue",
  clearance: "yellow",
  settlement: "purple",
  archived: "gray",
};

export default async function OffboardingPage() {
  const locale = await getLocale();
  const t = await getTranslations("offboarding");
  const today = new Date().toISOString().slice(0, 10);

  const open = OFFBOARDING_CASES.filter((c) => c.status !== "archived");
  const inClearance = open.filter((c) => {
    const p = clearanceProgress(c);
    return p.done < p.total;
  });
  const pendingSettlement = open.filter(
    (c) => !c.settlement.finance_approved
  );
  const archivedThisMonth = OFFBOARDING_CASES.filter(
    (c) => c.status === "archived"
  );

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label={t("kpi.open")}
          value={open.length}
          sub={t("kpi.openSub", {
            count: open.filter((c) => c.priority === "P0").length,
          })}
        />
        <KpiCard
          label={t("kpi.inClearance")}
          value={inClearance.length}
          sub={t("kpi.inClearanceSub")}
        />
        <KpiCard
          label={t("kpi.pendingSettlement")}
          value={pendingSettlement.length}
          sub={t("kpi.pendingSettlementSub")}
          tone="down"
        />
        <KpiCard
          label={t("kpi.archived")}
          value={archivedThisMonth.length}
          sub={t("kpi.archivedSub")}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-page text-start text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3 text-start">{t("columns.employee")}</th>
              <th className="px-5 py-3 text-start max-lg:hidden">
                {t("columns.project")}
              </th>
              <th className="px-5 py-3 text-start">{t("columns.reason")}</th>
              <th className="px-5 py-3 text-start">{t("columns.stage")}</th>
              <th className="px-5 py-3 text-start max-lg:hidden">
                {t("columns.lwd")}
              </th>
              <th className="px-5 py-3 text-start">{t("columns.sla")}</th>
              <th className="px-5 py-3 text-start">{t("columns.status")}</th>
            </tr>
          </thead>
          <tbody>
            {OFFBOARDING_CASES.map((c) => {
              const project = PROJECTS.find((p) => p.id === c.project_id);
              const progress = stageProgress(c);
              const hoursLeft = daysBetween(today, c.last_working_day) * 24;
              const name =
                locale === "ar" ? c.employee_name_ar : c.employee_name_en;
              const jobTitle =
                locale === "ar" ? c.job_title_ar : c.job_title_en;
              return (
                <tr
                  key={c.id}
                  className="border-b border-line transition-colors last:border-b-0 hover:bg-page/60"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/offboarding/${c.id}`}
                      className="font-semibold leading-snug text-primary hover:underline"
                    >
                      {name}
                    </Link>
                    <p className="mt-0.5 text-[11.5px] text-muted">
                      {c.case_code} · {jobTitle}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-muted max-lg:hidden">
                    {project ? localizedName(project, locale) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="gray">{t(`reasons.${c.reason}`)}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#e3e8f0]">
                        <div
                          className="h-full rounded-full bg-green"
                          style={{
                            width: `${(progress.done / progress.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11.5px] font-semibold text-muted">
                        {t("stageOf", {
                          done: progress.done,
                          total: progress.total,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted max-lg:hidden">
                    {formatDate(c.last_working_day, locale)}
                  </td>
                  <td className="px-5 py-3.5">
                    {c.status === "archived" ? (
                      <span className="text-[12px] text-muted">—</span>
                    ) : (
                      <SlaCountdown
                        hours={hoursLeft}
                        priority={c.priority}
                        locale={locale}
                      />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_VARIANT[c.status]}>
                      {t(`statuses.${c.status}`)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-muted">
        {t("policyNote", {
          settlement: `${formatNumber(
            OFFBOARDING_CASES[0].settlement.net_settlement,
            locale
          )} ${t("egp")}`,
        })}
      </p>
    </>
  );
}
