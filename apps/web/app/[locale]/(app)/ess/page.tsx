import { getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getServerSession } from "@/lib/auth/session.server";
import {
  ESS_QUICK_ACTIONS,
  ESS_NOTIFICATIONS,
  ESS_SUMMARY,
} from "@/lib/data/mock/ess-settings-audit";
import { formatNumber } from "@/lib/utils/format";

export default async function EssPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("ess");
  const ar = locale === "ar";
  const { session } = await getServerSession();
  const s = ESS_SUMMARY;

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">
          {t("greeting", {
            name: ar ? session.user.name_ar : session.user.name_en,
          })}
        </h1>
        <p className="text-[12.5px] text-muted">{t("subtitle")}</p>
      </div>

      <div className="mb-[18px] grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl">📍</div>
          <div className="mt-1 text-[20px] font-extrabold">{s.check_in_time}</div>
          <Badge variant="yellow">
            {ar ? s.check_in_status_ar : s.check_in_status_en}
          </Badge>
          <div className="mt-1 text-[11px] text-muted">{t("todayCheckIn")}</div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl">🏖</div>
          <div className="mt-1 text-[20px] font-extrabold">{s.leave_balance}</div>
          <div className="text-[11px] text-muted">
            {t("leaveBalance", {
              type: ar ? s.leave_type_ar : s.leave_type_en,
            })}
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl">💰</div>
          <div className="mt-1 text-[20px] font-extrabold">
            {formatNumber(s.net_salary_egp, locale)}
          </div>
          <div className="text-[11px] text-muted">
            {t("lastPayslip", {
              period: ar ? s.last_payslip_ar : s.last_payslip_en,
            })}
          </div>
        </Card>

        <Card className="text-center">
          <div className="text-2xl">🔔</div>
          <div className="mt-1 text-[20px] font-extrabold">
            {s.unread_notifications}
          </div>
          <div className="text-[11px] text-muted">{t("unreadNotifs")}</div>
        </Card>
      </div>

      <Card title={t("quickActions")} className="mb-[18px]">
        <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
          {ESS_QUICK_ACTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              className="flex flex-col items-center gap-1.5 rounded-[10px] border border-line bg-[#fafbfd] p-3 text-center transition-colors hover:bg-primary-soft"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[11.5px] font-semibold">
                {ar ? a.label_ar : a.label_en}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card
        title={t("notifications")}
        action={
          <Button size="sm" variant="ghost">
            {t("markAllRead")}
          </Button>
        }
      >
        <ul className="flex flex-col gap-1.5">
          {ESS_NOTIFICATIONS.map((n) => (
            <li
              key={n.id}
              className="flex items-start justify-between gap-2.5 rounded-[8px] border border-line px-3 py-2"
            >
              <span className="flex items-start gap-2">
                {!n.read && (
                  <span className="mt-1.5 block size-2 shrink-0 rounded-full bg-primary" />
                )}
                <span className="text-[12.5px]">
                  {ar ? n.message_ar : n.message_en}
                </span>
              </span>
              <small className="shrink-0 text-[11px] text-muted">
                {ar ? n.time_ar : n.time_en}
              </small>
            </li>
          ))}
        </ul>
      </Card>

      <Alert variant="yellow" className="mt-3.5">
        {t("mobileNote")}
      </Alert>
    </>
  );
}
