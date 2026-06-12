"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { SlaCountdown } from "@/components/ui/SlaCountdown";
import { ApprovalActionModal } from "@/components/ui/ApprovalActionModal";
import type { ApprovalTask, ApprovalStatus } from "@/lib/data/types";

type Tab = "pending" | "completed" | "delegated";
type Action = "approve" | "reject";

const MODULE_ICON: Record<ApprovalTask["module"], string> = {
  recruitment: "🎯",
  leave: "🏖",
  advance: "💵",
  offboarding_settlement: "📦",
  salary_change: "💰",
  penalty: "⚠️",
  onboarding: "🚀",
};

const STATUS_VARIANT: Record<ApprovalStatus, "green" | "red" | "blue" | "gray"> = {
  pending: "blue",
  approved: "green",
  rejected: "red",
  delegated: "gray",
};

function RelativeTime({ iso, locale }: { iso: string; locale: string }) {
  const diffH = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (diffH < 1) {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    return <span>{locale === "ar" ? `منذ ${m} د` : `${m}m ago`}</span>;
  }
  if (diffH < 24) return <span>{locale === "ar" ? `منذ ${diffH} س` : `${diffH}h ago`}</span>;
  const d = Math.floor(diffH / 24);
  return <span>{locale === "ar" ? `منذ ${d} يوم` : `${d}d ago`}</span>;
}

export function ApprovalsClient({ initial }: { initial: ApprovalTask[] }) {
  const locale = useLocale();
  const t = useTranslations("approvals");
  const [tasks, setTasks] = useState(initial);
  const [tab, setTab] = useState<Tab>("pending");
  const [modalTask, setModalTask] = useState<ApprovalTask | null>(null);

  const filtered = tasks.filter((task) => {
    if (tab === "pending") return task.status === "pending";
    if (tab === "completed")
      return task.status === "approved" || task.status === "rejected";
    return task.status === "delegated";
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  function handleConfirm(id: string, action: Action, comment: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: action === "approve" ? "approved" : "rejected",
              comment: comment || null,
            }
          : t
      )
    );
  }

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "pending", label: t("tabs.pending"), count: pendingCount },
    { key: "completed", label: t("tabs.completed") },
    { key: "delegated", label: t("tabs.delegated") },
  ];

  return (
    <>
      {modalTask && (
        <ApprovalActionModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onConfirm={handleConfirm}
        />
      )}

      <div className="mb-5 flex gap-1 rounded-xl bg-page p-1 w-fit border border-line">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors",
              tab === key
                ? "bg-card text-ink shadow-sm"
                : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className="ms-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-3 text-[15px] font-semibold">{t("empty.title")}</p>
          <p className="mt-1 text-[13px] text-muted">{t("empty.description")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3">{t("columns.module")}</th>
                <th className="px-5 py-3">{t("columns.subject")}</th>
                <th className="px-5 py-3 max-lg:hidden">{t("columns.requestedBy")}</th>
                <th className="px-5 py-3">{t("columns.sla")}</th>
                <th className="px-5 py-3 max-lg:hidden">{t("columns.status")}</th>
                {tab === "pending" && (
                  <th className="px-5 py-3">{t("columns.actions")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const subject =
                  locale === "ar" ? task.subject_ar : task.subject_en;
                const reqBy = locale === "ar"
                  ? task.requested_by_name_ar
                  : task.requested_by_name_en;

                return (
                  <tr
                    key={task.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span>{MODULE_ICON[task.module]}</span>
                        <Badge variant="gray">
                          {t(`modules.${task.module}`)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium leading-snug">{subject}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted">
                        <RelativeTime
                          iso={task.requested_at}
                          locale={locale}
                        />
                      </p>
                    </td>
                    <td className="px-5 py-3.5 max-lg:hidden text-muted">
                      {reqBy}
                    </td>
                    <td className="px-5 py-3.5">
                      {task.status === "pending" ? (
                        <SlaCountdown
                          hours={task.sla_hours_remaining}
                          priority={task.sla_priority}
                          locale={locale}
                        />
                      ) : (
                        <span className="text-muted text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 max-lg:hidden">
                      <Badge variant={STATUS_VARIANT[task.status]}>
                        {t(`statuses.${task.status}`)}
                      </Badge>
                    </td>
                    {tab === "pending" && (
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModalTask(task)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary-dark transition-colors"
                          >
                            {t("modal.approveBtn")} / {t("modal.rejectBtn")}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
