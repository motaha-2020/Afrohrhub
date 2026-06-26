import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import { Stepper, type Step } from "@/components/ui/Stepper";
import {
  CURRENT_PAYROLL,
  PAYROLL_STAGES,
  PAYROLL_BY_PROJECT,
  type PayrollProjectCost,
} from "@/lib/data/mock/modules";
import { formatNumber } from "@/lib/utils/format";

export default async function PayrollPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("payroll");
  const ar = locale === "ar";
  const c = CURRENT_PAYROLL;

  const steps: Step[] = PAYROLL_STAGES.map((s, i) => ({
    label: ar ? s.name_ar : s.name_en,
    state: i < c.current_stage ? "done" : i === c.current_stage ? "current" : "upcoming",
  }));

  const millions = (v: number) =>
    `${formatNumber(Math.round(v / 100000) / 10, locale)} ${t("million")}`;

  const columns: DataTableColumn<PayrollProjectCost>[] = [
    {
      key: "project",
      header: t("columns.project"),
      cell: (p) => <b>{ar ? p.project_ar : p.project_en}</b>,
    },
    {
      key: "headcount",
      header: t("columns.headcount"),
      cell: (p) => formatNumber(p.headcount, locale),
    },
    {
      key: "cost",
      header: t("columns.cost"),
      cell: (p) => `${formatNumber(p.cost_egp, locale)} ${t("egp")}`,
    },
    {
      key: "share",
      header: t("columns.share"),
      align: "end",
      cell: (p) => (
        <span className="flex items-center justify-end gap-2">
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-[#eef1f5]">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${p.pct}%` }}
            />
          </span>
          <span className="w-9 text-end text-[12px] font-bold">{p.pct}%</span>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">
            {t("subtitle", { period: ar ? c.period_ar : c.period_en })}
          </p>
        </div>
        <span className="flex items-center gap-2">
          <Badge variant="yellow">
            {t("window", { window: ar ? c.window_ar : c.window_en })}
          </Badge>
          <Button>{t("approveStage")}</Button>
        </span>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.headcount")} value={formatNumber(c.headcount, locale)} />
        <KpiCard label={t("kpi.gross")} value={millions(c.gross_egp)} />
        <KpiCard
          label={t("kpi.deductions")}
          value={millions(c.deductions_egp)}
          sub={t("kpi.deductionsSub", {
            tax: millions(c.tax_egp),
            ins: millions(c.insurance_egp),
          })}
        />
        <KpiCard
          label={t("kpi.net")}
          value={millions(c.net_egp)}
          sub={t("kpi.netSub")}
          tone="up"
        />
      </div>

      <Card title={t("cycleTitle")} className="mb-[18px]">
        <Stepper steps={steps} />
        <p className="text-[12px] text-muted">
          {t("currentStage", {
            label: ar
              ? PAYROLL_STAGES[c.current_stage].name_ar
              : PAYROLL_STAGES[c.current_stage].name_en,
          })}
        </p>
      </Card>

      <Card flush title={t("byProjectTitle")}>
        <DataTable
          columns={columns}
          rows={PAYROLL_BY_PROJECT}
          rowKey={(p) => p.project_en}
        />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">{t("note")}</p>
    </>
  );
}
