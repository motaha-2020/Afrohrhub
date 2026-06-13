"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type {
  AttendanceMethod,
  AttendanceMonthSummary,
  AttendanceRecord,
  AttendanceStatus,
  Employee,
  ExceptionStatus,
  Project,
  WorkLocation,
} from "@/lib/data/types";

const STATUS_VARIANT: Record<AttendanceStatus, BadgeVariant> = {
  present: "green",
  absent: "red",
  leave: "blue",
  assignment: "purple",
  weekend: "gray",
  holiday: "gray",
};

const METHOD_ICON: Record<AttendanceMethod, string> = {
  gps: "📍",
  site_supervisor: "👷",
  manual: "✍️",
};

interface EnrichedRecord {
  record: AttendanceRecord;
  emp: Employee;
  project: Project | null;
  location: WorkLocation | null;
}

interface EnrichedSummary {
  row: AttendanceMonthSummary;
  emp: Employee;
}

export function AttendanceClient({
  enrichedRecords,
  enrichedSummary,
  month,
  today,
  locale,
}: {
  enrichedRecords: EnrichedRecord[];
  enrichedSummary: EnrichedSummary[];
  month: string;
  today: string;
  locale: string;
}) {
  const t = useTranslations("attendance");

  // Exception decisions held in local state (mock — no persistence).
  const [decisions, setDecisions] = useState<Record<string, ExceptionStatus>>(
    {}
  );
  const [banner, setBanner] = useState<string | null>(null);

  function decide(recordId: string, decision: "approved" | "rejected", name: string) {
    setDecisions((prev) => ({ ...prev, [recordId]: decision }));
    setBanner(
      decision === "approved"
        ? t("exceptionApproved", { name })
        : t("exceptionRejected", { name })
    );
  }

  function effectiveException(rec: AttendanceRecord): ExceptionStatus {
    return decisions[rec.id] ?? rec.exception_status;
  }

  const counts = useMemo(() => {
    const c = { present: 0, leave: 0, absent: 0, assignment: 0, pending: 0 };
    for (const { record } of enrichedRecords) {
      if (record.status === "present") c.present += 1;
      else if (record.status === "leave") c.leave += 1;
      else if (record.status === "absent") c.absent += 1;
      else if (record.status === "assignment") c.assignment += 1;
      if (effectiveException(record) === "pending") c.pending += 1;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrichedRecords, decisions]);

  const monthLabel = new Date(month + "T12:00:00Z").toLocaleString(
    locale === "ar" ? "ar-EG" : "en-US",
    { month: "long", year: "numeric" }
  );

  const totalOvertime = enrichedSummary.reduce(
    (s, e) => s + e.row.overtime_amount,
    0
  );
  const totalDeduction = enrichedSummary.reduce(
    (s, e) => s + e.row.deduction_amount,
    0
  );

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <span className="rounded-lg bg-[#eef1f5] px-3 py-1.5 text-[12px] font-semibold text-muted">
          {t("today")}: {formatDate(today, locale)}
        </span>
      </div>

      {banner && (
        <div className="mb-4 rounded-xl bg-green-soft px-4 py-3 text-[13px] font-semibold text-green">
          ✓ {banner}
        </div>
      )}

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {([
          { label: t("kpi.present"), value: String(counts.present) },
          { label: t("kpi.onLeave"), value: String(counts.leave) },
          { label: t("kpi.absent"), value: String(counts.absent) },
          { label: t("kpi.onAssignment"), value: String(counts.assignment) },
          { label: t("kpi.pendingExceptions"), value: String(counts.pending) },
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

      {/* Daily attendance sheet */}
      <Card title={t("dailySheet.title")} flush className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("dailySheet.employee")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("dailySheet.project")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("dailySheet.status")}
                </th>
                <th className="px-[18px] py-2.5 text-center font-semibold">
                  {t("dailySheet.checkInOut")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("dailySheet.method")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("dailySheet.late")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("dailySheet.overtime")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("dailySheet.exception")}
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedRecords.map(({ record, emp, project, location }) => {
                const empName = locale === "ar" ? emp.name_ar : emp.name_en;
                const projectName = project
                  ? locale === "ar"
                    ? project.name_ar
                    : project.name_en
                  : "—";
                const locationName = location
                  ? locale === "ar"
                    ? location.name_ar
                    : location.name_en
                  : t("dailySheet.unverified");
                const reason =
                  locale === "ar"
                    ? record.exception_reason_ar
                    : record.exception_reason_en;
                const exc = effectiveException(record);
                return (
                  <tr
                    key={record.id}
                    className="border-b border-line/40 align-top last:border-0"
                  >
                    <td className="px-[18px] py-2.5 font-medium">{empName}</td>
                    <td className="px-[18px] py-2.5 text-muted">
                      {projectName}
                    </td>
                    <td className="px-[18px] py-2.5">
                      <Badge variant={STATUS_VARIANT[record.status]}>
                        {t(`statuses.${record.status}`)}
                      </Badge>
                    </td>
                    <td className="px-[18px] py-2.5 text-center tabular-nums">
                      {record.check_in ? (
                        <span>
                          {record.check_in}
                          {" – "}
                          {record.check_out ?? "…"}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-[18px] py-2.5 text-muted">
                      <span title={locationName}>
                        {METHOD_ICON[record.method]}{" "}
                        {t(`methods.${record.method}`)}
                      </span>
                      <span className="block text-[10.5px]">{locationName}</span>
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {record.late_minutes > 0 ? (
                        <span className="text-yellow font-semibold">
                          {record.late_minutes} {t("min")}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {record.overtime_minutes > 0 ? (
                        <span className="text-primary font-semibold">
                          {record.overtime_minutes} {t("min")}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-[18px] py-2.5 text-end">
                      {exc === "pending" ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[11px] text-muted">
                            {reason}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                decide(record.id, "approved", empName)
                              }
                              className="rounded-md bg-green px-2 py-1 text-[11px] font-bold text-white hover:opacity-90"
                            >
                              {t("approve")}
                            </button>
                            <button
                              onClick={() =>
                                decide(record.id, "rejected", empName)
                              }
                              className="rounded-md bg-red px-2 py-1 text-[11px] font-bold text-white hover:opacity-90"
                            >
                              {t("reject")}
                            </button>
                          </div>
                        </div>
                      ) : exc === "approved" ? (
                        <Badge variant="green">{t("statusApproved")}</Badge>
                      ) : exc === "rejected" ? (
                        <Badge variant="red">{t("statusRejected")}</Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-[18px] py-3 text-[11px] text-muted">
          {t("dailyNote")}
        </p>
      </Card>

      {/* Monthly summary → Payroll feed */}
      <Card title={`${t("monthSummary.title")} — ${monthLabel}`} flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("monthSummary.employee")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("monthSummary.worked")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("monthSummary.absent")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("monthSummary.leave")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("monthSummary.assignment")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("monthSummary.overtimeAmount")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("monthSummary.deduction")}
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedSummary.map(({ row, emp }) => {
                const empName = locale === "ar" ? emp.name_ar : emp.name_en;
                return (
                  <tr
                    key={row.employee_id}
                    className="border-b border-line/40 last:border-0"
                  >
                    <td className="px-[18px] py-2.5 font-medium">{empName}</td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {row.worked_days}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {row.absent_days > 0 ? (
                        <span className="text-red font-semibold">
                          {row.absent_days}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {row.leave_days}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {row.assignment_days}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {row.overtime_amount > 0 ? (
                        <span className="text-green font-semibold">
                          +{formatNumber(row.overtime_amount, locale)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums">
                      {row.deduction_amount < 0 ? (
                        <span className="text-red font-semibold">
                          {formatNumber(row.deduction_amount, locale)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-[#fafbfd]">
                <td
                  colSpan={5}
                  className="px-[18px] py-2.5 text-[12px] font-bold text-muted"
                >
                  {t("monthSummary.payrollFeed")}
                </td>
                <td className="px-[18px] py-2.5 text-end text-[13px] font-extrabold text-green tabular-nums">
                  +{formatNumber(totalOvertime, locale)} {t("egp")}
                </td>
                <td className="px-[18px] py-2.5 text-end text-[13px] font-extrabold text-red tabular-nums">
                  {formatNumber(totalDeduction, locale)} {t("egp")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="px-[18px] py-3 text-[11px] text-muted">
          {t("monthNote")}
        </p>
      </Card>
    </>
  );
}
