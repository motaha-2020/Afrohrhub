import { getTranslations } from "next-intl/server";
import { TALENT_POOL } from "@/lib/data/mock/recruitment";
import { RecruitmentTabs } from "../RecruitmentTabs";
import { TalentPoolClient } from "./TalentPoolClient";

export default async function TalentPoolPage() {
  const t = await getTranslations("recruitment.talentPool");

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">
          {t("subtitle", { count: TALENT_POOL.length })}
        </p>
      </div>
      <RecruitmentTabs active="talentPool" />
      <TalentPoolClient entries={TALENT_POOL} />
    </>
  );
}
