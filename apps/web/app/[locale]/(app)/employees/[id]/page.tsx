import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusChip } from "@/components/ui/StatusChip";
import { CompensationTab } from "@/components/profile/CompensationTab";
import { DocumentsTab } from "@/components/profile/DocumentsTab";
import { HseTab } from "@/components/profile/HseTab";
import { ProjectsTab } from "@/components/profile/ProjectsTab";
import { TimelineTab } from "@/components/profile/TimelineTab";
import { getServerSession } from "@/lib/auth/session.server";
import { employeeRepository, listDocumentTypes } from "@/lib/data";
import { avatarColor, initials, localizedName } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const TAB_KEYS = [
  "documents",
  "timeline",
  "compensation",
  "projects",
  "hse",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

export default async function EmployeeProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
  const t = await getTranslations("profile");
  const { session } = await getServerSession();
  if (!session) return null; // the (app) layout already redirects unauthenticated users

  const item = await employeeRepository.getListItem(id);
  if (!item) {
    return (
      <EmptyState
        icon="🪪"
        title={t("notFound.title")}
        description={t("notFound.description")}
        action={
          <Link href="/employees" className="text-sm font-bold text-primary">
            {t("notFound.back")}
          </Link>
        }
      />
    );
  }

  const { employee } = item;
  const [allocations, documentTypes] = await Promise.all([
    employeeRepository.getAllocations(employee.id),
    listDocumentTypes(),
  ]);
  const manager = employee.direct_manager_id
    ? await employeeRepository.getById(employee.direct_manager_id)
    : null;

  const activeTab: TabKey = TAB_KEYS.find((k) => k === sp.tab) ?? "documents";
  const name = localizedName(employee, locale);
  const allocationSummary = allocations
    .map((a) => `${localizedName(a.project, locale)} (${a.allocation_pct}%)`)
    .join(" + ");

  const headerMeta = [
    localizedName(item.job_title, locale),
    item.grade ? t("grade", { grade: item.grade.code }) : null,
    employee.hr_code,
    allocationSummary || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const contactLine = [
    `📞 ${employee.mobile}`,
    employee.work_email ? `✉️ ${employee.work_email}` : null,
    manager
      ? t("manager", { name: localizedName(manager, locale) })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "documents", label: t("tabs.documents", { count: documentTypes.length }) },
    { key: "timeline", label: t("tabs.timeline") },
    { key: "compensation", label: t("tabs.compensation") },
    { key: "projects", label: t("tabs.projects") },
    { key: "hse", label: t("tabs.hse") },
  ];

  return (
    <>
      {/* Header card */}
      <div className="mb-[18px] flex flex-wrap items-center gap-[18px] rounded-card border border-line bg-card p-[18px] shadow-card">
        <div
          className="flex size-[72px] items-center justify-center rounded-[18px] text-2xl font-extrabold text-white"
          style={{ background: avatarColor(employee.id) }}
        >
          {initials(name)}
        </div>
        <div className="min-w-[220px] flex-1">
          <h1 className="flex items-center gap-2 text-[19px] font-bold">
            {name} <StatusChip status={employee.status} />
          </h1>
          <p className="text-[12.5px] text-muted">{headerMeta}</p>
          <p className="mt-1 text-xs">{contactLine}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            {t("newAction")}
          </Button>
          <Button size="sm">{t("hrLetters")}</Button>
        </div>
      </div>

      {/* Tab navigation (searchParam-driven) */}
      <nav className="mb-[18px] flex gap-1 overflow-x-auto border-b-2 border-line">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={{
              pathname: `/employees/${employee.id}`,
              query: tab.key === "documents" ? undefined : { tab: tab.key },
            }}
            className={cn(
              "-mb-0.5 whitespace-nowrap border-b-[3px] border-transparent px-4 py-2.5 text-[13px] font-semibold text-muted",
              activeTab === tab.key && "border-primary font-extrabold text-primary"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {activeTab === "documents" ? (
        <DocumentsTab employeeId={employee.id} locale={locale} />
      ) : null}
      {activeTab === "timeline" ? (
        <TimelineTab employeeId={employee.id} locale={locale} />
      ) : null}
      {activeTab === "compensation" ? (
        <CompensationTab
          employee={employee}
          locale={locale}
          roles={session.roles}
        />
      ) : null}
      {activeTab === "projects" ? (
        <ProjectsTab employeeId={employee.id} locale={locale} />
      ) : null}
      {activeTab === "hse" ? (
        <HseTab employeeId={employee.id} locale={locale} />
      ) : null}
    </>
  );
}
