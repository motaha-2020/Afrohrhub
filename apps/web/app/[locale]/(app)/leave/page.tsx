import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  LEAVE_BALANCES,
  LEAVE_REQUESTS,
  LEAVE_KPIS,
  type LeaveRequest,
  type LeaveState,
} from "@/lib/data/mock/modules";
import { formatDate } from "@/lib/utils/format";

const STATE_VARIANT: Record<LeaveState, BadgeVariant> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};

export default async function LeavePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("leave");
  const ar = locale === "ar";

  const columns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "name",
      header: t("columns.employee"),
      cell: (r) => <b>{ar ? r.name_ar : r.name_en}</b>,
    },
    {
      key: "type",
      header: t("columns.type"),
      cell: (r) => ar ? r.type_ar : r.type_en,
    },
    {
      key: "dates",
      header: t("columns.dates"),
      cell: (r) =>
        `${formatDate(r.from_date, locale)} → ${formatDate(r.to_date, locale)}`,
    },
    {
      key: "days",
      header: t("columns.days"),
      cell: (r) => r.days,
    },
    {
      key: "approver",
      header: t("columns.approver"),
      cell: (r) => (
        <span className="text-[12px] text-muted">
          {ar ? r.approver_ar : r.approver_en}
        </span>
      ),
    },
    {
      key: "state",
      header: t("columns.state"),
      cell: (r) => <Badge variant={STATE_VARIANT[r.state]}>{t(`states.${r.state}`)}</Badge>,
    },
    {
      key: "actions",
      header: t("columns.actions"),
      align: "end",
      cell: (r) =>
        r.state === "pending" ? (
          <span className="flex justify-end gap-1.5">
            <Button size="sm">{t("approve")}</Button>
            <Button size="sm" variant="danger">
              {t("reject")}
            </Button>
          </span>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Button>{t("newRequest")}</Button>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.pending")} value={LEAVE_KPIS.pending} />
        <KpiCard label={t("kpi.approvedMonth")} value={LEAVE_KPIS.approved_month} />
        <KpiCard label={t("kpi.onLeaveToday")} value={LEAVE_KPIS.on_leave_today} />
        <KpiCard
          label={t("kpi.avgDecision")}
          value={t("hours", { n: LEAVE_KPIS.avg_decision_hours })}
        />
      </div>

      <Card title={t("balancesTitle")} className="mb-[18px]">
        <div className="grid gap-3.5 md:grid-cols-3">
          {LEAVE_BALANCES.map((b) => (
            <div key={b.key} className="rounded-[10px] border border-line bg-[#fafbfd] p-3.5">
              <div className="flex items-center justify-between">
                <b className="text-[13px]">{ar ? b.name_ar : b.name_en}</b>
                <Badge variant={b.balance > 0 ? "green" : "gray"}>
                  {t("balanceDays", { n: b.balance })}
                </Badge>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef1f5]">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${(b.used / b.entitled) * 100}%` }}
                />
              </div>
              <small className="mt-1 block text-[11px] text-muted">
                {t("usedOf", { used: b.used, total: b.entitled })}
              </small>
            </div>
          ))}
        </div>
      </Card>

      <Card flush title={t("requestsTitle")}>
        <DataTable columns={columns} rows={LEAVE_REQUESTS} rowKey={(r) => r.id} />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">{t("note")}</p>
    </>
  );
}
