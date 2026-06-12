"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  ActivationConditionKey,
  OnboardingCase,
  OnboardingOwnerRole,
  OnboardingStage,
  OnboardingTask,
  TaskStatus,
} from "@/lib/data/types";
import { formatDate, formatNumber } from "@/lib/utils/format";

const STAGES: OnboardingStage[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const OWNER_VARIANT: Record<OnboardingOwnerRole, BadgeVariant> = {
  talent_acquisition: "purple",
  personnel: "blue",
  it: "gray",
  hse: "yellow",
  operations_admin: "gray",
  hr_manager: "green",
};

const TASK_TONE: Record<TaskStatus, string> = {
  done: "text-green",
  in_progress: "text-primary",
  pending: "text-muted",
  blocked: "text-red",
  skipped: "text-muted line-through",
};

/** The six activation conditions, computed from local task state. */
function computeConditions(
  c: OnboardingCase,
  tasks: OnboardingTask[]
): { key: ActivationConditionKey; met: boolean; owner: OnboardingOwnerRole }[] {
  const isDone = (key: string) =>
    tasks.find((t) => t.task_key === key)?.status === "done";
  const hseDone = c.safety_sensitive_role
    ? isDone("course_firefighting") && isDone("course_heights")
    : true;
  const medicalDone = c.requires_medical_exam ? isDone("medical_exam") : true;
  return [
    { key: "documents_complete", met: isDone("doc_verified"), owner: "personnel" },
    { key: "contracts_signed", met: isDone("contract_signed") && isDone("si_form1"), owner: "personnel" },
    { key: "hse_requirements", met: hseDone, owner: "hse" },
    { key: "medical_exam", met: medicalDone, owner: "hse" },
    { key: "systems_ready", met: isDone("erp_profile") && isDone("system_access"), owner: "it" },
    { key: "certificates_valid", met: hseDone, owner: "hse" },
  ];
}

export function OnboardingCaseClient({
  onboardingCase,
  tasks: initialTasks,
  projectName,
}: {
  onboardingCase: OnboardingCase;
  tasks: OnboardingTask[];
  projectName: string;
}) {
  const locale = useLocale();
  const t = useTranslations("onboarding");
  const tRoles = useTranslations("roles");

  const [tasks, setTasks] = useState(initialTasks);
  const [activated, setActivated] = useState(
    onboardingCase.status === "activated"
  );

  const name =
    locale === "ar"
      ? onboardingCase.candidate_name_ar
      : onboardingCase.candidate_name_en;
  const jobTitle =
    locale === "ar" ? onboardingCase.job_title_ar : onboardingCase.job_title_en;

  const conditions = useMemo(
    () => computeConditions(onboardingCase, tasks),
    [onboardingCase, tasks]
  );
  const ready = conditions.every((c) => c.met);
  const missing = conditions.filter((c) => !c.met);

  function toggleTask(taskId: string) {
    if (activated) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === "done" ? "pending" : "done",
              completed_at:
                task.status === "done" ? null : new Date().toISOString(),
            }
          : task
      )
    );
  }

  const he = onboardingCase.hiring_email;
  const hiringEmailFields: { label: string; value: string }[] = [
    { label: t("hiringEmail.nameEn"), value: he.name_en },
    { label: t("hiringEmail.nameAr"), value: he.name_ar },
    { label: t("hiringEmail.nationalId"), value: he.national_id },
    { label: t("hiringEmail.mobile"), value: he.mobile },
    { label: t("hiringEmail.jobTitle"), value: he.job_title },
    { label: t("hiringEmail.projectCode"), value: he.project_code },
    { label: t("hiringEmail.projectName"), value: he.project_name },
    { label: t("hiringEmail.directManager"), value: he.direct_manager },
    { label: t("hiringEmail.workLocation"), value: he.work_location },
    {
      label: t("hiringEmail.netSalary"),
      value: `${formatNumber(he.net_salary, locale)} ${t("egp")}`,
    },
    { label: t("hiringEmail.allowances"), value: he.allowances },
    { label: t("hiringEmail.siNumber"), value: he.social_insurance_number },
    {
      label: t("hiringEmail.contractDate"),
      value: he.contract_signing_date
        ? formatDate(he.contract_signing_date, locale)
        : t("hiringEmail.pending"),
    },
    {
      label: t("hiringEmail.joiningDate"),
      value: formatDate(he.joining_date, locale),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Link
          href="/onboarding"
          className="text-[12.5px] font-semibold text-muted hover:text-ink"
        >
          ← {t("notFound.back")}
        </Link>
      </div>

      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{name}</h1>
          <p className="text-[12.5px] text-muted">
            {onboardingCase.case_code} · {jobTitle} · {projectName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={onboardingCase.priority === "P0" ? "red" : "blue"}>
            {onboardingCase.priority}
          </Badge>
          {activated ? (
            <Badge variant="green">{t("statuses.activated")}</Badge>
          ) : ready ? (
            <Badge variant="purple">{t("statuses.ready")}</Badge>
          ) : (
            <Badge variant="blue">{t("statuses.in_progress")}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* 9-stage checklist */}
        <div className="space-y-3">
          {STAGES.map((stage) => {
            const inStage = tasks.filter((task) => task.stage === stage);
            if (inStage.length === 0) return null;
            const allDone = inStage.every((task) => task.status === "done");
            return (
              <Card key={stage}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={[
                      "flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold",
                      allDone
                        ? "bg-green text-white"
                        : "bg-[#e3e8f0] text-muted",
                    ].join(" ")}
                  >
                    {allDone ? "✓" : stage}
                  </span>
                  <h3 className="text-[14px] font-bold">
                    {t(`stages.${stage}`)}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {inStage.map((task) => {
                    const isActivationTask = task.task_key === "activation";
                    return (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-page"
                      >
                        <button
                          onClick={() =>
                            !isActivationTask && toggleTask(task.id)
                          }
                          disabled={isActivationTask || activated}
                          className="flex items-center gap-2.5 text-start disabled:cursor-default"
                        >
                          <span
                            className={[
                              "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border text-[11px]",
                              task.status === "done"
                                ? "border-green bg-green text-white"
                                : task.status === "in_progress"
                                  ? "border-primary text-primary"
                                  : "border-line text-transparent",
                            ].join(" ")}
                          >
                            {task.status === "done"
                              ? "✓"
                              : task.status === "in_progress"
                                ? "•"
                                : ""}
                          </span>
                          <span
                            className={[
                              "text-[12.5px]",
                              TASK_TONE[task.status],
                            ].join(" ")}
                          >
                            {locale === "ar" ? task.title_ar : task.title_en}
                          </span>
                        </button>
                        <Badge variant={OWNER_VARIANT[task.owner_role]}>
                          {tRoles(task.owner_role)}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Side column: activation gate + hiring email */}
        <div className="space-y-4">
          <Card title={`🚪 ${t("gate.title")}`}>
            <p className="mb-3 text-[11.5px] text-muted">
              {t("gate.subtitle")}
            </p>
            <ul className="space-y-2">
              {conditions.map((cond) => (
                <li
                  key={cond.key}
                  className="flex items-center justify-between gap-2 text-[12.5px]"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={[
                        "flex size-[18px] items-center justify-center rounded-full text-[11px] font-bold text-white",
                        cond.met ? "bg-green" : "bg-[#cbd2dc]",
                      ].join(" ")}
                    >
                      {cond.met ? "✓" : "•"}
                    </span>
                    <span
                      className={cond.met ? "text-ink" : "text-muted"}
                    >
                      {t(`gate.conditions.${cond.key}`)}
                    </span>
                  </span>
                  {!cond.met && (
                    <Badge variant={OWNER_VARIANT[cond.owner]}>
                      {tRoles(cond.owner)}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-line pt-4">
              {activated ? (
                <Alert variant="green">{t("gate.activated")}</Alert>
              ) : ready ? (
                <button
                  onClick={() => setActivated(true)}
                  className="w-full rounded-xl bg-green py-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  {t("gate.activateBtn")}
                </button>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-xl bg-[#e3e8f0] py-3 text-[14px] font-extrabold text-muted"
                  >
                    {t("gate.activateBtn")}
                  </button>
                  <p className="mt-2 text-[11.5px] text-muted">
                    {t("gate.missingNote", { count: missing.length })}
                  </p>
                </>
              )}
            </div>
            <p className="mt-3 text-[11px] text-muted">{t("gate.policyNote")}</p>
          </Card>

          <Card title={`📧 ${t("hiringEmail.title")}`}>
            <p className="mb-3 text-[11.5px] text-muted">
              {t("hiringEmail.subtitle")}
            </p>
            <dl className="space-y-1.5 text-[12px]">
              {hiringEmailFields.map((field, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 border-b border-line/60 pb-1.5 last:border-b-0"
                >
                  <dt className="text-muted">{field.label}</dt>
                  <dd className="text-end font-semibold">{field.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
