import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session.server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  const t = await getTranslations("login");

  if (await isAuthenticated()) {
    redirect(next || `/${locale}/dashboard`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="w-full max-w-[380px] rounded-[14px] border border-line bg-card p-7 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary text-[18px] font-bold text-white">
            A
          </div>
          <h1 className="text-[20px] font-bold">{t("title")}</h1>
          <p className="mt-1 text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>

        <LoginForm locale={locale} next={next} />

        <p className="mt-5 text-center text-[11.5px] text-muted">
          {t("demoHint")}
        </p>
      </div>
    </main>
  );
}
