import { defineRouting } from "next-intl/routing";

/**
 * Locale routing config — Arabic is the default and primary locale (RTL),
 * English is secondary (LTR). See docs/01-architecture.md (i18n / RTL).
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
});

export type Locale = (typeof routing.locales)[number];

export const localeDir = (locale: string): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";
