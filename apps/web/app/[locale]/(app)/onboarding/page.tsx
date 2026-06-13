import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { SlaCountdown } from "@/components/ui/SlaCountdown";
import {
  ONBOARDING_CASES,
  canActivate,
  stageProgress,
} from "@/lib/data/mock/onboarding";
import { PROJECTS } from "@/lib/data/mock/seed";
import { daysBetween, formatDate, localizedName } from "@/lib/utils/format";

export default async function OnboardingPage() {
  const locale = await getLocale();
  const t = await getTranslations("onboarding");
  const today = new Date().toISOString().slice(0, 10);

  const open = ONBOARDING_CASES.filter((c) => c.status !== "activated");
  const readyToActivate = open.filter((c) => canActivate(c));

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
          label={t("kpi.readyToActivate")}
          value={readyToActivate.length}
          sub={t("kpi.readyToActivateSub")}
          tone="up"
        />
        <KpiCard
          label={t("kpi.joiningThisWeek")}
          value={
            open.filter((c) => {
              const d = daysBetween(today, c.joining_date);
              return d >= 0 && d <= 7;
            }).length
          }
          sub={t("kpi.joiningThisWeekSub")}
        />
        <KpiCard
          label={t("kpi.activatedThisMonth")}
          value={ONBOARDING_CASES.filter((c) => c.status === "activated").length}
          sub={t("kpi.activatedThisMonthSub")}
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
              <th className="px-5 py-3 text-start">{t("columns.stage")}</th>
              <th className="px-5 py-3 text-start max-lg:hidden">
                {t("columns.joining")}
              </th>
              <th className="px-5 py-3 text-start">{t("columns.sla")}</th>
              <th className="px-5 py-3 text-start">{t("columns.status")}</th>
            </tr>
          </thead>
          <tbody>
            {ONBOARDING_CASES.map((c) => {
              const project = PROJECTS.find((p) => p.id === c.project_id);
              const progress = stageProgress(c.id);
              const ready = canActivate(c);
              const hoursLeft = daysBetween(today, c.joining_date) * 24;
              const name =
                locale === "ar" ? c.candidate_name_ar : c.candidate_name_en;
              const jobTitle =
                locale === "ar" ? c.job_title_ar : c.job_title_en;
              return (
                <tr
                  key={c.id}
                  className="border-b border-line transition-colors last:border-b-0 hover:bg-page/60"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/onboarding/${c.id}`}
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
                    {formatDate(c.joining_date, locale)}
                  </td>
                  <td className="px-5 py-3.5">
                    {c.status === "activated" ? (
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
                    {c.status === "activated" ? (
                      <Badge variant="green">{t("statuses.activated")}</Badge>
                    ) : ready ? (
                      <Badge variant="purple">{t("statuses.ready")}</Badge>
                    ) : (
                      <Badge variant="blue">
                        {t("statuses.in_progress")}
                      </Badge>
                    )}
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
