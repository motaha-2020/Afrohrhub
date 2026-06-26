import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  PIPELINE_STAGES,
  CANDIDATES,
  RECRUITMENT_KPIS,
  type Candidate,
  type PipelineStageKey,
} from "@/lib/data/mock/modules";
import { avatarColor, initials } from "@/lib/utils/format";

const STAGE_VARIANT: Record<PipelineStageKey, BadgeVariant> = {
  request: "gray",
  sourcing: "blue",
  screening: "yellow",
  interview: "purple",
  offer: "green",
  handover: "green",
};

function matchVariant(pct: number): BadgeVariant {
  if (pct >= 90) return "green";
  if (pct >= 80) return "yellow";
  return "gray";
}

export default async function RecruitmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("recruitment");
  const ar = locale === "ar";

  const columns: DataTableColumn<Candidate>[] = [
    {
      key: "name",
      header: t("columns.candidate"),
      cell: (c) => (
        <span className="flex items-center gap-2.5">
          <span
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: avatarColor(c.id) }}
          >
            {initials(ar ? c.name_ar : c.name_en)}
          </span>
          <span>
            <b className="block">{ar ? c.name_ar : c.name_en}</b>
            <small className="block text-[11px] text-muted">
              {ar ? c.source_ar : c.source_en}
            </small>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: t("columns.role"),
      cell: (c) => ar ? c.role_ar : c.role_en,
    },
    {
      key: "project",
      header: t("columns.project"),
      cell: (c) => ar ? c.project_ar : c.project_en,
    },
    {
      key: "match",
      header: t("columns.match"),
      cell: (c) => <Badge variant={matchVariant(c.match_pct)}>{c.match_pct}%</Badge>,
    },
    {
      key: "stage",
      header: t("columns.stage"),
      cell: (c) => <Badge variant={STAGE_VARIANT[c.stage]}>{t(`stages.${c.stage}`)}</Badge>,
    },
    {
      key: "actions",
      header: t("columns.actions"),
      align: "end",
      cell: () => (
        <Button size="sm" variant="ghost">
          {t("view")}
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Button>{t("newRequest")}</Button>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <KpiCard label={t("kpi.openRequests")} value={RECRUITMENT_KPIS.open_requests} />
        <KpiCard label={t("kpi.activeCandidates")} value={RECRUITMENT_KPIS.active_candidates} />
        <KpiCard label={t("kpi.offersOut")} value={RECRUITMENT_KPIS.offers_out} />
        <KpiCard
          label={t("kpi.timeToHire")}
          value={t("days", { n: RECRUITMENT_KPIS.avg_time_to_hire_days })}
        />
      </div>

      <Card title={t("pipelineTitle")} className="mb-[18px]">
        <div className="flex gap-2.5 overflow-x-auto">
          {PIPELINE_STAGES.map((s) => (
            <div
              key={s.key}
              className="min-w-[120px] flex-1 rounded-[10px] border border-line bg-[#fafbfd] p-3 text-center"
            >
              <div className="text-[22px] font-extrabold">{s.count}</div>
              <div className="text-[11px] font-semibold text-muted">
                {ar ? s.name_ar : s.name_en}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card flush title={t("candidatesTitle")}>
        <DataTable columns={columns} rows={CANDIDATES} rowKey={(c) => c.id} />
      </Card>
    </>
  );
}
