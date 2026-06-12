import { getTranslations } from "next-intl/server";
import { APPROVAL_TASKS } from "@/lib/data/mock/approvals";
import { ApprovalsClient } from "./ApprovalsClient";

export default async function ApprovalsPage() {
  const t = await getTranslations("approvals");
  const pendingCount = APPROVAL_TASKS.filter(
    (t) => t.status === "pending"
  ).length;

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">
          {t("subtitle", { pending: pendingCount })}
        </p>
      </div>
      <ApprovalsClient initial={APPROVAL_TASKS} />
    </>
  );
}
