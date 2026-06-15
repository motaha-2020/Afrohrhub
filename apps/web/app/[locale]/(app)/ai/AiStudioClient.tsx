"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  DocClassification,
  IdExtraction,
  MatchResult,
  ParsedCv,
  SearchHit,
} from "@/lib/data/types";
import {
  classifyAction,
  extractIdAction,
  matchAction,
  parseCvAction,
  searchAction,
} from "./actions";

type Tool = "ocr" | "classifier" | "cv" | "match" | "search";

const TOOLS: { key: Tool; icon: string }[] = [
  { key: "ocr", icon: "🪪" },
  { key: "classifier", icon: "🏷" },
  { key: "cv", icon: "📄" },
  { key: "match", icon: "🎯" },
  { key: "search", icon: "🔎" },
];

const SAMPLE_CV = `محمود سيد النجار — لحّام أرجون أول
9 سنوات خبرة في مشاريع المحطات والـ EPC بصعيد مصر.
المهارات: لحام أرجون (TIG), لحام مواسير, قراءة رسومات, معايير ASME, العمل في المرتفعات.
الشهادات: AWS D1.1, كورس مكافحة حريق, شهادة العمل في المرتفعات.
المؤهل: دبلوم صنايع — لحام (2014).`;

const SAMPLE_DOC_TEXT =
  "جمهورية مصر العربية — بطاقة تحقيق الشخصية. الاسم: سيد عبد العاطي حسن. " +
  "الرقم القومي: 28906152233445. محل الإقامة: بنبان، أسوان.";

export function AiStudioClient({ live }: { live: boolean }) {
  const t = useTranslations("ai");
  const [tool, setTool] = useState<Tool>("ocr");

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Badge variant={live ? "green" : "yellow"}>
          {live ? t("statusLive") : t("statusDemo")}
        </Badge>
      </div>

      {!live && (
        <Alert variant="yellow" className="mb-4">
          {t("demoNote")}
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {TOOLS.map((tl) => (
          <button
            key={tl.key}
            onClick={() => setTool(tl.key)}
            className={[
              "rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              tool === tl.key
                ? "border-primary bg-blue-soft text-primary"
                : "border-line bg-card text-muted hover:bg-page",
            ].join(" ")}
          >
            {tl.icon} {t(`tools.${tl.key}.tab`)}
          </button>
        ))}
      </div>

      {tool === "ocr" && <OcrPanel />}
      {tool === "classifier" && <ClassifierPanel />}
      {tool === "cv" && <CvPanel />}
      {tool === "match" && <MatchPanel />}
      {tool === "search" && <SearchPanel />}
    </>
  );
}

/* ------------------------------- Shared --------------------------------- */

function RunButton({
  pending,
  onClick,
  label,
}: {
  pending: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="rounded-xl bg-primary px-5 py-2.5 text-[13px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "✦ …" : label}
    </button>
  );
}

function Confidence({ pct }: { pct: number }) {
  const t = useTranslations("ai");
  const variant = pct >= 90 ? "green" : pct >= 70 ? "blue" : "yellow";
  return (
    <Badge variant={variant}>
      {t("confidence")}: {pct}%
    </Badge>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-1.5 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end font-semibold">{value || "—"}</dd>
    </div>
  );
}

/* -------------------------------- OCR ----------------------------------- */

function OcrPanel() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<IdExtraction | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={`🪪 ${t("tools.ocr.inputTitle")}`}>
        <p className="mb-3 text-[12.5px] text-muted">{t("tools.ocr.desc")}</p>
        <div className="mb-3 flex aspect-[1.58/1] w-full items-center justify-center rounded-xl border border-dashed border-line bg-page text-center text-[12px] text-muted">
          {t("tools.ocr.sample")}
        </div>
        <RunButton
          pending={pending}
          label={t("tools.ocr.run")}
          onClick={() => start(async () => setResult(await extractIdAction()))}
        />
      </Card>
      <Card title={t("resultTitle")}>
        {!result ? (
          <p className="text-[12.5px] text-muted">{t("noResult")}</p>
        ) : (
          <>
            <div className="mb-3">
              <Confidence pct={result.confidence} />
            </div>
            <dl className="space-y-1.5 text-[12.5px]">
              <Field
                label={t("tools.ocr.f.name")}
                value={locale === "ar" ? result.name_ar : result.name_en}
              />
              <Field label={t("tools.ocr.f.nid")} value={result.national_id} />
              <Field label={t("tools.ocr.f.birth")} value={result.birth_date} />
              <Field
                label={t("tools.ocr.f.gender")}
                value={result.gender ? t(`gender.${result.gender}`) : ""}
              />
              <Field label={t("tools.ocr.f.address")} value={result.address} />
              <Field
                label={t("tools.ocr.f.expiry")}
                value={result.expiry_date ?? "—"}
              />
            </dl>
            <Alert variant="green" className="mt-3">
              {t("tools.ocr.autofill")}
            </Alert>
          </>
        )}
      </Card>
    </div>
  );
}

