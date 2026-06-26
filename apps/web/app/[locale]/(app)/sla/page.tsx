import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  SLA_METRICS,
  SLA_KPIS,
  type SlaMetric,
  type ApprovalPriority,
} from "@/lib/data/mock/modules";

const PRIORITY_VARIANT: Record<ApprovalPriority, BadgeVariant> = {
  P0: "red",
  P1: "yellow",
  P2: "blue",
};

function onTimeVariant(pct: number): BadgeVariant {
  if (pct >= 95) return "green";
  if (pct >= 90) return "yellow";
  return "red";
}

export default async function SlaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("sla");

  const columns: DataTableColumn<SlaMetric>[] = [
    {
      key: "name",
      header: t("columns.metric"),
      cell: (m) => <b>{locale === "ar" ? m.name_ar : m.name_en}</b>,
    },
    {
      key: "priority",
      header: t("columns.priority"),
      cell: (m) => <Badge variant={PRIORITY_VARIANT[m.priority]}>{m.priority}</Badge>,
    },
    {
      key: "target",
      header: t("columns.target"),
      cell: (m) => (
        <span className="text-[12px] text-muted">
          {locale === "ar" ? m.target_ar : m.target_en}
        </span>
      ),
    },
    {
      key: "open",
      header: t("columns.open"),
      cell: (m) => m.open,
    },
    {
      key: "breached",
      header: t("columns.breached"),
      cell: (m) =>
        m.breached > 0 ? (
          <Badge variant="red">{m.breached}</Badge>
        ) : (
          <span className="text-muted">0</span>
        ),
    },
    {
      key: "on_time",
      header: t("columns.onTime"),
      align: "end",
      cell: (m) => (
        <span className="flex items-center justify-end gap-2">
          <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef1f5]">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${m.on_time_pct}%`,
                background:
                  m.on_time_pct >= 95
                    ? "var(--color-green)"
                    : m.on_time_pct >= 90
                      ? "var(--color-yellow)"
                      : "var(--color-red)",
              }}
            />
          </span>
          <Badge variant={onTimeVariant(m.on_time_pct)}>{m.on_time_pct}%</Badge>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.open")} value={SLA_KPIS.open_total} />
        <KpiCard
          label={t("kpi.breached")}
          value={SLA_KPIS.breached_total}
          sub={t("kpi.breachedSub")}
          tone="down"
        />
        <KpiCard
          label={t("kpi.onTime")}
          value={`${SLA_KPIS.on_time_pct}%`}
          sub={t("kpi.onTimeSub")}
          tone="up"
        />
        <KpiCard label={t("kpi.escalations")} value={SLA_KPIS.escalations_week} />
      </div>

      <Card flush title={t("tableTitle")}>
        <DataTable columns={columns} rows={SLA_METRICS} rowKey={(m) => m.key} />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">{t("note")}</p>
    </>
  );
}
