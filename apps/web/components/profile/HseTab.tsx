import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import { employeeRepository } from "@/lib/data";
import { DEMO_TODAY } from "@/lib/data/mock/seed";
import { daysBetween, formatDate, localizedName } from "@/lib/utils/format";

/** Expiry window (days) that flags an HSE record for renewal (60/30/7 alerts). */
const HSE_WARNING_DAYS = 60;

export async function HseTab({
  employeeId,
  locale,
}: {
  employeeId: string;
  locale: string;
}) {
  const t = await getTranslations("profile.hse");
  const records = await employeeRepository.getHseRecords(employeeId);

  return (
    <Card title={t("title")}>
      {records.length === 0 ? (
        <EmptyState
          icon="🦺"
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <ul>
          {records.map((record) => {
            const ok = record.result === "fit" || record.result === "pass";
            const expiring =
              record.expiry_date &&
              daysBetween(DEMO_TODAY, record.expiry_date) <= HSE_WARNING_DAYS;
            return (
              <li
                key={record.id}
                className="flex flex-wrap items-center gap-2.5 border-b border-dashed border-line px-1 py-[9px] text-[13px] last:border-b-0"
              >
                <span
                  className={cn(
                    "flex size-[21px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                    !ok
                      ? "bg-red text-white"
                      : expiring
                        ? "bg-yellow text-white"
                        : "bg-green text-white"
                  )}
                >
                  {!ok ? "✗" : expiring ? "!" : "✓"}
                </span>
                {localizedName(record, locale)} —{" "}
                <b>{t(`result.${record.result}`)}</b>
                {expiring && record.expiry_date ? (
                  <Badge variant="yellow">
                    {t("expiresSoon", {
                      date: formatDate(record.expiry_date, locale),
                    })}
                  </Badge>
                ) : null}
                <span className="ms-auto text-end text-[11px] text-muted">
                  {record.expiry_date
                    ? t("validUntil", {
                        date: formatDate(record.expiry_date, locale),
                      })
                    : t("noExpiry")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
