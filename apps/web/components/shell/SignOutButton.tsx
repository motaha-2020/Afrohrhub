"use client";

import { useLocale, useTranslations } from "next-intl";
import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  const locale = useLocale();
  const t = useTranslations("common");

  return (
    <form action={signOut.bind(null, locale)}>
      <button
        type="submit"
        className="cursor-pointer text-lg leading-none text-muted hover:text-ink"
        aria-label={t("signOut")}
        title={t("signOut")}
      >
        ⏻
      </button>
    </form>
  );
}
