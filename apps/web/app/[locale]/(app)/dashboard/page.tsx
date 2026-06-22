import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { getServerSession } from "@/lib/auth/session.server";
import { projectRepository } from "@/lib/data";
import {
  DASHBOARD_KPIS,
  HEADCOUNT_BY_PROJECT,
} from "@/lib/data/mock/dashboard";
import { DEMO_TODAY } from "@/lib/data/mock/seed";
import {
  formatLongDate,
  formatNumber,
  localizedName,
} from "@/lib/utils/format";

const BAR_COLORS = [
  "var(--color-primary)",
  "var(--color-purple)",
  "var(--color-green)",
  "var(--color-yellow)",
  "#94a3b8",
];

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const { session } = await getServerSession();
  const projects = await projectRepository.list();
  const firstName = localizedName(session.user, locale).split(/\s+/)[0];

  const approvalItems = [
    { text: t("approvals.item1"), time: t("approvals.item1Time") },
    { text: t("approvals.item2"), time: t("approvals.item2Time") },
    { text: t("approvals.item3"), time: t("approvals.item3Time") },
    { text: t("approvals.item4"), time: t("approvals.item4Time") },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="text-[12.5px] text-muted">
            {t("subtitle", {
              date: formatLongDate(DEMO_TODAY, locale),
              tenant: localizedName(session.tenant, locale),
            })}
          </p>
        </div>
        <Button>{t("newHiringRequest")}</Button>
      </div>

      <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("kpi.activeEmployees")}
          value={formatNumber(DASHBOARD_KPIS.active_employees, locale)}
          sub={t("kpi.activeEmployeesSub", {
            count: DASHBOARD_KPIS.active_delta_month,
          })}
          tone="up"
        />
        <KpiCard
          label={t("kpi.openRequests")}
          value={DASHBOARD_KPIS.open_hiring_requests}
          sub={
            <Badge variant="red">
              {t("kpi.openRequestsSub", { count: DASHBOARD_KPIS.open_p0 })}
            </Badge>
          }
        />
        <KpiCard
          label={t("kpi.onboarding")}
          value={DASHBOARD_KPIS.onboarding_in_progress}
          sub={t("kpi.onboardingSub", {
            count: DASHBOARD_KPIS.ready_for_activation,
          })}
          tone="up"
        />
        <KpiCard
          label={t("kpi.payrollCycle")}
          value={DASHBOARD_KPIS.payroll_window}
          sub={<Badge variant="yellow">{t("kpi.payrollCycleSub")}</Badge>}
        />
      </div>

      <div className="grid gap-4 max-lg:grid-cols-1 lg:grid-cols-2">
        <Card
          title={t("approvals.title")}
          action={
            <Link
              href="/approvals"
              className="text-[11.5px] font-semibold text-primary"
            >
              {t("approvals.viewAll")}
            </Link>
          }
        >
          <ul>
            {approvalItems.map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-2.5 border-b border-dashed border-line px-1 py-[9px] text-[13px] last:border-b-0"
              >
                <span className="flex size-[21px] shrink-0 items-center justify-center rounded-full bg-yellow text-[11px] font-extrabold text-white">
                  !
                </span>
                {item.text}
                <span className="ms-auto text-end text-[11px] text-muted">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("headcount.title")}>
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {HEADCOUNT_BY_PROJECT.map((row, i) => {
                const project = projects.find((p) => p.code === row.code);
                if (!project) return null;
                return (
                  <tr
                    key={row.code}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-2.5 py-2.5 align-middle">
                      {localizedName(project, locale)}{" "}
                      <small className="text-muted">({project.code})</small>
                    </td>
                    <td className="w-[38%] px-2.5 py-2.5 align-middle">
                      <div className="h-[7px] overflow-hidden rounded-full bg-[#edf0f5]">
                        <i
                          className="block h-full rounded-full"
                          style={{
                            width: `${row.pct}%`,
                            background: BAR_COLORS[i % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-2.5 py-2.5 align-middle font-bold">
                      {formatNumber(row.headcount, locale)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
