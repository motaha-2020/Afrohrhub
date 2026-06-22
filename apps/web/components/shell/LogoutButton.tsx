"use client";

import { useLocale, useTranslations } from "next-intl";
import { signOutAction } from "@/lib/auth/actions";

/** Sign-out control (auth mode only). Posts the server action. */
export function LogoutButton() {
  const locale = useLocale();
  const t = useTranslations("auth");
  return (
    <form action={signOutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        title={t("signOut")}
        aria-label={t("signOut")}
        className="flex size-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-red hover:text-red"
      >
        ⎋
      </button>
    </form>
  );
}
