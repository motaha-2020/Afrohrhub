import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Checklist, type CheckItem } from "@/components/ui/Checklist";
import { tr } from "@/lib/utils/format";

/**
 * Company settings (demo screen 13) — org structure, editable SLA values,
 * payroll calendar (Policy 2) and notification channels. Presentational
 * sample (docs/06-screens-map.md §Settings).
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const org = [
    { label: L("الأقسام", "Departments"), value: "14" },
    { label: L("الدرجات", "Grades"), value: "E1–E5 · T1–T4 · M1–M3" },
    { label: L("المشاريع النشطة", "Active projects"), value: L("٤ + المقر", "4 + Head Office") },
    { label: L("صيغة كود HR", "HR Code format"), value: "AFR-{YYYY}-{####}", note: L("🔒 الأكواد لا يُعاد استخدامها", "🔒 codes are never reused") },
  ];

  const channels: CheckItem[] = [
    { state: "ok", label: L("داخل التطبيق + بريد (Resend)", "In-App + Email (Resend)") },
    {
      state: "ok",
      label: (
        <span>
          {L("واتساب Business API ", "WhatsApp Business API ")}
          <Badge variant="green">{L("١٢ قالباً معتمداً", "12 approved templates")}</Badge>
        </span>
      ),
    },
    { state: "ok", label: L("SMS (مزود محلي) — احتياطي و OTP", "SMS (local provider) — fallback & OTP") },
    { state: "ok", label: L("تنبيهات الانتهاء: ٦٠ / ٣٠ / ٧ أيام", "Expiry alerts: 60 / 30 / 7 days") },
  ];

  const payrollCal = [
    { label: L("كشف التعيينات الجديدة", "New Hire Sheet"), value: L("يوم ١٨", "Day 18") },
    { label: L("التقديم للمالية", "Submission to Finance"), value: L("حتى يوم ٢٥", "By day 25") },
    { label: L("الدفع", "Payment"), value: L("٢٨ — نهاية الشهر", "28 — month end") },
    { label: L("تقارير التكلفة", "Cost reports"), value: L("حتى يوم ١٠", "By day 10") },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{L("⚙️ إعدادات الشركة", "⚙️ Company Settings")}</h1>
        <p className="text-[12.5px] text-muted">
          {L(
            "المستأجر: أفرو إيجيبت للمقاولات · خطة Enterprise · ٣٢٤٧ موظفاً",
            "Tenant: Afro Egypt Contracting · Enterprise plan · 3,247 employees"
          )}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={L("🏗 الهيكل التنظيمي", "🏗 Organization Structure")}>
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {org.map((o) => (
                <tr key={o.label} className="border-b border-line last:border-b-0">
                  <td className="py-2.5">{o.label}</td>
                  <td className="py-2.5 font-semibold">{o.value}</td>
                  <td className="py-2.5 text-end">
                    {o.note ? (
                      <span className="text-[12px] text-muted">{o.note}</span>
                    ) : (
                      <span className="text-[12px] font-bold text-primary">
                        {L("إدارة", "Manage")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title={L("⏱ قيم الـ SLA (قابلة للتعديل)", "⏱ SLA values (editable)")}>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {[L("المرحلة", "Stage"), "P0", "P1"].map((h) => (
                  <th key={h} className="border-b-[1.5px] border-line px-2 py-2 text-start text-[11.5px] font-bold text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="px-2 py-2.5">{L("التوفير والفرز", "Sourcing & Screening")}</td>
                <td className="px-2 py-2.5">{L("٧٢ ساعة عمل", "72 working hrs")}</td>
                <td className="px-2 py-2.5">
                  {L("٥ أيام عمل ", "5 working days ")}
                  <Badge variant="yellow">{L("مُصحَّح — بانتظار الاعتماد", "corrected — pending sign-off")}</Badge>
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-2 py-2.5">{L("المقابلات", "Interviews")}</td>
                <td className="px-2 py-2.5">{L("٣–٥ أيام", "3–5 days")}</td>
                <td className="px-2 py-2.5">{L("٥–٧ أيام", "5–7 days")}</td>
              </tr>
              <tr>
                <td className="px-2 py-2.5">{L("متطلبات HSE", "HSE Requirements")}</td>
                <td className="px-2 py-2.5">{L("١٠–١٥ يوماً", "10–15 days")}</td>
                <td className="px-2 py-2.5">{L("٢٠–٢٥ يوماً", "20–25 days")}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title={L("📅 تقويم الرواتب", "📅 Payroll Calendar")}>
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {payrollCal.map((p) => (
                <tr key={p.label} className="border-b border-line last:border-b-0">
                  <td className="py-2.5">{p.label}</td>
                  <td className="py-2.5 text-end font-bold">{p.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11.5px] text-muted">
            {L(
              "الافتراضات من الدليل — أي خروج يتطلب تبريراً واعتماداً (Policy 15)",
              "Defaults from the manual — any deviation requires justification and approval (Policy 15)"
            )}
          </p>
        </Card>

        <Card title={L("🔔 قنوات الإشعارات", "🔔 Notification Channels")}>
          <Checklist items={channels} />
        </Card>
      </div>
    </>
  );
}
