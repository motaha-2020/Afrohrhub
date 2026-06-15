import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { offboardingCase } from "@/lib/data/mock/offboarding";
import { PROJECTS } from "@/lib/data/mock/seed";
import { localizedName } from "@/lib/utils/format";
import { OffboardingCaseClient } from "./OffboardingCaseClient";

export default async function OffboardingCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getTranslations("offboarding");

  const offCase = offboardingCase(id);

  if (!offCase) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-sm">
        <p className="text-[15px] font-bold">{t("notFound.title")}</p>
        <p className="mt-1 text-[13px] text-muted">
          {t("notFound.description")}
        </p>
        <Link
          href="/offboarding"
          className="mt-4 inline-block text-[13px] font-semibold text-primary hover:underline"
        >
          {t("notFound.back")}
        </Link>
      </div>
    );
  }

  const project = PROJECTS.find((p) => p.id === offCase.project_id);
  const projectName = project ? localizedName(project, locale) : "—";

  return (
    <OffboardingCaseClient offboardingCase={offCase} projectName={projectName} />
  );
}
