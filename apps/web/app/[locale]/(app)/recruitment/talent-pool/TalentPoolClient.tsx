"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CandidateSource, TalentPoolEntry } from "@/lib/data/types";
import {
  avatarColor,
  formatDate,
  formatNumber,
  initials,
} from "@/lib/utils/format";

export function TalentPoolClient({ entries }: { entries: TalentPoolEntry[] }) {
  const locale = useLocale();
  const t = useTranslations("recruitment.talentPool");
  const [q, setQ] = useState("");
  const [source, setSource] = useState<CandidateSource | "all">("all");
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  const needle = q.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    if (source !== "all" && e.source !== source) return false;
    if (!needle) return true;
    const haystack = [e.name_ar, e.name_en, e.title_ar, e.title_en, ...e.skills]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });

  function addToPipeline(id: string) {
    setAddedTo((prev) => new Set(prev).add(id));
  }

  const SOURCES: (CandidateSource | "all")[] = [
    "all",
    "talent_pool",
    "referral",
    "job_board",
    "agency",
    "walk_in",
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-[360px] rounded-[9px] border border-line bg-card px-3 py-2 text-[12.5px] outline-none transition-colors focus:border-primary"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as CandidateSource | "all")}
          className="rounded-[9px] border border-line bg-card px-3 py-2 text-[12.5px] font-semibold outline-none focus:border-primary"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? t("allSources") : t(`sources.${s}`)}
            </option>
          ))}
        </select>
        <p className="text-[11.5px] text-muted">{t("semanticNote")}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card shadow-sm">
          <EmptyState
            icon="🗃"
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-page text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-start">{t("columns.name")}</th>
                <th className="px-5 py-3 text-start max-lg:hidden">
                  {t("columns.skills")}
                </th>
                <th className="px-5 py-3 text-start">
                  {t("columns.experience")}
                </th>
                <th className="px-5 py-3 text-start max-lg:hidden">
                  {t("columns.expectedSalary")}
                </th>
                <th className="px-5 py-3 text-start max-lg:hidden">
                  {t("columns.lastContact")}
                </th>
                <th className="px-5 py-3 text-start">{t("columns.source")}</th>
                <th className="px-5 py-3 text-start"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const name = locale === "ar" ? entry.name_ar : entry.name_en;
                const title =
                  locale === "ar" ? entry.title_ar : entry.title_en;
                const added = addedTo.has(entry.id);
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-page/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: avatarColor(entry.id) }}
                        >
                          {initials(name)}
                        </span>
                        <div>
                          <p className="font-semibold leading-tight">{name}</p>
                          <p className="text-[11.5px] text-muted">{title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-lg:hidden">
                      <div className="flex flex-wrap gap-1">
                        {entry.skills.map((skill) => (
                          <Badge key={skill} variant="gray">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      {t("years", {
                        count: formatNumber(entry.years_experience, locale),
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-muted max-lg:hidden">
                      {entry.expected_salary
                        ? `${formatNumber(entry.expected_salary, locale)} ${t("egp")}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted max-lg:hidden">
                      {entry.last_contacted_at
                        ? formatDate(entry.last_contacted_at, locale)
                        : t("neverContacted")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="blue">
                        {t(`sources.${entry.source}`)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {added ? (
                        <span className="text-[12px] font-bold text-green">
                          {t("addedToPipeline")}
                        </span>
                      ) : (
                        <button
                          onClick={() => addToPipeline(entry.id)}
                          className="whitespace-nowrap rounded-lg border-[1.5px] border-primary px-3 py-1.5 text-[12px] font-bold text-primary transition-colors hover:bg-primary-soft"
                        >
                          {t("addToPipeline")}
                        </button>
                      )}
                    </td>
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
