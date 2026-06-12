import { getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { employeeRepository } from "@/lib/data";
import type { AllocationWithProject } from "@/lib/data/repository";
import { formatDate, localizedName } from "@/lib/utils/format";

/** Cost allocation tab — active allocations must total 100% (Policy 12). */
export async function ProjectsTab({
  employeeId,
  locale,
}: {
  employeeId: string;
  locale: string;
}) {
  const t = await getTranslations("profile.projects");
  const allocations = await employeeRepository.getAllocations(employeeId);
  const total = allocations.reduce((sum, a) => sum + a.allocation_pct, 0);

  const columns: DataTableColumn<AllocationWithProject>[] = [
    {
      key: "project",
      header: t("columns.project"),
      cell: (a) => localizedName(a.project, locale),
    },
    { key: "code", header: t("columns.code"), cell: (a) => a.project.code },
    {
      key: "share",
      header: t("columns.share"),
      cell: (a) => <b>{a.allocation_pct}%</b>,
    },
    {
      key: "location",
      header: t("columns.location"),
      cell: (a) =>
        a.work_location ? localizedName(a.work_location, locale) : "—",
    },
    {
      key: "since",
      header: t("columns.since"),
      cell: (a) => formatDate(a.start_date, locale),
    },
  ];

  return (
    <Card title={t("title")}>
      <DataTable
        columns={columns}
        rows={allocations}
        rowKey={(a) => a.id}
        empty={
          <EmptyState
            icon="🏗"
            title={t("empty.title")}
            description={t("empty.description")}
          />
        }
      />
      {allocations.length > 0 ? (
        <Alert variant={total === 100 ? "green" : "red"} className="mt-3">
          {total === 100 ? t("totalOk") : t("totalBad", { total })}
        </Alert>
      ) : null}
    </Card>
  );
}
