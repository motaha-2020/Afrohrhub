import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  ONBOARDING_CASES,
  onboardingTasks,
} from "@/lib/data/mock/onboarding";
import { PROJECTS } from "@/lib/data/mock/seed";
import { localizedName } from "@/lib/utils/format";
import { OnboardingCaseClient } from "./OnboardingCaseClient";

export default async function OnboardingCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("onboarding");

  const onboardingCase = ONBOARDING_CASES.find((c) => c.id === id) ?? null;

  if (!onboardingCase) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
        <p className="text-[15px] font-bold">{t("notFound.title")}</p>
        <p className="mt-1 text-[13px] text-muted">
          {t("notFound.description")}
        </p>
        <Link
          href="/onboarding"
          className="mt-4 inline-block text-[13px] font-semibold text-primary hover:underline"
        >
          {t("notFound.back")}
        </Link>
      </div>
    );
  }

  const project = PROJECTS.find((p) => p.id === onboardingCase.project_id);
  const projectName = project ? localizedName(project, locale) : "—";

  return (
    <OnboardingCaseClient
      onboardingCase={onboardingCase}
      tasks={onboardingTasks(id)}
      projectName={projectName}
    />
  );
}
