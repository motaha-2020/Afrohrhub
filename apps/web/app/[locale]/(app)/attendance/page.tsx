import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  ATTENDANCE_TODAY,
  ATTENDANCE_KPIS,
  type AttendanceRow,
  type AttendanceState,
} from "@/lib/data/mock/modules";
import { avatarColor, formatLongDate, initials } from "@/lib/utils/format";
import { TODAY } from "@/lib/data/mock/modules";

const STATE_VARIANT: Record<AttendanceState, BadgeVariant> = {
  present: "green",
  late: "yellow",
  absent: "red",
  leave: "blue",
  remote: "purple",
};

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("attendance");
  const ar = locale === "ar";

  const columns: DataTableColumn<AttendanceRow>[] = [
    {
      key: "name",
      header: t("columns.employee"),
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          <span
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: avatarColor(r.employee_id) }}
          >
            {initials(ar ? r.name_ar : r.name_en)}
          </span>
          <span>
            <b className="block">{ar ? r.name_ar : r.name_en}</b>
            <small className="block text-[11px] text-muted">
              {ar ? r.project_ar : r.project_en}
            </small>
          </span>
        </span>
      ),
    },
    {
      key: "check_in",
      header: t("columns.checkIn"),
      cell: (r) => r.check_in ?? "—",
    },
    {
      key: "check_out",
      header: t("columns.checkOut"),
      cell: (r) => r.check_out ?? "—",
    },
    {
      key: "hours",
      header: t("columns.hours"),
      cell: (r) => (r.hours ? r.hours : "—"),
    },
    {
      key: "gps",
      header: t("columns.gps"),
      cell: (r) =>
        r.state === "leave" ? (
          <span className="text-muted">—</span>
        ) : (
          <Badge variant={r.gps_ok ? "green" : "yellow"}>
            {r.gps_ok ? t("gpsOk") : t("gpsFlag")}
          </Badge>
        ),
    },
    {
      key: "state",
      header: t("columns.state"),
      cell: (r) => <Badge variant={STATE_VARIANT[r.state]}>{t(`states.${r.state}`)}</Badge>,
    },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">
          {t("subtitle", { date: formatLongDate(TODAY, locale) })}
        </p>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard
          label={t("kpi.present")}
          value={ATTENDANCE_KPIS.present.toLocaleString(locale === "ar" ? "ar-EG-u-nu-latn" : "en")}
          sub={t("kpi.presentSub", { pct: ATTENDANCE_KPIS.present_pct })}
          tone="up"
        />
        <KpiCard label={t("kpi.late")} value={ATTENDANCE_KPIS.late} />
        <KpiCard
          label={t("kpi.absent")}
          value={ATTENDANCE_KPIS.absent}
          sub={t("kpi.absentSub")}
          tone="down"
        />
        <KpiCard label={t("kpi.onLeave")} value={ATTENDANCE_KPIS.on_leave} />
      </div>

      <Card flush title={t("tableTitle")}>
        <DataTable columns={columns} rows={ATTENDANCE_TODAY} rowKey={(r) => r.id} />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">{t("note")}</p>
    </>
  );
}
