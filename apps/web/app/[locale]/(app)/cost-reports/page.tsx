import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { COST_REPORTS } from "@/lib/data/mock/cost-reports";
import { PROJECTS } from "@/lib/data/mock/seed";
import { formatNumber } from "@/lib/utils/format";

export default async function CostReportsPage() {
  const locale = await getLocale();
  const t = await getTranslations("costReports");

  const [latest, ...past] = COST_REPORTS;

  const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

  const month = new Date(latest.month + "T12:00:00Z").toLocaleString(
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

      {/* Summary KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          {
            label: t("kpi.payroll"),
            value: `${formatNumber(latest.total_payroll, locale)} ${t("egp")}`,
          },
          {
            label: t("kpi.allowances"),
            value: `${formatNumber(latest.total_allowances, locale)} ${t("egp")}`,
          },
          {
            label: t("kpi.kpi"),
            value: latest.total_kpi > 0
              ? `${formatNumber(latest.total_kpi, locale)} ${t("egp")}`
              : "—",
          },
          {
            label: t("kpi.total"),
            value: `${formatNumber(latest.total_cost, locale)} ${t("egp")}`,
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

      {/* Latest report — project breakdown */}
      <Card
        title={
          <span>
            {t("reportTitle")} — {month}{" "}
            <Badge variant={latest.status === "final" ? "green" : "gray"}>
              {t(`reportStatus.${latest.status}`)}
            </Badge>
          </span>
        }
        flush
        className="mb-4"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("table.project")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("table.employees")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("table.payroll")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("table.allowances")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("table.kpi")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("table.total")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("table.sharePct")}
                </th>
              </tr>
            </thead>
            <tbody>
              {latest.lines.map((line) => {
                const project = projectMap[line.project_id];
                if (!project) return null;
                const projectName =
                  locale === "ar" ? project.name_ar : project.name_en;
                const sharePct =
                  latest.total_cost > 0
                    ? ((line.total_cost / latest.total_cost) * 100).toFixed(1)
                    : "0.0";
                return (
                  <tr
                    key={line.project_id}
                    className="border-b border-line/40 last:border-0"
                  >
                    <td className="px-[18px] py-2.5">
                      <p className="font-medium">{projectName}</p>
                      <p className="text-[11px] text-muted">{project.code}</p>
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {line.employee_count}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {formatNumber(line.payroll_cost, locale)}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {formatNumber(line.allowance_cost, locale)}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums text-muted">
                      {line.kpi_cost > 0
                        ? formatNumber(line.kpi_cost, locale)
                        : "—"}
                    </td>
                    <td className="px-[18px] py-2.5 text-end font-bold tabular-nums text-ink">
                      {formatNumber(line.total_cost, locale)}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums text-muted">
                      {sharePct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-[#fafbfd]">
                <td className="px-[18px] py-2.5 text-[12px] font-bold text-muted">
                  {t("table.total")}
                </td>
                <td className="px-[18px] py-2.5 text-end font-bold tabular-nums">
                  {latest.lines.reduce((s, l) => s + l.employee_count, 0)}
                </td>
                <td className="px-[18px] py-2.5 text-end font-bold tabular-nums">
                  {formatNumber(latest.total_payroll, locale)}
                </td>
                <td className="px-[18px] py-2.5 text-end font-bold tabular-nums">
                  {formatNumber(latest.total_allowances, locale)}
                </td>
                <td className="px-[18px] py-2.5 text-end font-bold tabular-nums text-muted">
                  {latest.total_kpi > 0
                    ? formatNumber(latest.total_kpi, locale)
                    : "—"}
                </td>
                <td className="px-[18px] py-2.5 text-end text-[14px] font-extrabold text-primary tabular-nums">
                  {formatNumber(latest.total_cost, locale)}
                </td>
                <td className="px-[18px] py-2.5 text-end font-bold">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="px-[18px] py-3 text-[11px] text-muted">
          {t("policy12Note")}
        </p>
      </Card>

      {/* Past reports */}
      {past.length > 0 && (
        <Card title={t("pastReports")}>
          <ul className="space-y-2">
            {past.map((report) => {
              const m = new Date(report.month + "T12:00:00Z").toLocaleString(
                locale === "ar" ? "ar-EG" : "en-US",
                { month: "long", year: "numeric" }
              );
              return (
                <li
                  key={report.id}
                  className="flex items-center justify-between border-b border-line/60 pb-2 last:border-0"
                >
                  <div>
                    <p className="text-[13px] font-semibold">{m}</p>
                    <p className="text-[11px] text-muted">
                      {t("table.total")}:{" "}
                      {formatNumber(report.total_cost, locale)} {t("egp")} ·{" "}
                      {report.lines.length} {t("projects")}
                    </p>
                  </div>
                  <Badge
                    variant={report.status === "final" ? "green" : "gray"}
                  >
                    {t(`reportStatus.${report.status}`)}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
