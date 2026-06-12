"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navForRoles } from "@/lib/rbac/nav";
import { useSession } from "@/lib/auth/session";
import { localizedName } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** Fixed sidebar — items filtered by the current (mock) session roles. */
export function Sidebar() {
  const { session } = useSession();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const sections = navForRoles(session.roles);

  return (
    <aside className="fixed inset-y-0 start-0 z-50 w-[248px] overflow-y-auto bg-sidebar text-sidebar-text">
      <div className="flex items-center gap-2.5 border-b border-sidebar-line px-5 py-[18px]">
        <div className="flex size-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2563eb] to-purple text-base font-extrabold text-white">
          A
        </div>
        <div>
          <b className="text-base text-white">{tCommon("appName")}</b>
          <small className="block text-[10px] text-[#8da2c8]">
            {localizedName(session.tenant, locale)}
          </small>
        </div>
      </div>
      <nav>
        {sections.map((section) => (
          <div key={section.key}>
            <div className="px-5 pb-1 pt-3.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted">
              {t(`sections.${section.labelKey}`)}
            </div>
            {section.items.map((item) => {
              const label = (
                <>
                  <span className="w-5 text-center text-[15px]" aria-hidden>
                    {item.icon}
                  </span>
                  {t(`items.${item.labelKey}`)}
                </>
              );
              if (!item.enabled) {
                return (
                  <span
                    key={item.key}
                    className="flex cursor-not-allowed items-center gap-2.5 border-s-[3px] border-transparent px-5 py-[9px] text-[13.5px] opacity-45"
                  >
                    {label}
                    <span className="ms-auto rounded-full bg-sidebar-hover px-2 text-[10px] font-bold text-sidebar-muted">
                      {t("soon")}
                    </span>
                  </span>
                );
              }
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 border-s-[3px] border-transparent px-5 py-[9px] text-[13.5px] hover:bg-sidebar-hover",
                    active &&
                      "border-s-[#4f8df9] bg-sidebar-hover font-bold text-white"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
