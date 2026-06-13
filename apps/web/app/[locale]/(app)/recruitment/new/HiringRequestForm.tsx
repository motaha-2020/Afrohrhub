"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EMPLOYEES } from "@/lib/data/mock/seed";
import type { Project, SlaPriority, WorkplaceType } from "@/lib/data/types";
import { localizedName } from "@/lib/utils/format";

type RequestType = "new_position" | "replacement";

const inputCls =
  "w-full rounded-[9px] border border-line bg-card px-3 py-2 text-[13px] outline-none transition-colors focus:border-primary";
const labelCls = "mb-1 block text-[12px] font-bold";

function Field({
  label,
  required = true,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label} {required && <span className="text-red">*</span>}
      </label>
      {children}
    </div>
  );
}

export function HiringRequestForm({ projects }: { projects: Project[] }) {
  const locale = useLocale();
  const t = useTranslations("recruitment.form");

  const [jobTitle, setJobTitle] = useState("");
  const [openings, setOpenings] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [manager, setManager] = useState("");
  const [workplace, setWorkplace] = useState<WorkplaceType>("site");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [priority, setPriority] = useState<SlaPriority>("P1");
  const [requestType, setRequestType] = useState<RequestType>("new_position");
  const [replacedCode, setReplacedCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /** Replacement validation against Core HR (Stage 1 of the manual). */
  const replacedEmployee = useMemo(() => {
    const code = replacedCode.trim().toUpperCase();
    if (!code) return null;
    return (
      EMPLOYEES.find((e) => e.hr_code.toUpperCase() === code) ?? null
    );
  }, [replacedCode]);

  const replacementValid =
    requestType !== "replacement" ||
    (replacedEmployee !== null &&
      (replacedEmployee.status === "offboarding" ||
        replacedEmployee.status === "archived"));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !jobTitle.trim() ||
      !projectId ||
      !manager.trim() ||
      !salaryMin ||
      !salaryMax ||
      !qualifications.trim()
    ) {
      setError(t("errors.missingFields"));
      return;
    }
    if (Number(salaryMax) < Number(salaryMin)) {
      setError(t("errors.salaryRange"));
      return;
    }
    if (requestType === "replacement") {
      if (!replacedEmployee) {
        setError(t("errors.replacementNotFound"));
        return;
      }
      if (!replacementValid) {
        setError(t("errors.replacementNotLeaving"));
        return;
      }
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-[560px] text-center">
        <div className="py-6">
          <div className="text-4xl">✅</div>
          <h2 className="mt-3 text-[17px] font-bold">{t("success.title")}</h2>
          <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] text-muted">
            {t("success.body")}
          </p>
          <div className="mt-5 flex justify-center gap-2.5">
            <Link
              href="/recruitment"
              className="rounded-[9px] bg-primary px-[18px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-primary-dark"
            >
              {t("success.backToList")}
            </Link>
            <Link
              href="/approvals"
              className="rounded-[9px] border-[1.5px] border-primary bg-card px-[18px] py-[9px] text-[13px] font-bold text-primary transition-colors hover:bg-primary-soft"
            >
              {t("success.viewApprovals")}
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[760px]">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.jobTitle")}>
            <input
              className={inputCls}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t("placeholders.jobTitle")}
            />
          </Field>
          <Field label={t("fields.openings")}>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={openings}
              onChange={(e) => setOpenings(Number(e.target.value))}
            />
          </Field>
          <Field label={t("fields.project")}>
            <select
              className={inputCls}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">{t("placeholders.project")}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {localizedName(p, locale)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fields.directManager")}>
            <input
              className={inputCls}
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder={t("placeholders.directManager")}
            />
          </Field>
          <Field label={t("fields.workplace")}>
            <select
              className={inputCls}
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value as WorkplaceType)}
            >
              <option value="site">{t("workplace.site")}</option>
              <option value="office">{t("workplace.office")}</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("fields.salaryMin")}>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="9000"
              />
            </Field>
            <Field label={t("fields.salaryMax")}>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="12000"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={t("fields.qualifications")}>
              <textarea
                rows={3}
                className={inputCls}
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder={t("placeholders.qualifications")}
              />
            </Field>
          </div>
          <Field label={t("fields.priority")}>
            <div className="flex gap-2">
              {(["P0", "P1"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={[
                    "flex-1 rounded-[9px] border-[1.5px] px-3 py-2 text-[12.5px] font-bold transition-colors",
                    priority === p
                      ? p === "P0"
                        ? "border-red bg-red-soft text-red"
                        : "border-primary bg-primary-soft text-primary"
                      : "border-line bg-card text-muted hover:border-primary",
                  ].join(" ")}
                >
                  {t(`priorities.${p}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t("fields.requestType")}>
            <select
              className={inputCls}
              value={requestType}
              onChange={(e) =>
                setRequestType(e.target.value as RequestType)
              }
            >
              <option value="new_position">
                {t("requestTypes.new_position")}
              </option>
              <option value="replacement">
                {t("requestTypes.replacement")}
              </option>
            </select>
          </Field>

          {requestType === "replacement" && (
            <div className="sm:col-span-2">
              <Field label={t("fields.replacedHrCode")}>
                <input
                  className={inputCls}
                  value={replacedCode}
                  onChange={(e) => setReplacedCode(e.target.value)}
                  placeholder="AFR-2023-0188"
                  dir="ltr"
                />
              </Field>
              {replacedCode.trim() &&
                (replacedEmployee ? (
                  replacementValid ? (
                    <Alert variant="green" className="mt-2">
                      {t("replacementFound", {
                        name: localizedName(replacedEmployee, locale),
                      })}
                    </Alert>
                  ) : (
                    <Alert variant="yellow" className="mt-2">
                      {t("errors.replacementNotLeaving")}
                    </Alert>
                  )
                ) : (
                  <Alert variant="red" className="mt-2">
                    {t("errors.replacementNotFound")}
                  </Alert>
                ))}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="red" className="mt-4">
            {error}
          </Alert>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[11.5px] text-muted">{t("approvalNote")}</p>
          <div className="flex gap-2">
            <Link
              href="/recruitment"
              className="rounded-[9px] px-[18px] py-[9px] text-[13px] font-bold text-muted transition-colors hover:bg-page"
            >
              {t("cancel")}
            </Link>
            <Button type="submit">{t("submit")}</Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
