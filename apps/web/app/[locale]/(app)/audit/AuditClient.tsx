"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import type { RlsAuditTable, PolicyComplianceItem, PenTestItem } from "@/lib/data/types";

type Tab = "rls" | "policies" | "pentest";

const RLS_VARIANT: Record<string, "green" | "red" | "yellow"> = {
  enabled: "green", missing: "red", partial: "yellow",
};
const IMPL_VARIANT: Record<string, "green" | "yellow" | "gray"> = {
  live: "green", scaffolded: "yellow", pending: "gray",
};
const CHECK_VARIANT: Record<string, "green" | "red" | "yellow" | "gray"> = {
  pass: "green", fail: "red", partial: "yellow", na: "gray",
};

interface Props {
  rlsTables: RlsAuditTable[];
  policies: PolicyComplianceItem[];
  penTests: PenTestItem[];
  locale: string;
}

export function AuditClient({ rlsTables, policies, penTests, locale }: Props) {
  const t = useTranslations("audit");
  const [tab, setTab] = useState<Tab>("rls");

  const rlsPass = rlsTables.filter((r) => r.status === "enabled").length;
  const policiesLive = policies.filter((p) => p.implementation_status === "live").length;
  const penPass = penTests.filter((p) => p.status === "pass").length;
  const penPartial = penTests.filter((p) => p.status === "partial").length;

  const categories = Array.from(new Set(penTests.map((p) => p.category)));

  return (
    <>
      <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={t("kpi.rlsTables")} value={`${rlsPass}/${rlsTables.length}`} tone="up" sub={<Badge variant="green">{t("kpi.enabled")}</Badge>} />
        <KpiCard label={t("kpi.policies")} value={`${policiesLive}/16`} tone="up" sub={<Badge variant="green">{t("kpi.live")}</Badge>} />
        <KpiCard label={t("kpi.penPass")} value={penPass} tone="up" sub={<Badge variant="green">{t("kpi.pass")}</Badge>} />
        <KpiCard label={t("kpi.penPartial")} value={penPartial} sub={<Badge variant="yellow">{t("kpi.partial")}</Badge>} />
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-line bg-page p-1">
        {(["rls", "policies", "pentest"] as Tab[]).map((tabKey) => (
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

      {/* RLS Tab */}
      {tab === "rls" && (
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[13px] font-semibold">{t("rls.title")}</p>
            <p className="text-[12px] text-muted">{t("rls.subtitle")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t("rls.col.table")}</th>
                  <th className="px-5 py-3">{t("rls.col.policies")}</th>
                  <th className="px-5 py-3">{t("rls.col.status")}</th>
                  <th className="px-5 py-3">{t("rls.col.note")}</th>
                </tr>
              </thead>
              <tbody>
                {rlsTables.map((row) => (
                  <tr key={row.table_name} className="border-b border-line last:border-b-0 hover:bg-page/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-medium">{row.table_name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.policies.map((p) => (
                          <Badge key={p} variant="gray">{p}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={RLS_VARIANT[row.status]}>{t(`rls.statuses.${row.status}`)}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted max-w-xs">
                      {locale === "ar" ? row.note_ar : row.note_en}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {tab === "policies" && (
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          <div className="border-b border-line px-5 py-3.5">
            <p className="text-[13px] font-semibold">{t("policies.title")}</p>
            <p className="text-[12px] text-muted">{t("policies.subtitle")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-page text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">{t("policies.col.title")}</th>
                  <th className="px-5 py-3">{t("policies.col.module")}</th>
                  <th className="px-5 py-3">{t("policies.col.status")}</th>
                  <th className="px-5 py-3">{t("policies.col.location")}</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((pol) => (
                  <tr key={pol.policy_number} className="border-b border-line last:border-b-0 hover:bg-page/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-muted">{pol.policy_number}</td>
                    <td className="px-5 py-3 font-medium">
                      {locale === "ar" ? pol.title_ar : pol.title_en}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="gray">{pol.module}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={IMPL_VARIANT[pol.implementation_status]}>
                        {t(`policies.statuses.${pol.implementation_status}`)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-muted font-mono max-w-xs">
                      {locale === "ar" ? pol.location_ar : pol.location_en}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pen Test Tab */}
      {tab === "pentest" && (
        <div className="space-y-4">
          {categories.map((cat) => {
            const items = penTests.filter((p) => p.category === cat);
            return (
              <div key={cat} className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
                <div className="border-b border-line bg-page px-5 py-2.5">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{cat}</p>
                </div>
                <table className="w-full border-collapse text-[12.5px]">
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-line last:border-b-0">
                        <td className="px-5 py-3 w-24">
                          <Badge variant={CHECK_VARIANT[item.status]}>{t(`pentest.statuses.${item.status}`)}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div>{locale === "ar" ? item.check_ar : item.check_en}</div>
                          {item.note_en && (
                            <div className="mt-0.5 text-[11px] text-muted">
                              {locale === "ar" ? item.note_ar : item.note_en}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
