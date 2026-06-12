/** Formatting helpers — Egypt-style dates (dd/mm/yyyy), Western digits. */

const dateLocale = (locale: string) =>
  // `-u-nu-latn` keeps Western digits for Arabic (configurable per tenant later).
  locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB";

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatLongDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(
    locale === "ar" ? "ar-EG-u-nu-latn" : "en-EG"
  ).format(value);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.ceil(ms / 86_400_000);
}

/** Picks the localized variant of a bilingual (`name_ar`/`name_en`) entity. */
export function localizedName(
  entity: { name_ar: string; name_en: string },
  locale: string
): string {
  return locale === "ar" ? entity.name_ar : entity.name_en;
}

/** Localized initials for avatar chips (first letters of first two name parts). */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

/** Deterministic avatar color from an id (demo palette). */
const AVATAR_COLORS = [
  "#1a56db",
  "#7e3af2",
  "#0e9f6e",
  "#c27803",
  "#e02424",
  "#475569",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
