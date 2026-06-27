"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

/** Topbar ع/EN toggle — keeps the current path and query string. */
export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchLocale = () => {
    const query = searchParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      locale: locale === "ar" ? "en" : "ar",
    });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("localeToggleLabel")}
      title={t("localeToggleLabel")}
      className="cursor-pointer rounded-full border border-line bg-card px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-soft"
    >
      {t("localeToggle")}
    </button>
  );
}
