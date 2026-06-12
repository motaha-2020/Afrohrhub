import { getTranslations } from "next-intl/server";
import { PROJECTS } from "@/lib/data/mock/seed";
import { HiringRequestForm } from "./HiringRequestForm";

export default async function NewHiringRequestPage() {
  const t = await getTranslations("recruitment.form");

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>
      <HiringRequestForm
        projects={PROJECTS.filter((p) => p.status === "active")}
      />
    </>
  );
}
