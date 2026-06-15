"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  ClearanceDept,
  ClearanceItem,
  OffboardingCase,
  OffboardingStage,
} from "@/lib/data/types";
import { formatDate, formatNumber } from "@/lib/utils/format";

const STAGES: OffboardingStage[] = [1, 2, 3, 4, 5, 6];

const DEPT_ORDER: ClearanceDept[] = [
  "it",
  "operations_admin",
  "finance",
  "direct_manager",
];

const DEPT_VARIANT: Record<ClearanceDept, BadgeVariant> = {
  it: "gray",
  operations_admin: "blue",
  finance: "purple",
  direct_manager: "green",
};

export function OffboardingCaseClient({
  offboardingCase,
  projectName,
}: {
  offboardingCase: OffboardingCase;
  projectName: string;
}) {
  const locale = useLocale();
  const t = useTranslations("offboarding");
  const tRoles = useTranslations("roles");

  const [clearance, setClearance] = useState<ClearanceItem[]>(
    offboardingCase.clearance
  );
  const [accessRevoked, setAccessRevoked] = useState(
    offboardingCase.access_revoked
  );
  const [handoverApproved, setHandoverApproved] = useState(
    offboardingCase.handover_approved
  );
  const [exitInterviewDone, setExitInterviewDone] = useState(
    offboardingCase.exit_interview_done
  );
  const [siFormFiled, setSiFormFiled] = useState(
    offboardingCase.si_form6_filed
  );
  const [financeApproved, setFinanceApproved] = useState(
    offboardingCase.settlement.finance_approved
  );
  const [originalsReturned, setOriginalsReturned] = useState(
    offboardingCase.originals_returned
  );
  const [archived, setArchived] = useState(
    offboardingCase.status === "archived"
  );

  const name =
    locale === "ar"
      ? offboardingCase.employee_name_ar
      : offboardingCase.employee_name_en;
  const jobTitle =
    locale === "ar"
      ? offboardingCase.job_title_ar
      : offboardingCase.job_title_en;

  const clearanceComplete = useMemo(
    () => clearance.every((i) => i.status === "cleared"),
    [clearance]
  );

  /** Live stage status, mirroring stageProgress() on local state. */
  const stageDone: Record<OffboardingStage, boolean> = {
    1: true,
    2: accessRevoked,
    3: handoverApproved,
    4: clearanceComplete,
    5: exitInterviewDone && siFormFiled && financeApproved,
    6: originalsReturned && archived,
  };
  const currentStage =
    (STAGES.find((s) => !stageDone[s]) ?? 6) as OffboardingStage;

  const s = offboardingCase.settlement;

  function cycleClearance(id: string) {
    if (archived) return;
    setClearance((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "cleared" ? "pending" : "cleared",
            }
          : item
      )
    );
  }

  const settlementRows: {
    label: string;
    value: number;
    sign: "+" | "-";
    note?: string;
  }[] = [
    { label: t("settlement.lastSalary"), value: s.last_salary, sign: "+" },
    {
      label: t("settlement.leaveEncashment", {
        days: s.unused_leave_days,
        rate: formatNumber(s.daily_rate, locale),
      }),
      value: s.leave_encashment,
      sign: "+",
    },
    ...(s.other_dues > 0
      ? [
          {
            label: t("settlement.otherDues"),
            value: s.other_dues,
            sign: "+" as const,
          },
        ]
      : []),
    {
      label: t("settlement.deductions"),
      value: s.deductions,
      sign: "-",
      note: locale === "ar" ? s.deduction_note_ar : s.deduction_note_en,
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Link
          href="/offboarding"
          className="text-[12.5px] font-semibold text-muted hover:text-ink"
        >
          ← {t("notFound.back")}
        </Link>
      </div>

      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold">{name}</h1>
          <p className="text-[12.5px] text-muted">
            {offboardingCase.case_code} · {jobTitle} · {projectName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={offboardingCase.priority === "P0" ? "red" : "blue"}>
            {offboardingCase.priority}
          </Badge>
          <Badge variant="gray">{t(`reasons.${offboardingCase.reason}`)}</Badge>
          {archived ? (
            <Badge variant="green">{t("statuses.archived")}</Badge>
          ) : (
            <Badge variant="purple">{t("statuses.settlement")}</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-4">
          {/* 6-stage stepper */}
          <Card title={`📦 ${t("workflow")}`}>
            <ol className="space-y-2">
              {STAGES.map((stage) => {
                const done = stageDone[stage];
                const active = stage === currentStage && !done;
                return (
                  <li key={stage} className="flex items-center gap-3">
                    <span
                      className={[
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                        done
                          ? "bg-green text-white"
                          : active
                            ? "bg-primary text-white"
                            : "bg-[#e3e8f0] text-muted",
                      ].join(" ")}
                    >
                      {done ? "✓" : stage}
                    </span>
                    <span
                      className={[
                        "text-[12.5px]",
                        done
                          ? "text-muted line-through"
                          : active
                            ? "font-semibold text-ink"
                            : "text-muted",
                      ].join(" ")}
                    >
                      {t(`stages.${stage}`)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Stage 4 — Clearance matrix */}
          <Card title={`✅ ${t("clearance.title")}`}>
            <p className="mb-3 text-[11.5px] text-muted">
              {t("clearance.subtitle")}
            </p>
            <div className="space-y-3">
              {DEPT_ORDER.map((dept) => {
                const items = clearance.filter((i) => i.dept === dept);
                if (items.length === 0) return null;
                return (
                  <div key={dept}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Badge variant={DEPT_VARIANT[dept]}>
                        {tRoles(dept)}
                      </Badge>
                    </div>
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-page"
                        >
                          <button
                            onClick={() => cycleClearance(item.id)}
                            disabled={archived || item.status === "blocked"}
                            className="flex items-center gap-2.5 text-start disabled:cursor-default"
                          >
                            <span
                              className={[
                                "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border text-[11px]",
                                item.status === "cleared"
                                  ? "border-green bg-green text-white"
                                  : item.status === "blocked"
                                    ? "border-red bg-red text-white"
                                    : "border-line text-transparent",
                              ].join(" ")}
                            >
                              {item.status === "cleared"
                                ? "✓"
                                : item.status === "blocked"
                                  ? "!"
                                  : ""}
                            </span>
                            <span
                              className={[
                                "text-[12.5px]",
                                item.status === "cleared"
                                  ? "text-green"
                                  : item.status === "blocked"
                                    ? "text-red"
                                    : "text-ink",
                              ].join(" ")}
                            >
                              {locale === "ar" ? item.label_ar : item.label_en}
                            </span>
                          </button>
                          {item.status === "blocked" && (
                            <Badge variant="red">
                              {t("clearance.blocked")}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 border-t border-line pt-3">
              {clearanceComplete ? (
                <Alert variant="green">{t("clearance.complete")}</Alert>
              ) : (
                <p className="text-[11.5px] text-muted">
                  {t("clearance.incomplete")}
                </p>
              )}
            </div>
          </Card>

          {/* Stage 5 — Final settlement */}
          <Card title={`💰 ${t("settlement.title")}`}>
            <p className="mb-3 text-[11.5px] text-muted">
              {t("settlement.subtitle")}
            </p>
            <dl className="space-y-1.5 text-[12.5px]">
              {settlementRows.map((row, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 border-b border-line/60 pb-1.5"
                >
                  <dt className="text-muted">
                    {row.label}
                    {row.note && (
                      <span className="block text-[11px] text-muted/80">
                        {row.note}
                      </span>
                    )}
                  </dt>
                  <dd
                    className={[
                      "shrink-0 font-semibold tabular-nums",
                      row.sign === "-" ? "text-red" : "text-ink",
                    ].join(" ")}
                  >
                    {row.sign === "-" ? "−" : "+"}
                    {formatNumber(row.value, locale)}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 pt-1.5">
                <dt className="text-[13px] font-extrabold">
                  {t("settlement.net")}
                </dt>
                <dd className="text-[16px] font-extrabold tabular-nums text-green">
                  {formatNumber(s.net_settlement, locale)} {t("egp")}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-line pt-4">
              {financeApproved ? (
                <Alert variant="green">{t("settlement.approved")}</Alert>
              ) : clearanceComplete ? (
                <button
                  onClick={() => setFinanceApproved(true)}
                  className="w-full rounded-xl bg-primary py-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  {t("settlement.approveBtn")}
                </button>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-xl bg-[#e3e8f0] py-3 text-[14px] font-extrabold text-muted"
                  >
                    {t("settlement.approveBtn")}
                  </button>
                  <p className="mt-2 text-[11.5px] text-muted">
                    {t("settlement.gateNote")}
                  </p>
                </>
              )}
            </div>
            <p className="mt-3 text-[11px] text-muted">
              {t("settlement.policyNote")}
            </p>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          {/* Case info */}
          <Card title={t("info.title")}>
            <dl className="space-y-1.5 text-[12px]">
              {(
                [
                  { label: t("info.hrCode"), value: offboardingCase.hr_code },
                  {
                    label: t("info.reason"),
                    value: t(`reasons.${offboardingCase.reason}`),
                  },
                  {
                    label: t("info.initiated"),
                    value: formatDate(offboardingCase.initiated_at, locale),
                  },
                  {
                    label: t("info.lwd"),
                    value: formatDate(
                      offboardingCase.last_working_day,
                      locale
                    ),
                  },
                  { label: t("info.project"), value: projectName },
                ] as const
              ).map((field, i) => (
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

          {/* Stage 2 & 3 — access + handover */}
          <Card title={`🔒 ${t("access.title")}`}>
            <p className="mb-3 text-[11.5px] text-muted">
              {t("access.rule", {
                lwd: formatDate(offboardingCase.last_working_day, locale),
              })}
            </p>
            <ToggleRow
              label={t("access.revoked")}
              on={accessRevoked}
              disabled={archived}
              onToggle={() => setAccessRevoked((v) => !v)}
            />
            <ToggleRow
              label={t("access.handover")}
              on={handoverApproved}
              disabled={archived}
              onToggle={() => setHandoverApproved((v) => !v)}
              ownerBadge={tRoles("direct_manager")}
            />
          </Card>

          {/* Stage 5 & 6 — closure + archiving */}
          <Card title={`🗄 ${t("closure.title")}`}>
            <div className="space-y-1">
              <ToggleRow
                label={t("closure.exitInterview")}
                on={exitInterviewDone}
                disabled={archived}
                onToggle={() => setExitInterviewDone((v) => !v)}
              />
              <ToggleRow
                label={t("closure.siForm6")}
                on={siFormFiled}
                disabled={archived}
                onToggle={() => setSiFormFiled((v) => !v)}
              />
              <ToggleRow
                label={t("closure.originals")}
                on={originalsReturned}
                disabled={archived}
                onToggle={() => setOriginalsReturned((v) => !v)}
              />
            </div>

            <div className="mt-4 border-t border-line pt-4">
              {archived ? (
                <Alert variant="green">{t("closure.archived")}</Alert>
              ) : financeApproved && originalsReturned ? (
                <button
                  onClick={() => setArchived(true)}
                  className="w-full rounded-xl bg-green py-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  {t("closure.archiveBtn")}
                </button>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-xl bg-[#e3e8f0] py-3 text-[14px] font-extrabold text-muted"
                  >
                    {t("closure.archiveBtn")}
                  </button>
                  <p className="mt-2 text-[11.5px] text-muted">
                    {t("closure.gateNote")}
                  </p>
                </>
              )}
            </div>
            <p className="mt-3 text-[11px] text-muted">
              {t("closure.policyNote")}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function ToggleRow({
  label,
  on,
  disabled,
  onToggle,
  ownerBadge,
}: {
  label: string;
  on: boolean;
  disabled?: boolean;
  onToggle: () => void;
  ownerBadge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-page">
      <button
        onClick={onToggle}
        disabled={disabled}
        className="flex items-center gap-2.5 text-start disabled:cursor-default"
      >
        <span
          className={[
            "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border text-[11px]",
            on
              ? "border-green bg-green text-white"
              : "border-line text-transparent",
          ].join(" ")}
        >
          {on ? "✓" : ""}
        </span>
        <span className={["text-[12.5px]", on ? "text-green" : "text-ink"].join(" ")}>
          {label}
        </span>
      </button>
      {ownerBadge && <Badge variant="green">{ownerBadge}</Badge>}
    </div>
  );
}
