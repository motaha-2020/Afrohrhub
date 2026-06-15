"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  ChannelDeliveryStat,
  NotificationChannel,
  NotificationTemplate,
  TemplateRegistrationStatus,
} from "@/lib/data/types";
import { formatNumber } from "@/lib/utils/format";

const CHANNEL_ICON: Record<NotificationChannel, string> = {
  in_app: "🔔",
  email: "✉️",
  whatsapp: "🟢",
  sms: "📱",
};

const CHANNEL_VARIANT: Record<NotificationChannel, BadgeVariant> = {
  in_app: "gray",
  email: "blue",
  whatsapp: "green",
  sms: "purple",
};

const REG_VARIANT: Record<TemplateRegistrationStatus, BadgeVariant> = {
  approved: "green",
  pending: "yellow",
  not_required: "gray",
};

/** Sample values to render a realistic preview of the interpolated body. */
const SAMPLE: Record<string, string> = {
  employee_name: "محمود النجار / Mahmoud El-Naggar",
  candidate_name: "سيد عبد العاطي / Sayed Abdel Aty",
  month: "June 2026",
  leave_type: "Annual",
  start_date: "20/06/2026",
  end_date: "24/06/2026",
  balance: "9",
  document_name: "Driving License",
  days_left: "12",
  expiry_date: "10/07/2026",
  last_working_day: "19/06/2026",
  subject: "Final Settlement — Khaled Mansour",
  sla_hours: "2",
  job_title: "Argon Welder",
  offer_link: "https://afrohr.app/offer/ramadan-7k2x9",
  task_title: "Issue PPE kit",
  owner_role: "Operations & Admin",
  due_date: "18/06/2026",
};

function interpolate(body: string): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE[key] ?? `{{${key}}}`);
}

export function NotificationTemplatesClient({
  templates,
  stats,
}: {
  templates: NotificationTemplate[];
  stats: ChannelDeliveryStat[];
}) {
  const locale = useLocale();
  const t = useTranslations("notificationTemplates");

  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const selected = templates.find((tpl) => tpl.id === selectedId) ?? null;

  const grouped = useMemo(() => {
    return templates.reduce<Record<string, NotificationTemplate[]>>(
      (acc, tpl) => {
        (acc[tpl.module] ??= []).push(tpl);
        return acc;
      },
      {}
    );
  }, [templates]);

  const bodyKey = selected ? `${selected.id}.${locale}` : "";
  const currentBody = selected
    ? (bodies[bodyKey] ??
      (locale === "ar" ? selected.body_ar : selected.body_en))
    : "";

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      {/* Channels overview */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((st) => {
          const rate =
            st.sent > 0 ? Math.round((st.delivered / st.sent) * 100) : 100;
          return (
            <div
              key={st.channel}
              className="rounded-2xl border border-line bg-card p-4 shadow-sm"
            >
              <p className="text-[11.5px] text-muted">
                {CHANNEL_ICON[st.channel]} {t(`channels.${st.channel}`)}
              </p>
              <p className="mt-1 text-[20px] font-extrabold">{rate}%</p>
              <p className="text-[11px] text-muted">
                {t("delivered")}: {formatNumber(st.delivered, locale)} ·{" "}
                <span className={st.failed > 0 ? "text-red" : ""}>
                  {t("failed")}: {st.failed}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <Alert variant="yellow" className="mb-4">
        {t("phase2Note")}
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Template list */}
        <Card title={t("catalog")} className="self-start">
          <div className="space-y-3">
            {Object.entries(grouped).map(([module, tpls]) => (
              <div key={module}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t(`modules.${module}`)}
                </p>
                <ul className="space-y-1">
                  {tpls.map((tpl) => {
                    const active = tpl.id === selectedId;
                    return (
                      <li key={tpl.id}>
                        <button
                          onClick={() => {
                            setSelectedId(tpl.id);
                            setSaved(false);
                          }}
                          className={[
                            "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-start text-[12px] transition-colors",
                            active
                              ? "bg-blue-soft text-primary"
                              : "hover:bg-page",
                          ].join(" ")}
                        >
                          <span className="truncate">
                            {locale === "ar" ? tpl.name_ar : tpl.name_en}
                          </span>
                          <span className="shrink-0">
                            {CHANNEL_ICON[tpl.channel]}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Editor */}
        {selected && (
          <Card>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-bold">
                  {locale === "ar" ? selected.name_ar : selected.name_en}
                </h2>
                <p className="text-[11.5px] text-muted">
                  {selected.event_key}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={CHANNEL_VARIANT[selected.channel]}>
                  {CHANNEL_ICON[selected.channel]} {t(`channels.${selected.channel}`)}
                </Badge>
                {selected.critical && (
                  <Badge variant="red">{t("critical")}</Badge>
                )}
                <Badge variant={selected.active ? "green" : "gray"}>
                  {selected.active ? t("active") : t("inactive")}
                </Badge>
              </div>
            </div>

            {selected.channel === "whatsapp" && (
              <div className="mb-3 flex items-center gap-2 text-[11.5px]">
                <span className="text-muted">{t("metaRegistration")}:</span>
                <Badge variant={REG_VARIANT[selected.registration_status]}>
                  {t(`registration.${selected.registration_status}`)}
                </Badge>
              </div>
            )}

            {/* Variable chips */}
            <p className="mb-1.5 text-[11.5px] font-semibold">
              {t("variables")}
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {selected.variables.map((v) => (
                <code
                  key={v}
                  className="rounded-md bg-page px-2 py-0.5 text-[11px] text-primary"
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </div>

            {/* Editable body (active locale) */}
            <label className="mb-1 block text-[11.5px] font-semibold">
              {t("body")} ({locale === "ar" ? "العربية" : "English"})
            </label>
            <textarea
              value={currentBody}
              onChange={(e) => {
                setBodies((prev) => ({ ...prev, [bodyKey]: e.target.value }));
                setSaved(false);
              }}
              rows={4}
              dir={locale === "ar" ? "rtl" : "ltr"}
              className="w-full rounded-lg border border-line bg-page p-3 text-[12.5px] leading-relaxed"
            />

            {/* Live preview */}
            <p className="mb-1.5 mt-3 text-[11.5px] font-semibold">
              {t("preview")}
            </p>
            <div
              className="rounded-xl border border-line bg-green-soft/40 p-3 text-[12.5px] leading-relaxed"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              {interpolate(currentBody)}
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              <button
                onClick={() => setSaved(true)}
                className="rounded-xl bg-primary px-5 py-2.5 text-[13px] font-extrabold text-white hover:opacity-90"
              >
                {t("save")}
              </button>
              {saved && (
                <span className="text-[12.5px] font-semibold text-green">
                  ✓ {t("savedNote")}
                </span>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
