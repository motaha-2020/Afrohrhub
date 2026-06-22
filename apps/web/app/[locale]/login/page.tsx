import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session.server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { Role } from "@/lib/rbac/roles";
import { demoSignInAction } from "@/lib/auth/actions";
import { LoginForm } from "./LoginForm";

/** Shared demo password for all seeded accounts (see supabase auth users). */
const DEMO_PASSWORD = "Afrohr#2026";

const DEMO_ACCOUNTS: { email: string; role: Role }[] = [
  { email: "mona.hr@afro.demo", role: "hr_manager" },
  { email: "admin@afro.demo", role: "company_admin" },
  { email: "heba.ta@afro.demo", role: "talent_acquisition" },
  { email: "mostafa.pers@afro.demo", role: "personnel" },
  { email: "nermin.pay@afro.demo", role: "payroll" },
  { email: "sherif.fin@afro.demo", role: "finance" },
  { email: "tarek.hse@afro.demo", role: "hse" },
  { email: "walid.pm@afro.demo", role: "direct_manager" },
  { email: "mahmoud.ess@afro.demo", role: "employee" },
];

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");
  const tRoles = await getTranslations("roles");

  // Already signed in (or dev mode) → go to the app.
  const { session } = await getServerSession();
  if (session) redirect(`/${locale}/dashboard`);

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-purple text-xl font-extrabold text-white">
            A
          </div>
          <h1 className="text-[19px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>

        <div className="rounded-card border border-line bg-card p-[22px] shadow-card">
          <LoginForm />
        </div>

        {isSupabaseConfigured ? (
          <div className="mt-5 rounded-card border border-line bg-card p-[18px] shadow-card">
            <p className="mb-1 text-[12.5px] font-bold">{t("demoTitle")}</p>
            <p className="mb-3 text-[11.5px] text-muted">
              {t("demoHint", { password: DEMO_PASSWORD })}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <form key={acc.email} action={demoSignInAction}>
                  <input type="hidden" name="email" value={acc.email} />
                  <input type="hidden" name="password" value={DEMO_PASSWORD} />
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    className="w-full rounded-[8px] border border-line px-2.5 py-1.5 text-[11.5px] font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft"
                  >
                    {tRoles(acc.role)}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
