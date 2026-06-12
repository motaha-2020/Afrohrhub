import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusChip } from "@/components/ui/StatusChip";
import { employeeRepository, projectRepository } from "@/lib/data";
import type { EmployeeListItem } from "@/lib/data/repository";
import type { Collar, EmployeeStatus } from "@/lib/data/types";
import { DIRECTORY_COUNTS } from "@/lib/data/mock/dashboard";
import { LAST_WORKING_DAYS } from "@/lib/data/mock/seed";
import {
  avatarColor,
  formatDate,
  formatMonthYear,
  formatNumber,
  initials,
  localizedName,
} from "@/lib/utils/format";
import { EmployeeFilters } from "./EmployeeFilters";

const STATUS_VALUES: EmployeeStatus[] = [
  "pending",
  "active",
  "suspended",
  "offboarding",
  "archived",
];
const COLLAR_VALUES: Collar[] = ["white", "blue"];

function docBadge(
  item: EmployeeListItem,
  locale: string,
  t: Awaited<ReturnType<typeof getTranslations<"employees">>>
): { variant: BadgeVariant; text: string } {
  const d = item.documents;
  if (item.employee.status === "offboarding" && d.assets_to_return) {
    return {
      variant: "gray",
      text: t("assetsToReturn", { count: d.assets_to_return }),
    };
  }
  if (d.missing > 0) {
    return {
      variant: "red",
      text: t("docsMissing", {
        received: d.received,
        total: d.total,
        missing: d.missing,
      }),
    };
  }
  if (d.expiring_soon) {
    return {
      variant: d.expiring_soon.days_left <= 7 ? "red" : "yellow",
      text: t("docExpiring", {
        doc: localizedName(d.expiring_soon, locale),
        days: d.expiring_soon.days_left,
      }),
    };
  }
  return {
    variant: "green",
    text: t("docsComplete", { received: d.received, total: d.total }),
  };
}

export default async function EmployeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    project?: string;
    status?: string;
    collar?: string;
    q?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("employees");
  const tCollar = await getTranslations("collar");

  const status = STATUS_VALUES.find((s) => s === sp.status);
  const collar = COLLAR_VALUES.find((c) => c === sp.collar);
  const [items, projects] = await Promise.all([
    employeeRepository.list({
      project_id: sp.project || undefined,
      status,
      collar,
      q: sp.q || undefined,
    }),
    projectRepository.list(),
  ]);

  const subText = (item: EmployeeListItem) => {
    const { employee } = item;
    if (employee.status === "pending") return t("inOnboarding");
    const lastDay = LAST_WORKING_DAYS[employee.id];
    if (employee.status === "offboarding" && lastDay) {
      return t("lastDay", { date: formatDate(lastDay, locale) });
    }
    return t("joined", { date: formatMonthYear(employee.hire_date, locale) });
  };

  const columns: DataTableColumn<EmployeeListItem>[] = [
    {
      key: "employee",
      header: t("columns.employee"),
      cell: (item) => (
        <span className="flex items-center gap-2.5">
          <span
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: avatarColor(item.employee.id) }}
          >
            {initials(localizedName(item.employee, locale))}
          </span>
          <span>
            <b className="block">{localizedName(item.employee, locale)}</b>
            <small className="block text-[11px] text-muted">
              {subText(item)}
            </small>
          </span>
        </span>
      ),
    },
    {
      key: "hr_code",
      header: t("columns.hrCode"),
      cell: (item) => item.employee.hr_code,
    },
    {
      key: "job_title",
      header: t("columns.jobTitle"),
      cell: (item) => localizedName(item.job_title, locale),
    },
    {
      key: "project",
      header: t("columns.project"),
      cell: (item) =>
        item.project ? localizedName(item.project, locale) : "—",
    },
    {
      key: "collar",
      header: t("columns.type"),
      cell: (item) => (
        <Badge variant={item.employee.collar === "white" ? "blue" : "purple"}>
          {tCollar(item.employee.collar)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      cell: (item) => <StatusChip status={item.employee.status} />,
    },
    {
      key: "documents",
      header: t("columns.documents"),
      cell: (item) => {
        const badge = docBadge(item, locale, t);
        return <Badge variant={badge.variant}>{badge.text}</Badge>;
      },
    },
    {
      key: "actions",
      header: t("columns.actions"),
      cell: (item) => (
        <Link
          href={`/employees/${item.employee.id}`}
          className="text-xs font-bold text-primary"
        >
          {item.employee.status === "active" ? t("view") : t("case")}
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">
            {t("subtitle", {
              active: formatNumber(DIRECTORY_COUNTS.active, locale),
              pending: DIRECTORY_COUNTS.pending,
              offboarding: DIRECTORY_COUNTS.offboarding,
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">{t("import")}</Button>
          <Button>{t("new")}</Button>
        </div>
      </div>

      <EmployeeFilters
        projects={projects.map((p) => ({
          id: p.id,
          label: localizedName(p, locale),
        }))}
      />

      <Card flush>
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(item) => item.employee.id}
          empty={
            <EmptyState
              icon="👥"
              title={t("empty.title")}
              description={t("empty.description")}
            />
          }
        />
      </Card>

      <p className="mt-2 text-[11.5px] text-muted">
        {t("showing", {
          shown: items.length,
          total: formatNumber(DIRECTORY_COUNTS.active, locale),
        })}{" "}
        · {t("salaryNote")}
      </p>
    </>
  );
}
