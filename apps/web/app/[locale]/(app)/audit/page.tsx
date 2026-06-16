import { getTranslations } from "next-intl/server";
import { AuditClient } from "./AuditClient";
import { RLS_AUDIT, POLICY_COMPLIANCE, PEN_TEST_ITEMS } from "@/lib/data/mock/audit";

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("audit");
  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{t("title")}</h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>
      <AuditClient
        rlsTables={RLS_AUDIT}
        policies={POLICY_COMPLIANCE}
        penTests={PEN_TEST_ITEMS}
        locale={locale}
      />
    </>
  );
}
