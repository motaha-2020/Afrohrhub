import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  APPROVALS,
  APPROVAL_KPIS,
  type ApprovalRequest,
  type ApprovalPriority,
  type ApprovalState,
  type SlaTone,
} from "@/lib/data/mock/modules";

const PRIORITY_VARIANT: Record<ApprovalPriority, BadgeVariant> = {
  P0: "red",
  P1: "yellow",
  P2: "blue",
};

const STATE_VARIANT: Record<ApprovalState, BadgeVariant> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  escalated: "red",
};

const SLA_VARIANT: Record<SlaTone, BadgeVariant> = {
  ok: "green",
  warn: "yellow",
  breach: "red",
};

function loc(row: { ar: string; en: string }, locale: string) {
  return locale === "ar" ? row.ar : row.en;
}

export default async function ApprovalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("approvals");

  const slaText = (row: ApprovalRequest) => {
    if (row.state === "approved") return t("done");
    if (row.sla_hours_left < 0)
      return t("breachedBy", { hours: Math.abs(row.sla_hours_left) });
    return t("hoursLeft", { hours: row.sla_hours_left });
  };

  const columns: DataTableColumn<ApprovalRequest>[] = [
    {
      key: "ref",
      header: t("columns.ref"),
      cell: (r) => <b className="text-primary">{r.ref}</b>,
    },
    {
      key: "type",
      header: t("columns.type"),
      cell: (r) => (
        <span>
          <b className="block">{loc({ ar: r.type_ar, en: r.type_en }, locale)}</b>
          <small className="block text-[11px] text-muted">
            {loc({ ar: r.subject_ar, en: r.subject_en }, locale)}
          </small>
        </span>
      ),
    },
    {
      key: "requested_by",
      header: t("columns.requestedBy"),
      cell: (r) => loc({ ar: r.requested_by_ar, en: r.requested_by_en }, locale),
    },
    {
      key: "step",
      header: t("columns.step"),
      cell: (r) => (
        <span className="text-[12px]">
          {loc({ ar: r.current_step_ar, en: r.current_step_en }, locale)}
        </span>
      ),
    },
    {
      key: "priority",
      header: t("columns.priority"),
      cell: (r) => <Badge variant={PRIORITY_VARIANT[r.priority]}>{r.priority}</Badge>,
    },
    {
      key: "sla",
      header: t("columns.sla"),
      cell: (r) => <Badge variant={SLA_VARIANT[r.sla_tone]}>{slaText(r)}</Badge>,
    },
    {
      key: "state",
      header: t("columns.state"),
      cell: (r) => (
        <Badge variant={STATE_VARIANT[r.state]}>{t(`states.${r.state}`)}</Badge>
      ),
    },
    {
      key: "actions",
      header: t("columns.actions"),
      align: "end",
      cell: (r) =>
        r.state === "pending" || r.state === "escalated" ? (
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
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.awaitingMe")} value={APPROVAL_KPIS.awaiting_me} />
        <KpiCard
          label={t("kpi.breached")}
          value={APPROVAL_KPIS.breached}
          sub={t("kpi.breachedSub")}
          tone="down"
        />
        <KpiCard label={t("kpi.dueToday")} value={APPROVAL_KPIS.due_today} />
        <KpiCard
          label={t("kpi.approvedWeek")}
          value={APPROVAL_KPIS.approved_this_week}
          sub={t("kpi.approvedSub")}
          tone="up"
        />
      </div>

      <Card flush title={t("queueTitle")}>
        <DataTable
          columns={columns}
          rows={APPROVALS}
          rowKey={(r) => r.id}
          empty={<EmptyState icon="✅" title={t("empty")} />}
        />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">{t("engineNote")}</p>
    </>
  );
}
