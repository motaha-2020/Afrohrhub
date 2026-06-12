import { redirect } from "@/i18n/navigation";

/** Locale root → dashboard. */
export default async function LocaleIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/dashboard", locale });
}
