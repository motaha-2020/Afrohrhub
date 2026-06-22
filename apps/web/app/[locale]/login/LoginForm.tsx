"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signInAction, type SignInState } from "@/lib/auth/actions";

const field =
  "w-full rounded-[9px] border border-line bg-card px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted focus:outline-primary";

export function LoginForm() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInAction,
    {}
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={t("email")}
        className={field}
      />
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder={t("password")}
        className={field}
      />
      {state.error ? (
        <p className="text-[12.5px] font-semibold text-red">{t("error")}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[9px] bg-primary py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {pending ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
