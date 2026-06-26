import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Stepper, type Step } from "@/components/ui/Stepper";
import {
  ONBOARDING_CASES,
  ONBOARDING_KPIS,
  ONBOARDING_STAGE_LABELS,
  type OnboardingCase,
  type SlaTone,
} from "@/lib/data/mock/modules";
import { avatarColor, initials } from "@/lib/utils/format";

const SLA_VARIANT: Record<SlaTone, BadgeVariant> = {
  ok: "green",
  warn: "yellow",
  breach: "red",
};

function buildSteps(c: OnboardingCase, locale: string): Step[] {
  return ONBOARDING_STAGE_LABELS.map((label, i) => {
    const n = i + 1;
    return {
      label: locale === "ar" ? label.ar : label.en,
      state: n < c.stage ? "done" : n === c.stage ? "current" : "upcoming",
    };
  });
}

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("onboarding");
  const ar = locale === "ar";

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Button>{t("newCase")}</Button>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.inProgress")} value={ONBOARDING_KPIS.in_progress} />
        <KpiCard
          label={t("kpi.readyToActivate")}
          value={ONBOARDING_KPIS.ready_to_activate}
          sub={t("kpi.readySub")}
          tone="up"
        />
        <KpiCard label={t("kpi.hsePending")} value={ONBOARDING_KPIS.hse_pending} />
        <KpiCard
          label={t("kpi.overdue")}
          value={ONBOARDING_KPIS.overdue}
          sub={t("kpi.overdueSub")}
          tone="down"
        />
      </div>

      <div className="flex flex-col gap-3.5">
        {ONBOARDING_CASES.map((c) => (
          <Card key={c.id}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2.5">
              <span className="flex items-center gap-2.5">
                <span
                  className="flex size-[38px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: avatarColor(c.id) }}
                >
                  {initials(ar ? c.name_ar : c.name_en)}
                </span>
                <span>
                  <b className="block text-[14.5px]">{ar ? c.name_ar : c.name_en}</b>
                  <small className="block text-[11.5px] text-muted">
                    {ar ? c.role_ar : c.role_en} · {c.id.toUpperCase()}
                  </small>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Badge variant={c.priority === "P0" ? "red" : "yellow"}>
                  {c.priority}
                </Badge>
                <Badge variant={SLA_VARIANT[c.sla_tone]}>
                  {t("slaDays", { n: c.sla_days_left })}
                </Badge>
                <Badge variant={c.conditions_met === 6 ? "green" : "gray"}>
                  {t("conditions", { met: c.conditions_met })}
                </Badge>
              </span>
            </div>

            <Stepper steps={buildSteps(c, locale)} />

            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-muted">
                {t("currentStage", {
                  n: c.stage,
                  label: ar ? c.stage_label_ar : c.stage_label_en,
                })}
              </span>
              <span className="flex gap-1.5">
                <Button size="sm" variant="outline">
                  {t("openCase")}
                </Button>
                {c.conditions_met === 6 ? (
                  <Button size="sm">{t("activate")}</Button>
                ) : null}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
