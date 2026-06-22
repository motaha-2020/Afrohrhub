import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stepper, type Step } from "@/components/ui/Stepper";
import { Link } from "@/i18n/navigation";
import { getServerSession } from "@/lib/auth/session.server";
import { approvalRepository } from "@/lib/data";
import type { ApprovalEntityType, ApprovalRequest } from "@/lib/data/types";
import { hasAnyRole } from "@/lib/rbac/roles";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatNumber } from "@/lib/utils/format";

const ENTITY_TYPES: ApprovalEntityType[] = [
  "hiring_request",
  "payroll_adjustment",
  "final_settlement",
  "leave_request",
  "job_offer",
];

const ENTITY_ICON: Record<ApprovalEntityType, string> = {
  hiring_request: "🎯",
  job_offer: "📄",
  payroll_adjustment: "💰",
  final_settlement: "📦",
  leave_request: "🏖",
};

const ENTITY_BADGE: Record<ApprovalEntityType, BadgeVariant> = {
  hiring_request: "blue",
  job_offer: "purple",
  payroll_adjustment: "yellow",
  final_settlement: "gray",
  leave_request: "green",
};

const SLA_BADGE = {
  on_time: "green",
  due_soon: "yellow",
  overdue: "red",
} as const satisfies Record<ApprovalRequest["sla_state"], BadgeVariant>;

type Translator = (
  key: string,
  values?: Record<string, string | number>
) => string;

/** Reads the locale-suffixed variant (`<field>_ar` / `<field>_en`) of a row. */
function pickAr<T>(row: T, field: string, locale: string): string {
  const key = `${field}_${locale === "ar" ? "ar" : "en"}` as keyof T;
  return String(row[key] ?? "");
}

/** Maps an approval chain to the shared horizontal Stepper. */
function chainSteps(req: ApprovalRequest, locale: string): Step[] {
  return req.steps.map((step) => ({
    label: pickAr(step, "approver_label", locale),
    state:
      step.decision !== null
        ? "done"
        : step.step_order === req.current_step
          ? "current"
          : "upcoming",
  }));
}

function ApprovalCard({
  req,
  locale,
  canAct,
  t,
  egp,
}: {
  req: ApprovalRequest;
  locale: string;
  canAct: boolean;
  t: Translator;
  egp: string;
}) {
  const decided = req.steps.filter((s) => s.decision !== null);
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none" aria-hidden>
            {ENTITY_ICON[req.entity_type]}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14.5px] font-bold">
                {pickAr(req, "title", locale)}
              </h3>
              <Badge variant={ENTITY_BADGE[req.entity_type]}>
                {t(`types.${req.entity_type}`)}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {t("requestedBy", {
                name: pickAr(req, "requested_by_name", locale),
              })}{" "}
              · {formatDate(req.requested_at, locale)}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-end">
          <Badge variant={SLA_BADGE[req.sla_state]}>
            {pickAr(req, "sla_label", locale)}
          </Badge>
          {req.amount != null ? (
            <span className="text-[13px] font-bold">
              {formatNumber(req.amount, locale)} {egp}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="mt-3.5 grid gap-x-6 gap-y-1.5 border-t border-dashed border-line pt-3 text-[12.5px] sm:grid-cols-2">
        {req.summary.map((line) => (
          <div
            key={line.label_en}
            className="flex justify-between gap-3 sm:block"
          >
            <dt className="text-muted">{pickAr(line, "label", locale)}</dt>
            <dd className="font-semibold">{pickAr(line, "value", locale)}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3.5 mb-0.5 text-[11.5px] font-bold text-muted">
        {t("chainTitle")}
      </p>
      <Stepper steps={chainSteps(req, locale)} />

      {decided.length > 0 ? (
        <ul className="mb-1 space-y-1 text-[11.5px] text-muted">
          {decided.map((step) => (
            <li key={step.step_order}>
              <span className="font-semibold text-green">✓ </span>
              {pickAr(step, "approver_label", locale)} —{" "}
              {t("stepBy", {
                name: step.actor_name_ar
                  ? pickAr(step, "actor_name", locale)
                  : "",
                date: step.at ? formatDate(step.at, locale) : "",
              })}
              {step.comment_ar ? (
                <span className="block ps-4 italic">
                  “{pickAr(step, "comment", locale)}”
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {canAct ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
          <Button size="sm">{t("approve")}</Button>
          <Button size="sm" variant="outline">
            {t("return")}
          </Button>
          <Button size="sm" variant="danger">
            {t("reject")}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export default async function ApprovalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("approvals");
  const tCommon = await getTranslations("common");
  const egp = tCommon("egp");
  const { session } = await getServerSession();

  const activeType = ENTITY_TYPES.find((e) => e === sp.type);
  const requests = await approvalRepository.listPending({
    entity_type: activeType,
  });

  const mine = requests.filter((r) =>
    hasAnyRole(session.roles, r.awaiting_roles)
  );
  const others = requests.filter(
    (r) => !hasAnyRole(session.roles, r.awaiting_roles)
  );

  const tabs: { key: string; label: string; type?: ApprovalEntityType }[] = [
    { key: "all", label: t("tabAll") },
    ...ENTITY_TYPES.map((type) => ({
      key: type,
      label: t(`types.${type}`),
      type,
    })),
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">
          {t("subtitle", { mine: mine.length, total: requests.length })}
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = (tab.type ?? undefined) === activeType;
          return (
            <Link
              key={tab.key}
              href={tab.type ? `/approvals?type=${tab.type}` : "/approvals"}
              className={cn(
                "rounded-full border px-3.5 py-[5px] text-xs font-bold transition-colors",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-card text-muted hover:border-primary hover:text-primary"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <Card>
          <EmptyState
            icon="✅"
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {mine.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[13px] font-bold text-muted">
                {t("mineSection")} · {mine.length}
              </h2>
              {mine.map((req) => (
                <ApprovalCard
                  key={req.id}
                  req={req}
                  locale={locale}
                  canAct
                  t={t}
                  egp={egp}
                />
              ))}
            </section>
          ) : null}

          {others.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-[13px] font-bold text-muted">
                {t("othersSection")} · {others.length}
              </h2>
              {others.map((req) => (
                <ApprovalCard
                  key={req.id}
                  req={req}
                  locale={locale}
                  canAct={false}
                  t={t}
                  egp={egp}
                />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
