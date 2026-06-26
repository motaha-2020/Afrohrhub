import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SETTINGS_SECTIONS } from "@/lib/data/mock/ess-settings-audit";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("settings");
  const ar = locale === "ar";

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">{t("title")}</h1>
          <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
        </div>
        <Button>{t("save")}</Button>
      </div>

      <div className="flex flex-col gap-3.5">
        {SETTINGS_SECTIONS.map((section) => (
          <Card
            key={section.key}
            title={
              <span className="flex items-center gap-2">
                <span aria-hidden>{section.icon}</span>
                {ar ? section.name_ar : section.name_en}
              </span>
            }
          >
            <div className="flex flex-col gap-2">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-[8px] border border-line px-3.5 py-2.5"
                >
                  <div>
                    <b className="text-[13px]">
                      {ar ? item.label_ar : item.label_en}
                    </b>
                    <p className="text-[12px] text-muted">
                      {ar ? item.value_ar : item.value_en}
                    </p>
                  </div>
                  {item.editable ? (
                    <Button size="sm" variant="ghost">
                      {t("edit")}
                    </Button>
                  ) : (
                    <Badge variant="gray">{t("locked")}</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] text-muted">{t("note")}</p>
    </>
  );
}
