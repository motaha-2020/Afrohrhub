import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { localeDir, routing } from "@/i18n/routing";
import { cairo, inter } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "AfroHR Hub",
  description:
    "Multi-tenant HR platform for construction companies — Core HR, Recruitment, Onboarding, Payroll.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} dir={localeDir(locale)}>
      <body className={`${cairo.variable} ${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