/* ----------------------------- Classifier ------------------------------- */

function ClassifierPanel() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [text, setText] = useState(SAMPLE_DOC_TEXT);
  const [result, setResult] = useState<DocClassification | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={`🏷 ${t("tools.classifier.inputTitle")}`}>
        <p className="mb-3 text-[12.5px] text-muted">
          {t("tools.classifier.desc")}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          dir="rtl"
          className="mb-3 w-full rounded-lg border border-line bg-page p-3 text-[12.5px]"
        />
        <RunButton
          pending={pending}
          label={t("tools.classifier.run")}
          onClick={() =>
            start(async () => setResult(await classifyAction(text)))
          }
        />
      </Card>
      <Card title={t("resultTitle")}>
        {!result ? (
          <p className="text-[12.5px] text-muted">{t("noResult")}</p>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="purple">
                {t(`docClass.${result.doc_class}`)}
              </Badge>
              <Confidence pct={result.confidence} />
            </div>
            <p className="text-[12.5px] leading-relaxed">
              {locale === "ar" ? result.rationale_ar : result.rationale_en}
            </p>
            <Alert variant="green" className="mt-3">
              {t("tools.classifier.filed")}
            </Alert>
          </>
        )}
      </Card>
    </div>
  );
}

/* -------------------------------- CV ------------------------------------ */

