import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  AUDIT_LOG,
  AUDIT_KPIS,
  type AuditEntry,
  type AuditAction,
} from "@/lib/data/mock/ess-settings-audit";
import { formatDate } from "@/lib/utils/format";

const ACTION_VARIANT: Record<AuditAction, BadgeVariant> = {
  create: "green",
  update: "blue",
  delete: "red",
  login: "gray",
  approve: "green",
  reject: "red",
  export: "purple",
};

export default async function AuditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("audit");
  const ar = locale === "ar";

  const columns: DataTableColumn<AuditEntry>[] = [
    {
      key: "timestamp",
      header: t("columns.timestamp"),
      cell: (e) => (
        <span className="whitespace-nowrap text-[12px]">
          {formatDate(e.timestamp, locale)}{" "}
          <small className="text-muted">
            {new Date(e.timestamp).toLocaleTimeString(
              ar ? "ar-EG-u-nu-latn" : "en-GB",
              { hour: "2-digit", minute: "2-digit" }
            )}
          </small>
        </span>
      ),
    },
    {
      key: "user",
      header: t("columns.user"),
      cell: (e) => (
        <span>
          <b className="block">{ar ? e.user_ar : e.user_en}</b>
          <small className="block text-[11px] text-muted">
            {ar ? e.role_ar : e.role_en}
          </small>
        </span>
      ),
    },
    {
      key: "action",
      header: t("columns.action"),
      cell: (e) => (
        <Badge variant={ACTION_VARIANT[e.action]}>
          {t(`actions.${e.action}`)}
        </Badge>
      ),
    },
    {
      key: "resource",
      header: t("columns.resource"),
      cell: (e) => (
        <span>
          <b className="block text-[12.5px]">
            {ar ? e.resource_ar : e.resource_en}
          </b>
          <small className="block text-[11px] text-muted">
            {ar ? e.detail_ar : e.detail_en}
          </small>
        </span>
      ),
    },
    {
      key: "ip",
      header: t("columns.ip"),
      cell: (e) => <span className="text-[12px] text-muted">{e.ip}</span>,
    },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.entriesToday")} value={AUDIT_KPIS.entries_today} />
        <KpiCard label={t("kpi.uniqueUsers")} value={AUDIT_KPIS.unique_users} />
        <KpiCard label={t("kpi.sensitive")} value={AUDIT_KPIS.sensitive_actions} />
        <KpiCard label={t("kpi.exports")} value={AUDIT_KPIS.exports} />
      </div>

      <Card flush title={t("logTitle")}>
        <DataTable columns={columns} rows={AUDIT_LOG} rowKey={(e) => e.id} />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">{t("note")}</p>
    </>
  );
}
