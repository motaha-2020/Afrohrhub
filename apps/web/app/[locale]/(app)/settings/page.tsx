"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { Alert } from "@/components/ui/Alert";
import { ENV_VARS, PILOT_MILESTONES } from "@/lib/data/mock/deployment";

type Tab = "env" | "pilot";

const ENV_VARIANT: Record<string, "green" | "red" | "yellow"> = {
  set: "green", missing: "red", optional_missing: "yellow",
};

const MILESTONE_VARIANT: Record<string, "green" | "blue" | "gray" | "yellow"> = {
  done: "green", in_progress: "blue", pending: "gray", blocked: "yellow",
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const [tab, setTab] = useState<Tab>("env");

  const phase1 = ENV_VARS.filter((e) => e.phase === 1);
  const phase2 = ENV_VARS.filter((e) => e.phase === 2);
  const missingRequired = ENV_VARS.filter((e) => e.required && e.status === "missing").length;
  const done = PILOT_MILESTONES.filter((m) => m.status === "done").length;
  const inProgress = PILOT_MILESTONES.filter((m) => m.status === "in_progress").length;

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("kpi.envVars")} value={ENV_VARS.length} sub={<Badge variant="gray">{t("kpi.total")}</Badge>} />
        <KpiCard label={t("kpi.missing")} value={missingRequired} sub={<Badge variant="red">{t("kpi.required")}</Badge>} />
        <KpiCard label={t("kpi.milestones")} value={done} tone="up" sub={<Badge variant="green">{t("kpi.done")}</Badge>} />
        <KpiCard label={t("kpi.inProgress")} value={inProgress} sub={<Badge variant="blue">{t("kpi.active")}</Badge>} />
      </div>

      {missingRequired > 0 && (
        <div className="mb-5">
          <Alert variant="yellow">{t("envWarning", { count: missingRequired })}</Alert>
        </div>
      )}

      <div className="mb-5 flex gap-1 rounded-xl border border-line bg-page p-1">
        {(["env", "pilot"] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`flex-1 rounded-lg px-4 py-2 text-[12.5px] font-medium transition-colors ${
              tab === tabKey ? "bg-card shadow-sm font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            {t(`tabs.${tabKey}`)}
          </button>
        ))}
      </div>

      {tab === "env" && (
        <div className="space-y-4">
          {/* Phase 1 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line bg-page px-5 py-2.5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t("env.phase1")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">{t("env.col.key")}</th>
                    <th className="px-5 py-3">{t("env.col.description")}</th>
                    <th className="px-5 py-3">{t("env.col.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {phase1.map((env) => (
                    <tr key={env.key} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3 font-mono font-medium text-[12px]">{env.key}</td>
                      <td className="px-5 py-3 text-muted">{env.description_en}</td>
                      <td className="px-5 py-3">
                        <Badge variant={ENV_VARIANT[env.status]}>{t(`env.statuses.${env.status}`)}</Badge>
                        {env.required && <span className="ms-1 text-[10px] text-red-600">*</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line bg-page px-5 py-2.5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{t("env.phase2")}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">{t("env.col.key")}</th>
                    <th className="px-5 py-3">{t("env.col.description")}</th>
                    <th className="px-5 py-3">{t("env.col.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {phase2.map((env) => (
                    <tr key={env.key} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3 font-mono font-medium text-[12px]">{env.key}</td>
                      <td className="px-5 py-3 text-muted">{env.description_en}</td>
                      <td className="px-5 py-3">
                        <Badge variant={ENV_VARIANT[env.status]}>{t(`env.statuses.${env.status}`)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Alert variant="green">
            <span className="text-[12.5px]">{t("env.vercelNote")}</span>
          </Alert>
        </div>
      )}

      {tab === "pilot" && (
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[13px] font-semibold">{t("pilot.title")}</p>
            <p className="text-[12px] text-muted">{t("pilot.subtitle")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t("pilot.col.milestone")}</th>
                  <th className="px-5 py-3">{t("pilot.col.owner")}</th>
                  <th className="px-5 py-3">{t("pilot.col.due")}</th>
                  <th className="px-5 py-3">{t("pilot.col.status")}</th>
                </tr>
              </thead>
              <tbody>
                {PILOT_MILESTONES.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-b-0 hover:bg-page/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium">{m.title_en}</div>
                      {m.note_en && <div className="text-[11px] text-muted mt-0.5">{m.note_en}</div>}
                    </td>
                    <td className="px-5 py-3 text-muted">{m.owner_en}</td>
                    <td className="px-5 py-3 text-muted font-mono text-[12px]">{m.due_date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={MILESTONE_VARIANT[m.status]}>{t(`pilot.statuses.${m.status}`)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
