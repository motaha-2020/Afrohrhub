import { getTranslations } from "next-intl/server";
import {
  CANDIDATES,
  HIRING_REQUESTS,
  JOB_OFFERS,
} from "@/lib/data/mock/recruitment";
import { RecruitmentTabs } from "../RecruitmentTabs";
import { PipelineBoard } from "./PipelineBoard";

export default async function PipelinePage() {
  const t = await getTranslations("recruitment.pipeline");
  const active = CANDIDATES.filter((c) => c.status === "active").length;

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">
          {t("subtitle", { count: active })}
        </p>
      </div>
      <RecruitmentTabs active="pipeline" />
      <PipelineBoard
        requests={HIRING_REQUESTS.filter(
          (r) => r.status === "in_progress" || r.status === "pending_approval"
        )}
        initialCandidates={CANDIDATES}
        initialOffers={JOB_OFFERS}
      />
    </>
  );
}
