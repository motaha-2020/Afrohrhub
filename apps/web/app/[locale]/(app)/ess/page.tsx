import { Card } from "@/components/ui/Card";
import { Checklist, type CheckItem } from "@/components/ui/Checklist";
import { tr } from "@/lib/utils/format";
import { EssCheckIn } from "./EssCheckIn";

/**
 * ESS app preview (demo screen 12) — the mobile-first employee portal:
 * phone mock with GPS check-in and tiles, plus WhatsApp system messages.
 * Presentational sample (docs/modules/08-ess-portal.md).
 */
export default async function EssPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const tiles = [
    { em: "🏖", title: L("إجازاتي", "My Leave"), sub: L("الرصيد: ١٢ يوماً", "Balance: 12 days") },
    { em: "💰", title: L("راتبي", "My Salary"), sub: L("قسيمة مايو ✓", "May payslip ✓") },
    { em: "📄", title: L("مستنداتي", "My Documents"), sub: L("⚠️ ١ ينتهي قريباً", "⚠️ 1 expiring soon") },
    { em: "🤲", title: L("طلب سلفة", "Request Advance"), sub: L("القسط الحالي: ١٠٠٠ ج.م", "Current installment: EGP 1,000") },
  ];

  const wapp = [
    { msg: L("أهلاً محمود 👋 تم صرف راتب مايو. التفاصيل كاملة داخل التطبيق.", "Hi Mahmoud 👋 Your May salary has been paid. Full details inside the app."), time: L("٢٨/٠٥ · ٤:٠٢م ✓✓", "28/05 · 4:02 PM ✓✓") },
    { msg: L("⚠️ تذكير: رخصة المزاولة تنتهي خلال ٢٨ يوماً (١٠/٠٧). جددها وارفع صورة من التطبيق.", "⚠️ Reminder: your professional practice license expires in 28 days (10/07). Please renew and upload a photo from the app."), time: L("اليوم · ٩:٠٠ص ✓✓", "Today · 9:00 AM ✓✓") },
    { msg: L("✅ تم اعتماد إجازتك يوم ١٥/٠٦. إجازة سعيدة!", "✅ Your leave on 15/06 has been approved. Enjoy!"), time: L("اليوم · ١١:٣٠ص ✓", "Today · 11:30 AM ✓") },
  ];

  const why: CheckItem[] = [
    { state: "ok", label: L("أزرار كبيرة وجُمل قصيرة — مناسبة للعمالة", "Big buttons, short sentences — blue-collar friendly") },
    { state: "ok", label: L("بلا بريد إلكتروني — موبايل + OTP", "No email required — phone + OTP") },
    { state: "ok", label: L("الراتب خلف PIN إضافي (Policy 9)", "Salary behind an extra PIN (Policy 9)") },
    { state: "ok", label: L("التسجيل يعمل دون اتصال ويُزامن لاحقاً", "Check-in works offline and syncs later") },
    { state: "ok", label: L("للمديرين تبويب «فريقي» للاعتمادات اليومية", "Managers get a My Team tab for daily approvals") },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{L("📱 تطبيق الموظف (ESS)", "📱 Employee App (ESS)")}</h1>
        <p className="text-[12.5px] text-muted">
          {L(
            "موبايل أولاً · لغة بسيطة · دخول بالموبايل + OTP (بلا بريد) · يعمل على شبكات ضعيفة",
            "Mobile-first · simple language · phone number + OTP login (no email) · works on weak networks"
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-8">
        {/* Phone mock */}
        <div className="w-[330px] shrink-0 rounded-[38px] bg-[#0b1220] p-3.5 shadow-[0_18px_50px_rgba(10,20,50,.3)]">
          <div className="min-h-[600px] overflow-hidden rounded-[26px] bg-page">
            <div className="rounded-b-[22px] bg-gradient-to-br from-primary to-purple px-4 pb-4 pt-9 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <small className="text-[11px] opacity-85">{L("صباح الخير 👷", "Good morning 👷")}</small>
                  <div className="text-[17px] font-extrabold">{L("محمود النجار", "Mahmoud El-Naggar")}</div>
                  <small className="text-[11px] opacity-85">{L("لحّام أرجون · مصنع أسمنت السخنة", "Argon welder · Sokhna Cement Plant")}</small>
                </div>
                <span className="text-2xl">🔔</span>
              </div>
            </div>

            <div className="m-4 mb-3.5 rounded-[18px] border border-line bg-card p-4 text-center">
              <small className="text-muted text-[11px]">
                {L("الخميس ١٢ يونيو · وردية صباحية ٧:٠٠ص – ٣:٠٠م", "Thursday, June 12 · morning shift 7:00 AM – 3:00 PM")}
              </small>
              <div className="mt-3">
                <EssCheckIn
                  inLabel={L("تسجيل دخول ✋", "Check In ✋")}
                  outLabel={L("تسجيل خروج 🏁", "Check Out 🏁")}
                  hintIdle={L("اضغط الزر وأنت داخل نطاق الموقع (GPS)", "Tap the button while inside the site zone (GPS)")}
                  hintIn={L("✅ سُجِّل الدخول ٦:٥٤ص — داخل نطاق الموقع (GPS ✓)", "✅ Checked in 6:54 AM — inside site zone (GPS verified)")}
                  hintOut={L("🏁 سُجِّل الخروج ٣:٠٢م — يوم كامل · إضافي: ٠", "🏁 Checked out 3:02 PM — full workday · overtime: 0")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 pt-0">
              {tiles.map((t) => (
                <div key={t.title} className="rounded-[16px] border border-line bg-card p-4 text-center">
                  <span className="text-[26px]">{t.em}</span>
                  <b className="mt-1.5 block text-[13px]">{t.title}</b>
                  <small className="text-muted text-[10.5px]">{t.sub}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp + rationale */}
        <div className="min-w-[280px] flex-1">
          <div className="max-w-[330px] rounded-[14px] border border-[#bfe8d2] bg-[#e7f8ef] p-3.5 text-[12.5px]">
            <div className="mb-2 flex items-center gap-2 font-extrabold text-[#0c6b43]">
              🟢 {L("واتساب — رسائل النظام للموظف", "WhatsApp — system messages to the employee")}
            </div>
            {wapp.map((w) => (
              <div key={w.time} className="mb-2 rounded-[10px] bg-card p-2.5 shadow-card">
                {w.msg}
                <small className="mt-1 block text-end text-[10px] text-muted">{w.time}</small>
              </div>
            ))}
          </div>

          <Card className="mt-4" title={L("لماذا هذا التصميم؟", "Why this design?")}>
            <Checklist items={why} />
          </Card>
        </div>
      </div>
    </>
  );
}
