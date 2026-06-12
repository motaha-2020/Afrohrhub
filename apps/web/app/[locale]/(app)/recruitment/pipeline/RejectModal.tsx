"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Candidate } from "@/lib/data/types";

/** Reject with mandatory reason — the candidate is kept in the talent pool. */
export function RejectModal({
  candidate,
  onClose,
  onConfirm,
}: {
  candidate: Candidate;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("recruitment.rejectModal");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const name = locale === "ar" ? candidate.name_ar : candidate.name_en;

  function handleConfirm() {
    if (!reason.trim()) {
      setError(t("required"));
      return;
    }
    onConfirm(reason.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl bg-card shadow-2xl"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <header className="flex items-center gap-3 border-b border-line px-6 py-4">
          <span className="text-2xl">🚫</span>
          <h3 className="flex-1 truncate text-[15px] font-bold">
            {t("title", { name })}
          </h3>
          <button
            onClick={onClose}
            className="text-lg text-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="px-6 py-5">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            {t("reasonLabel")} <span className="text-red">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            placeholder={t("reasonPlaceholder")}
            rows={3}
            className="w-full resize-none rounded-lg border border-line bg-page px-3 py-2.5 text-[13px] placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {error && <p className="mt-1 text-[11.5px] text-red">{error}</p>}
          <p className="mt-2 text-[11.5px] text-muted">{t("poolNote")}</p>
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-muted hover:bg-page"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-red px-5 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            {t("confirm")}
          </button>
        </footer>
      </div>
    </div>
  );
}