function CvPanel() {
  const t = useTranslations("ai");
  const [pending, start] = useTransition();
  const [cv, setCv] = useState(SAMPLE_CV);
  const [result, setResult] = useState<ParsedCv | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={`📄 ${t("tools.cv.inputTitle")}`}>
        <p className="mb-3 text-[12.5px] text-muted">{t("tools.cv.desc")}</p>
        <textarea
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          rows={8}
          dir="rtl"
          className="mb-3 w-full rounded-lg border border-line bg-page p-3 text-[12px] leading-relaxed"
        />
        <RunButton
          pending={pending}
          label={t("tools.cv.run")}
          onClick={() => start(async () => setResult(await parseCvAction(cv)))}
        />
      </Card>
      <Card title={t("resultTitle")}>
        {!result ? (
          <p className="text-[12.5px] text-muted">{t("noResult")}</p>
        ) : (
          <dl className="space-y-1.5 text-[12.5px]">
            <Field label={t("tools.cv.f.name")} value={result.name_en} />
            <Field label={t("tools.cv.f.title")} value={result.title_en} />
            <Field
              label={t("tools.cv.f.years")}
              value={String(result.years_experience)}
            />
            <Field label={t("tools.cv.f.education")} value={result.education} />
            <div className="border-b border-line/60 pb-1.5">
              <dt className="mb-1 text-muted">{t("tools.cv.f.skills")}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {result.skills.map((s) => (
                  <Badge key={s} variant="blue">
                    {s}
                  </Badge>
                ))}
              </dd>
            </div>
            <div className="pb-1.5">
              <dt className="mb-1 text-muted">{t("tools.cv.f.certs")}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {result.certifications.map((c) => (
                  <Badge key={c} variant="green">
                    {c}
                  </Badge>
                ))}
              </dd>
            </div>
          </dl>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------- Match ---------------------------------- */

function MatchPanel() {
  const t = useTranslations("ai");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [result, setResult] = useState<MatchResult | null>(null);

  const job = {
    jobTitle: "Argon Welder (Argon TIG)",
    requirements: "5+ years welding, AWS cert, working-at-heights, HSE-compliant",
    salaryRange: "9,000–13,000 EGP",
    candidate: {
      title: "Senior Argon Welder",
      years_experience: 9,
      skills: ["Argon (TIG) welding", "Pipe welding", "ASME standards"],
      certifications: ["AWS D1.1", "Working-at-heights"],
      expected_salary: 12500,
    },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title={`🎯 ${t("tools.match.inputTitle")}`}>
        <p className="mb-3 text-[12.5px] text-muted">{t("tools.match.desc")}</p>
        <dl className="space-y-1.5 text-[12.5px]">
          <Field label={t("tools.match.role")} value={job.jobTitle} />
          <Field label={t("tools.match.reqs")} value={job.requirements} />
          <Field label={t("tools.match.range")} value={job.salaryRange} />
          <Field
            label={t("tools.match.candidate")}
            value={`${job.candidate.title} · ${job.candidate.years_experience}y`}
          />
        </dl>
        <div className="mt-3">
          <RunButton
            pending={pending}
            label={t("tools.match.run")}
            onClick={() => start(async () => setResult(await matchAction(job)))}
          />
        </div>
      </Card>
      <Card title={t("resultTitle")}>
        {!result ? (
          <p className="text-[12.5px] text-muted">{t("noResult")}</p>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[30px] font-extrabold text-green tabular-nums">
                {result.match_pct}%
              </span>
              <span className="text-[12.5px] text-muted">
                {t("tools.match.fit")}
              </span>
            </div>
            <p className="mb-3 text-[12.5px] leading-relaxed">
              {locale === "ar" ? result.rationale_ar : result.rationale_en}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11.5px] font-semibold text-green">
                  ✓ {t("tools.match.strengths")}
                </p>
                <ul className="space-y-1 text-[12px] text-muted">
                  {result.strengths.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-[11.5px] font-semibold text-yellow">
                  ⚠ {t("tools.match.gaps")}
                </p>
                <ul className="space-y-1 text-[12px] text-muted">
                  {result.gaps.map((g) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------- Search --------------------------------- */

function SearchPanel() {
  const t = useTranslations("ai");
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("welder with heights safety clearance");
  const [hits, setHits] = useState<SearchHit[] | null>(null);

  return (
    <div className="space-y-4">
      <Card title={`🔎 ${t("tools.search.inputTitle")}`}>
        <p className="mb-3 text-[12.5px] text-muted">
          {t("tools.search.desc")}
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-[240px] flex-1 rounded-lg border border-line bg-page px-3 py-2.5 text-[12.5px]"
            placeholder={t("tools.search.placeholder")}
          />
          <RunButton
            pending={pending}
            label={t("tools.search.run")}
            onClick={() => start(async () => setHits(await searchAction(query)))}
          />
        </div>
      </Card>
      {hits && (
        <Card title={t("resultTitle")}>
          {hits.length === 0 ? (
            <p className="text-[12.5px] text-muted">{t("tools.search.none")}</p>
          ) : (
            <ul className="space-y-2">
              {hits
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((h) => (
                  <li
                    key={h.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-line bg-page p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold">{h.label}</p>
                      <p className="text-[11.5px] text-muted">{h.reason}</p>
                    </div>
                    <Badge
                      variant={
                        h.score >= 85 ? "green" : h.score >= 70 ? "blue" : "gray"
                      }
                    >
                      {h.score}%
                    </Badge>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
