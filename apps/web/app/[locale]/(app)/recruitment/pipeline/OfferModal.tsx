"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import type { Candidate, HiringRequest } from "@/lib/data/types";
import { formatNumber } from "@/lib/utils/format";

/** Stage 6 — offer letter generated from template, sent with the document list. */
export function OfferModal({
  candidate,
  request,
  onClose,
  onSend,
}: {
  candidate: Candidate;
  request: HiringRequest | null;
  onClose: () => void;
  onSend: (salary: number, startDate: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("recruitment.offerModal");
  const [salary, setSalary] = useState(String(candidate.expected_salary || ""));
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState("");

  const name = locale === "ar" ? candidate.name_ar : candidate.name_en;
  const jobTitle = request
    ? locale === "ar"
      ? request.job_title_ar
      : request.job_title_en
    : "—";
  const aboveRange =
    request != null && Number(salary) > request.salary_max;

  function handleSend() {
    if (!salary || Number(salary) <= 0 || !startDate) {
      setError(t("required"));
      return;
    }
    onSend(Number(salary), startDate);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl bg-card shadow-2xl"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <header className="flex items-center gap-3 border-b border-line px-6 py-4">
          <span className="text-2xl">📨</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {t("kicker")}
            </p>
            <h3 className="truncate text-[15px] font-bold">
              {name} — {jobTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-lg text-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-muted">
                {t("salaryLabel")} <span className="text-red">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={salary}
                onChange={(e) => {
                  setSalary(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-line bg-page px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none"
                dir="ltr"
              />
              {request && (
                <p className="mt-1 text-[11px] text-muted">
                  {t("approvedRange", {
                    min: formatNumber(request.salary_min, locale),
                    max: formatNumber(request.salary_max, locale),
                  })}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-muted">
                {t("startDateLabel")} <span className="text-red">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-line bg-page px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {aboveRange && <Alert variant="yellow">{t("aboveRange")}</Alert>}

          <div className="rounded-xl border border-line bg-page p-3.5 text-[12px] leading-relaxed text-muted">
            <p className="mb-1.5 font-bold text-ink">{t("includesTitle")}</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li>{t("includes.letter")}</li>
              <li>{t("includes.documents")}</li>
              <li>{t("includes.training")}</li>
              <li>{t("includes.deadline")}</li>
            </ul>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-6 py-4">
          {error && (
            <p className="me-auto self-center text-[11.5px] text-red">
              {error}
            </p>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-[13px] font-semibold text-muted hover:bg-page"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSend}
            className="rounded-lg bg-primary px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-primary-dark"
          >
            {t("send")}
          </button>
        </footer>
      </div>
    </div>
  );
}
