"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { IMPORT_JOB, IMPORT_TEMPLATE_COLUMNS } from "@/lib/data/mock/import";

type Step = 1 | 2 | 3;

export default function ImportPage() {
  const t = useTranslations("import");
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const job = IMPORT_JOB;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setStep(2);
    }
  };

  const handleCommit = () => {
    setCommitted(true);
    setStep(3);
  };

  const STATUS_VARIANT: Record<string, "green" | "red" | "yellow" | "gray"> = {
    valid: "green",
    error: "red",
    duplicate: "yellow",
    warning: "yellow",
  };

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-0">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                step === s
                  ? "bg-accent text-white"
                  : step > s
                  ? "bg-green-600 text-white"
                  : "bg-line text-muted"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
            <span
              className={`mx-2 text-[12px] ${
                step === s ? "font-semibold" : "text-muted"
              }`}
            >
              {t(`steps.step${s}`)}
            </span>
            {i < 2 && (
              <div className={`h-px w-12 ${step > s ? "bg-green-600" : "bg-line"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Template & Upload */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line px-5 py-3.5">
              <p className="text-[13px] font-semibold">{t("template.title")}</p>
              <p className="text-[12px] text-muted">{t("template.subtitle")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">{t("template.column")}</th>
                    <th className="px-5 py-3">{t("template.example")}</th>
                    <th className="px-5 py-3">{t("template.required")}</th>
                  </tr>
                </thead>
                <tbody>
                  {IMPORT_TEMPLATE_COLUMNS.map((col) => (
                    <tr key={col.key} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-2.5">
                        <span className="font-mono font-medium">{col.label_en}</span>
                        <span className="ms-2 text-muted">({col.label_ar})</span>
                      </td>
                      <td className="px-5 py-2.5 font-mono text-muted">{col.example}</td>
                      <td className="px-5 py-2.5">
                        <Badge variant={col.required ? "red" : "gray"}>
                          {col.required ? t("template.req") : t("template.opt")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm p-5">
            <p className="mb-3 text-[13px] font-semibold">{t("upload.title")}</p>
            <p className="mb-4 text-[12px] text-muted">{t("upload.hint")}</p>
            <div className="mb-4 flex gap-3">
              <Button variant="ghost" size="sm">⬇ {t("upload.downloadTemplate")}</Button>
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-page px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent/5">
              <span className="text-3xl">📂</span>
              <span className="text-[13px] font-medium">{t("upload.dropzone")}</span>
              <span className="text-[12px] text-muted">{t("upload.formats")}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="primary" size="sm">
                {t("upload.browse")}
              </Button>
            </label>
          </div>

          {/* Demo shortcut */}
          <Alert variant="green">
            <span className="text-[12.5px]">
              {t("upload.demoNote")}{" "}
              <button
                onClick={() => { setFileName(job.file_name); setStep(2); }}
                className="font-semibold underline"
              >
                {t("upload.loadDemo")}
              </button>
            </span>
          </Alert>
        </div>
      )}

      {/* Step 2 — Validate & Review */}
      {step === 2 && (
        <div className="space-y-5">
          <Alert variant="green">
            <span className="text-[12.5px]">
              📄 <strong>{fileName ?? job.file_name}</strong> — {t("validate.dryRunNote")}
            </span>
          </Alert>

          {job.error_rows > 0 && (
            <Alert variant="red">
              <span className="text-[12.5px]">{t("validate.errorsFound", { count: job.error_rows })}</span>
            </Alert>
          )}

          <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
            <KpiCard label={t("validate.kpi.total")} value={job.total_rows} />
            <KpiCard label={t("validate.kpi.valid")} value={job.valid_rows} tone="up" sub={<Badge variant="green">{t("validate.kpi.validBadge")}</Badge>} />
            <KpiCard label={t("validate.kpi.errors")} value={job.error_rows} sub={<Badge variant="red">{t("validate.kpi.errorBadge")}</Badge>} />
            <KpiCard label={t("validate.kpi.duplicates")} value={job.duplicate_rows} sub={<Badge variant="yellow">{t("validate.kpi.dupBadge")}</Badge>} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line px-5 py-3.5">
              <p className="text-[13px] font-semibold">{t("validate.preview")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">{t("validate.col.hrCode")}</th>
                    <th className="px-4 py-3">{t("validate.col.name")}</th>
                    <th className="px-4 py-3">{t("validate.col.nationalId")}</th>
                    <th className="px-4 py-3">{t("validate.col.project")}</th>
                    <th className="px-4 py-3">{t("validate.col.hireDate")}</th>
                    <th className="px-4 py-3">{t("validate.col.status")}</th>
                    <th className="px-4 py-3">{t("validate.col.errors")}</th>
                  </tr>
                </thead>
                <tbody>
                  {job.rows.map((row) => (
                    <tr
                      key={row.row_number}
                      className={`border-b border-line last:border-b-0 ${
                        row.status === "error" ? "bg-red-50/40" : row.status === "duplicate" ? "bg-yellow-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 text-muted">{row.row_number}</td>
                      <td className="px-4 py-2.5 font-mono text-[12px]">{row.hr_code}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium">{row.name_ar}</div>
                        <div className="text-muted text-[11px]">{row.name_en}</div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-muted">{row.national_id}</td>
                      <td className="px-4 py-2.5">{row.project_code}</td>
                      <td className="px-4 py-2.5 text-muted">{row.hire_date}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={STATUS_VARIANT[row.status]}>
                          {t(`validate.statuses.${row.status}`)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.errors.length > 0 && (
                          <div className="space-y-0.5">
                            {row.errors.map((err, i) => (
                              <div key={i} className="text-[11px] text-red-600">
                                <span className="font-mono font-medium">{err.field}:</span>{" "}
                                {err.message_en}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← {t("validate.back")}</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(3)}
              disabled={job.error_rows > 0}
            >
              {t("validate.next")} →
            </Button>
            {job.error_rows > 0 && (
              <span className="self-center text-[12px] text-muted">{t("validate.fixFirst")}</span>
            )}
          </div>
        </div>
      )}

      {/* Step 3 — Commit */}
      {step === 3 && !committed && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm p-5">
            <p className="mb-1 text-[13px] font-semibold">{t("commit.title")}</p>
            <p className="mb-4 text-[12px] text-muted">{t("commit.subtitle")}</p>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-page p-3 text-center">
                <div className="text-[22px] font-bold text-green-600">{job.valid_rows}</div>
                <div className="text-[11px] text-muted">{t("commit.willCreate")}</div>
              </div>
              <div className="rounded-xl border border-line bg-page p-3 text-center">
                <div className="text-[22px] font-bold text-yellow-600">{job.duplicate_rows}</div>
                <div className="text-[11px] text-muted">{t("commit.willSkip")}</div>
              </div>
              <div className="rounded-xl border border-line bg-page p-3 text-center">
                <div className="text-[22px] font-bold">{job.valid_rows}</div>
                <div className="text-[11px] text-muted">{t("commit.inOnboarding")}</div>
              </div>
            </div>
            <Alert variant="yellow">
              <span className="text-[12.5px]">{t("commit.warning")}</span>
            </Alert>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← {t("commit.back")}</Button>
            <Button variant="primary" size="sm" onClick={handleCommit}>{t("commit.confirm")}</Button>
          </div>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === 3 && committed && (
        <div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mb-3 text-5xl">✅</div>
          <h2 className="mb-2 text-[16px] font-bold text-green-800">{t("done.title")}</h2>
          <p className="mb-1 text-[13px] text-green-700">
            {t("done.body", { count: job.valid_rows })}
          </p>
          <p className="mb-5 text-[12px] text-green-600">{t("done.next")}</p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" size="sm" onClick={() => { setStep(1); setCommitted(false); setFileName(null); }}>
              {t("done.importMore")}
            </Button>
            <a href="../employees">
              <Button variant="ghost" size="sm">{t("done.viewEmployees")}</Button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
