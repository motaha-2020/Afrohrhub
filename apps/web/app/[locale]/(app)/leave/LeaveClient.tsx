"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/format";
import type {
  Employee,
  LeaveBalance,
  LeavePayRule,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "@/lib/data/types";

const REQUEST_STATUS_VARIANT: Record<LeaveRequestStatus, BadgeVariant> = {
  pending: "yellow",
  manager_approved: "blue",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
};

const PAY_RULE_VARIANT: Record<LeavePayRule, BadgeVariant> = {
  paid: "green",
  partial: "yellow",
  unpaid: "gray",
};

interface EnrichedRequest {
  request: LeaveRequest;
  emp: Employee;
}

interface BalanceGroup {
  emp: Employee;
  balances: LeaveBalance[];
}

type Decision = "approved" | "rejected";

export function LeaveClient({
  types,
  enrichedRequests,
  balanceEmployees,
  locale,
}: {
  types: LeaveType[];
  enrichedRequests: EnrichedRequest[];
  balanceEmployees: BalanceGroup[];
  locale: string;
}) {
  const t = useTranslations("leave");

  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [banner, setBanner] = useState<string | null>(null);

  function decide(requestId: string, decision: Decision, name: string) {
    setDecisions((prev) => ({ ...prev, [requestId]: decision }));
    setBanner(
      decision === "approved"
        ? t("requestApproved", { name })
        : t("requestRejected", { name })
    );
  }

  function effectiveStatus(req: LeaveRequest): LeaveRequestStatus {
    return decisions[req.id] ?? req.status;
  }

  const typeName = (code: string) => {
    const lt = types.find((x) => x.code === code);
    if (!lt) return code;
    return locale === "ar" ? lt.name_ar : lt.name_en;
  };

  const pendingCount = useMemo(
    () =>
      enrichedRequests.filter((e) => {
        const s = effectiveStatus(e.request);
        return s === "pending" || s === "manager_approved";
      }).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enrichedRequests, decisions]
  );

  const onLeaveDays = enrichedRequests
    .filter((e) => effectiveStatus(e.request) === "approved")
    .reduce((s, e) => s + e.request.days, 0);

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
      </div>

      {banner && (
        <div className="mb-4 rounded-xl bg-green-soft px-4 py-3 text-[13px] font-semibold text-green">
          ✓ {banner}
        </div>
      )}

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          { label: t("kpi.pending"), value: String(pendingCount) },
          {
            label: t("kpi.approvedDays"),
            value: String(onLeaveDays),
          },
          { label: t("kpi.types"), value: String(types.length) },
          {
            label: t("kpi.tracked"),
            value: String(balanceEmployees.length),
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

      {/* Requests + approval flow */}
      <Card title={t("requests.title")} flush className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("requests.employee")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("requests.type")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("requests.period")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("requests.days")}
                </th>
                <th className="px-[18px] py-2.5 text-start font-semibold">
                  {t("requests.reason")}
                </th>
                <th className="px-[18px] py-2.5 text-end font-semibold">
                  {t("requests.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedRequests.map(({ request, emp }) => {
                const empName = locale === "ar" ? emp.name_ar : emp.name_en;
                const reason =
                  locale === "ar" ? request.reason_ar : request.reason_en;
                const status = effectiveStatus(request);
                const actionable =
                  status === "pending" || status === "manager_approved";
                return (
                  <tr
                    key={request.id}
                    className="border-b border-line/40 align-top last:border-0"
                  >
                    <td className="px-[18px] py-2.5 font-medium">{empName}</td>
                    <td className="px-[18px] py-2.5 text-muted">
                      {typeName(request.type_code)}
                    </td>
                    <td className="px-[18px] py-2.5 tabular-nums text-muted">
                      {formatDate(request.start_date, locale)}
                      {request.start_date !== request.end_date && (
                        <> – {formatDate(request.end_date, locale)}</>
                      )}
                    </td>
                    <td className="px-[18px] py-2.5 text-end tabular-nums font-semibold">
                      {request.days}
                    </td>
                    <td className="px-[18px] py-2.5 text-muted">{reason}</td>
                    <td className="px-[18px] py-2.5 text-end">
                      {actionable ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge variant={REQUEST_STATUS_VARIANT[status]}>
                            {t(`requestStatus.${status}`)}
                          </Badge>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() =>
                                decide(request.id, "approved", empName)
                              }
                              className="rounded-md bg-green px-2 py-1 text-[11px] font-bold text-white hover:opacity-90"
                            >
                              {t("approve")}
                            </button>
                            <button
                              onClick={() =>
                                decide(request.id, "rejected", empName)
                              }
                              className="rounded-md bg-red px-2 py-1 text-[11px] font-bold text-white hover:opacity-90"
                            >
                              {t("reject")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Badge variant={REQUEST_STATUS_VARIANT[status]}>
                          {t(`requestStatus.${status}`)}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-[18px] py-3 text-[11px] text-muted">
          {t("requestsNote")}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Balances */}
        <Card title={t("balances.title")} flush>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="px-[18px] py-2.5 text-start font-semibold">
                    {t("balances.employee")}
                  </th>
                  <th className="px-[18px] py-2.5 text-start font-semibold">
                    {t("balances.type")}
                  </th>
                  <th className="px-[18px] py-2.5 text-end font-semibold">
                    {t("balances.entitled")}
                  </th>
                  <th className="px-[18px] py-2.5 text-end font-semibold">
                    {t("balances.used")}
                  </th>
                  <th className="px-[18px] py-2.5 text-end font-semibold">
                    {t("balances.pending")}
                  </th>
                  <th className="px-[18px] py-2.5 text-end font-semibold">
                    {t("balances.remaining")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {balanceEmployees.map(({ emp, balances }) =>
                  balances.map((b, idx) => {
                    const empName =
                      locale === "ar" ? emp.name_ar : emp.name_en;
                    return (
                      <tr
                        key={`${emp.id}-${b.type_code}`}
                        className="border-b border-line/40 last:border-0"
                      >
                        <td className="px-[18px] py-2.5 font-medium">
                          {idx === 0 ? empName : ""}
                        </td>
                        <td className="px-[18px] py-2.5 text-muted">
                          {typeName(b.type_code)}
                        </td>
                        <td className="px-[18px] py-2.5 text-end tabular-nums">
                          {b.entitled}
                        </td>
                        <td className="px-[18px] py-2.5 text-end tabular-nums text-muted">
                          {b.used}
                        </td>
                        <td className="px-[18px] py-2.5 text-end tabular-nums">
                          {b.pending > 0 ? (
                            <span className="text-yellow font-semibold">
                              {b.pending}
                            </span>
                          ) : (
                            "0"
                          )}
                        </td>
                        <td className="px-[18px] py-2.5 text-end tabular-nums font-bold">
                          <span
                            className={
                              b.remaining <= 2 ? "text-red" : "text-green"
                            }
                          >
                            {b.remaining}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="px-[18px] py-3 text-[11px] text-muted">
            {t("balancesNote")}
          </p>
        </Card>

        {/* Leave types (Egyptian Labor Law) */}
        <Card title={t("types.title")}>
          <ul className="space-y-3">
            {types.map((lt) => {
              const name = locale === "ar" ? lt.name_ar : lt.name_en;
              const note = locale === "ar" ? lt.note_ar : lt.note_en;
              return (
                <li
                  key={lt.id}
                  className="border-b border-line/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">{name}</span>
                    <div className="flex items-center gap-1.5">
                      {lt.annual_entitlement > 0 && (
                        <Badge variant="blue">
                          {lt.annual_entitlement} {t("daysShort")}
                        </Badge>
                      )}
                      <Badge variant={PAY_RULE_VARIANT[lt.pay_rule]}>
                        {lt.pay_rule === "partial"
                          ? `${lt.pay_pct}%`
                          : t(`payRule.${lt.pay_rule}`)}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{note}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
