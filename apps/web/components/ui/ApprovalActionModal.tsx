"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlaCountdown } from "./SlaCountdown";
import type { ApprovalTask } from "@/lib/data/types";

type Action = "approve" | "reject";

type Props = {
  task: ApprovalTask;
  onClose: () => void;
  onConfirm: (taskId: string, action: Action, comment: string) => void;
};

const MODULE_ICON: Record<ApprovalTask["module"], string> = {
  recruitment: "🎯",
  leave: "🏖",
  advance: "💵",
  offboarding_settlement: "📦",
  salary_change: "💰",
  penalty: "⚠️",
  onboarding: "🚀",
};

export function ApprovalActionModal({ task, onClose, onConfirm }: Props) {
  const locale = useLocale();
  const t = useTranslations("approvals");
  const [action, setAction] = useState<Action>("approve");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const subject = locale === "ar" ? task.subject_ar : task.subject_en;
  const reqBy =
    locale === "ar" ? task.requested_by_name_ar : task.requested_by_name_en;
  const moduleName = t(`modules.${task.module}`);

  function handleSubmit() {
    if (action === "reject" && !comment.trim()) {
      setError(t("modal.rejectRequired"));
      return;
    }
    onConfirm(task.id, action, comment.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[480px] rounded-2xl bg-card shadow-2xl"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <header className="flex items-center gap-3 border-b border-line px-6 py-4">
          <span className="text-2xl">{MODULE_ICON[task.module]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {moduleName}
            </p>
            <h3 className="truncate text-[15px] font-bold">{subject}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-lg text-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted">{t("columns.requestedBy")}</span>
            <span className="font-medium">{reqBy}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">
              {t("columns.sla")}
            </span>
            <SlaCountdown
              hours={task.sla_hours_remaining}
              priority={task.sla_priority}
              locale={locale}
            />
          </div>

          <div className="flex gap-2 rounded-xl bg-page p-1">
            {(["approve", "reject"] as Action[]).map((a) => (
              <button
                key={a}
                onClick={() => { setAction(a); setError(""); }}
                className={[
                  "flex-1 rounded-lg py-2 text-[13px] font-semibold transition-colors",
                  action === a
                    ? a === "approve"
                      ? "bg-green text-white shadow-sm"
                      : "bg-red text-white shadow-sm"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {a === "approve" ? t("modal.approveBtn") : t("modal.rejectBtn")}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-muted">
              {t("modal.commentLabel")}
              {action === "reject" && (
                <span className="ms-1 text-red">*</span>
              )}
            </label>
            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); setError(""); }}
              placeholder={t("modal.commentPlaceholder")}
              rows={3}
              className="w-full resize-none rounded-lg border border-line bg-page px-3 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
            />
            {error && (
              <p className="mt-1 text-[11.5px] text-red">{error}</p>
            )}
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-muted hover:bg-page"
          >
            {t("modal.cancelBtn")}
          </button>
          <button
            onClick={handleSubmit}
            className={[
              "rounded-lg px-5 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90",
              action === "approve" ? "bg-green" : "bg-red",
            ].join(" ")}
          >
            {action === "approve" ? t("modal.approveTitle") : t("modal.rejectTitle")}
          </button>
        </footer>
      </div>
    </div>
  );
}
