"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "@/lib/auth/session";
import { initials, localizedName } from "@/lib/utils/format";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ViewAsSwitcher } from "./ViewAsSwitcher";

export function Topbar() {
  const { session, persona } = useSession();
  const t = useTranslations("common");
  const tRoles = useTranslations("roles");
  const locale = useLocale();
  const userName = localizedName(session.user, locale);

  return (
    <header className="sticky top-0 z-40 flex h-[60px] items-center gap-3.5 border-b border-line bg-card px-6">
      <input
        className="w-full max-w-[420px] flex-1 rounded-full border border-line bg-page px-4 py-2 text-[13px] text-ink placeholder:text-muted focus:outline-primary"
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
      />
      <ViewAsSwitcher />
      <div className="ms-auto flex items-center gap-3.5">
        <Suspense fallback={null}>
          <LocaleSwitcher />
        </Suspense>
        <span
          className="relative cursor-pointer text-lg"
          aria-label={t("notifications")}
          title={t("notifications")}
        >
          🔔
          <span className="absolute -top-1 -end-1.5 rounded-full bg-red px-[5px] py-px text-[9px] font-bold text-white">
            7
          </span>
        </span>
        <div className="text-end text-xs leading-tight">
          <b className="block text-[13px]">{userName}</b>
          {tRoles(persona.roles[0])}
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
          {initials(userName)}
        </div>
      </div>
    </header>
  );
}
