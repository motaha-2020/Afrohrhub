"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type {
  Candidate,
  HiringRequest,
  JobOffer,
  Project,
} from "@/lib/data/types";
import {
  daysBetween,
  formatDate,
  formatNumber,
  localizedName,
} from "@/lib/utils/format";

type Response = "none" | "accepted" | "declined";

export function OfferResponseClient({
  offer,
  candidate,
  request,
  project,
}: {
  offer: JobOffer;
  candidate: Candidate;
  request: HiringRequest;
  project: Project | null;
}) {
  const locale = useLocale();
  const t = useTranslations("offerPage");
  const [response, setResponse] = useState<Response>(
    offer.status === "accepted"
      ? "accepted"
      : offer.status === "declined"
        ? "declined"
        : "none"
  );
  const [confirmedDate, setConfirmedDate] = useState(
    offer.proposed_start_date
  );

  const name = locale === "ar" ? candidate.name_ar : candidate.name_en;
  const jobTitle =
    locale === "ar" ? request.job_title_ar : request.job_title_en;
  const daysLeft = offer.expires_at
    ? daysBetween(new Date().toISOString().slice(0, 10), offer.expires_at)
    : null;
  const expired = daysLeft !== null && daysLeft < 0;

  return (
    <main className="flex min-h-screen items-start justify-center bg-page p-4 sm:items-center">
      <div className="w-full max-w-[480px]">
        <div className="mb-4 text-center">
          <span className="text-3xl">🏗</span>
          <h1 className="mt-1 text-[18px] font-extrabold">AfroHR Hub</h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          <header className="border-b border-line bg-primary-soft px-6 py-5 text-center">
            <p className="text-[12px] font-semibold text-primary">
              {t("kicker")}
            </p>
            <h2 className="mt-1 text-[19px] font-extrabold">{jobTitle}</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {t("greeting", { name })}
            </p>
          </header>

          <div className="space-y-3 px-6 py-5 text-[13px]">
            {[
              {
                label: t("fields.salary"),
                value: `${formatNumber(offer.offered_salary, locale)} ${t("egpMonthly")}`,
              },
              {
                label: t("fields.project"),
                value: project ? localizedName(project, locale) : "—",
              },
              {
                label: t("fields.startDate"),
                value: formatDate(offer.proposed_start_date, locale),
              },
              {
                label: t("fields.workplace"),
                value: t(`workplace.${request.workplace}`),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-muted">{label}</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}

            {daysLeft !== null && response === "none" && (
              <div className="pt-1 text-center">
                <Badge variant={expired ? "red" : daysLeft <= 7 ? "yellow" : "green"}>
                  {expired
                    ? t("expired")
                    : t("daysLeft", {
                        days: formatNumber(daysLeft, locale),
                      })}
                </Badge>
              </div>
            )}

            <div className="rounded-xl border border-line bg-page p-3.5 text-[12px] leading-relaxed text-muted">
              <p className="mb-1 font-bold text-ink">{t("nextSteps.title")}</p>
              <p>{t("nextSteps.body")}</p>
            </div>
          </div>

          {response === "none" && !expired && (
            <div className="space-y-3 border-t border-line px-6 py-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-muted">
                  {t("confirmDateLabel")}
                </label>
                <input
                  type="date"
                  value={confirmedDate}
                  onChange={(e) => setConfirmedDate(e.target.value)}
                  className="w-full rounded-lg border border-line bg-page px-3 py-2.5 text-[13px] focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>
              <button
                onClick={() => setResponse("accepted")}
                className="w-full rounded-xl bg-green py-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90"
              >
                {t("accept")}
              </button>
              <button
                onClick={() => setResponse("declined")}
                className="w-full rounded-xl border-[1.5px] border-red py-3 text-[14px] font-bold text-red transition-colors hover:bg-red-soft"
              >
                {t("decline")}
              </button>
            </div>
          )}

          {response === "accepted" && (
            <div className="border-t border-line px-6 py-6 text-center">
              <div className="text-4xl">🎉</div>
              <h3 className="mt-2 text-[16px] font-extrabold text-green">
                {t("acceptedTitle")}
              </h3>
              <p className="mt-1 text-[13px] text-muted">
                {t("acceptedBody", {
                  date: formatDate(confirmedDate, locale),
                })}
              </p>
            </div>
          )}

          {response === "declined" && (
            <div className="border-t border-line px-6 py-6 text-center">
              <div className="text-4xl">🙏</div>
              <h3 className="mt-2 text-[16px] font-bold">
                {t("declinedTitle")}
              </h3>
              <p className="mt-1 text-[13px] text-muted">
                {t("declinedBody")}
              </p>
            </div>
          )}

          {expired && response === "none" && (
            <div className="border-t border-line px-6 py-6 text-center">
              <h3 className="text-[15px] font-bold text-red">
                {t("expiredTitle")}
              </h3>
              <p className="mt-1 text-[13px] text-muted">
                {t("expiredBody")}
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted">
          {t("footer")}
        </p>
      </div>
    </main>
  );
}
