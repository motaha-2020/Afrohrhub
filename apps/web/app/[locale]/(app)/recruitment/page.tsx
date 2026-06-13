import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { SlaCountdown } from "@/components/ui/SlaCountdown";
import {
  CANDIDATES,
  HIRING_REQUESTS,
  JOB_OFFERS,
} from "@/lib/data/mock/recruitment";
import { PROJECTS } from "@/lib/data/mock/seed";
import type { HiringRequestStatus } from "@/lib/data/types";
import { formatDate, formatNumber, localizedName } from "@/lib/utils/format";
import { RecruitmentTabs } from "./RecruitmentTabs";

const STATUS_VARIANT: Record<HiringRequestStatus, BadgeVariant> = {
  pending_approval: "yellow",
  approved: "blue",
  in_progress: "blue",
  filled: "green",
  cancelled: "gray",
};

export default async function RecruitmentPage() {
  const locale = await getLocale();
  const t = await getTranslations("recruitment");

  const open = HIRING_REQUESTS.filter(
    (r) => r.status === "in_progress" || r.status === "approved"
  );
  const pendingApproval = HIRING_REQUESTS.filter(
    (r) => r.status === "pending_approval"
  );
  const inPipeline = CANDIDATES.filter(
    (c) => c.status === "active" && c.stage !== "hiring_request"
  );
  const openOffers = JOB_OFFERS.filter(
    (o) => o.status === "sent" || o.status === "draft"
  );

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Link
          href="/recruitment/new"
          className="rounded-[9px] bg-primary px-[18px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-primary-dark"
        >
          {t("newRequest")}
        </Link>
      </div>

      <RecruitmentTabs active="requests" />

      <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiCard
          label={t("kpi.openRequests")}
          value={formatNumber(open.length, locale)}
          sub={t("kpi.openRequestsSub", {
            count: open.filter((r) => r.priority === "P0").length,
          })}
          tone="down"
        />
        <KpiCard
          label={t("kpi.pendingApproval")}
          value={formatNumber(pendingApproval.length, locale)}
          sub={t("kpi.pendingApprovalSub")}
        />
        <KpiCard
          label={t("kpi.inPipeline")}
          value={formatNumber(inPipeline.length, locale)}
          sub={t("kpi.inPipelineSub", {
            count: inPipeline.filter((c) => c.stage === "final_selection")
              .length,
          })}
          tone="up"
        />
        <KpiCard
          label={t("kpi.openOffers")}
          value={formatNumber(openOffers.length, locale)}
          sub={t("kpi.openOffersSub", {
            count: openOffers.filter((o) => o.status === "sent").length,
          })}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-page text-start text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3 text-start">{t("columns.request")}</th>
              <th className="px-5 py-3 text-start">{t("columns.project")}</th>
              <th className="px-5 py-3 text-start max-lg:hidden">
                {t("columns.requestedBy")}
              </th>
              <th className="px-5 py-3 text-start">{t("columns.openings")}</th>
              <th className="px-5 py-3 text-start max-lg:hidden">
                {t("columns.salaryRange")}
              </th>
              <th className="px-5 py-3 text-start">{t("columns.priority")}</th>
              <th className="px-5 py-3 text-start">{t("columns.status")}</th>
            </tr>
          </thead>
          <tbody>
            {HIRING_REQUESTS.map((req) => {
              const project = PROJECTS.find((p) => p.id === req.project_id);
              const candidates = CANDIDATES.filter(
                (c) =>
                  c.hiring_request_id === req.id && c.status === "active"
              );
              const hoursLeft = Math.min(
                ...candidates.map((c) => c.sla_hours_remaining),
                Infinity
              );
              return (
                <tr
                  key={req.id}
                  className="border-b border-line transition-colors last:border-b-0 hover:bg-page/60"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold leading-snug">
                      {locale === "ar" ? req.job_title_ar : req.job_title_en}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-muted">
                      {req.request_code} ·{" "}
                      {t(`requestTypes.${req.request_type}`)}
                      {req.request_type === "replacement" &&
                        req.replaced_hr_code &&
                        ` (${req.replaced_hr_code})`}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    {project ? (
                      <>
                        <p className="font-medium">
                          {localizedName(project, locale)}
                        </p>
                        <p className="text-[11.5px] text-muted">
                          {project.code}
                        </p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted max-lg:hidden">
                    <p>
                      {locale === "ar"
                        ? req.requested_by_name_ar
                        : req.requested_by_name_en}
                    </p>
                    <p className="text-[11.5px]">
                      {formatDate(req.requested_at, locale)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold">
                    {formatNumber(req.filled, locale)}/
                    {formatNumber(req.openings, locale)}
                  </td>
                  <td className="px-5 py-3.5 text-muted max-lg:hidden">
                    {formatNumber(req.salary_min, locale)}–
                    {formatNumber(req.salary_max, locale)}{" "}
                    {t("egp")}
                  </td>
                  <td className="px-5 py-3.5">
                    {req.status === "in_progress" &&
                    Number.isFinite(hoursLeft) ? (
                      <SlaCountdown
                        hours={hoursLeft}
                        priority={req.priority}
                        locale={locale}
                      />
                    ) : (
                      <Badge variant={req.priority === "P0" ? "red" : "blue"}>
                        {req.priority}
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_VARIANT[req.status]}>
                      {t(`statuses.${req.status}`)}
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
