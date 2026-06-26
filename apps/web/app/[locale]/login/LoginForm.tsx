"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/auth/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "…" : label}
    </Button>
  );
}

export function LoginForm({
  locale,
  next,
}: {
  locale: string;
  next?: string;
}) {
  const t = useTranslations("login");
  const [state, formAction] = useActionState(signIn, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="flex flex-col gap-1 text-[12.5px] font-bold">
        {t("email")}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          className="rounded-[9px] border border-line bg-card px-3 py-2.5 text-[13px] font-normal outline-none focus:border-primary"
          placeholder="hrm@afrohr.test"
        />
      </label>

      <label className="flex flex-col gap-1 text-[12.5px] font-bold">
        {t("password")}
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className="rounded-[9px] border border-line bg-card px-3 py-2.5 text-[13px] font-normal outline-none focus:border-primary"
        />
      </label>

      {state.error ? (
        <p className="text-[12.5px] font-bold text-red">
          {state.error === "missing" ? t("errorMissing") : t("errorInvalid")}
        </p>
      ) : null}

      <SubmitButton label={t("submit")} />
    </form>
  );
}
