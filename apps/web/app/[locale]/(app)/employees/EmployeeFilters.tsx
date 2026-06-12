"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

const STATUSES = [
  "active",
  "pending",
  "suspended",
  "offboarding",
  "archived",
] as const;
const COLLARS = ["white", "blue"] as const;

const selectClass =
  "rounded-[9px] border border-line bg-card px-3 py-2 text-[12.5px] text-ink";

/** Directory filters — write straight to searchParams (server refetches). */
export function EmployeeFilters({
  projects,
}: {
  projects: { id: string; label: string }[];
}) {
  const t = useTranslations("employees");
  const tStatus = useTranslations("status");
  const tCollar = useTranslations("collar");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2.5">
      <select
        className={selectClass}
        value={searchParams.get("project") ?? ""}
        onChange={(e) => setParam("project", e.target.value)}
      >
        <option value="">{t("filters.allProjects")}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={searchParams.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">{t("filters.allStatuses")}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {tStatus(s)}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={searchParams.get("collar") ?? ""}
        onChange={(e) => setParam("collar", e.target.value)}
      >
        <option value="">{t("filters.allCollars")}</option>
        {COLLARS.map((c) => (
          <option key={c} value={c}>
            {tCollar(c)}
          </option>
        ))}
      </select>
      <input
        className={`${selectClass} placeholder:text-muted`}
        placeholder={t("filters.search")}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => setParam("q", e.target.value.trim())}
      />
    </div>
  );
}
