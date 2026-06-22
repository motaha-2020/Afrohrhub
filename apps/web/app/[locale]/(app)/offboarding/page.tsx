import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checklist, type CheckItem } from "@/components/ui/Checklist";
import { Stepper, type Step } from "@/components/ui/Stepper";
import { tr } from "@/lib/utils/format";

/**
 * Offboarding tracker (demo screen 6) — 6-stage stepper, clearance matrix,
 * and the draft final settlement gated on Finance approval (Policy 13).
 * Presentational sample (docs/modules/04-offboarding.md).
 */
export default async function OffboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const stages: Step[] = [
    { label: L("فتح الحالة", "Case Opened"), state: "done" },
    { label: L("إيقاف الصلاحيات", "Access Deactivation"), state: "done" },
    { label: L("تسليم المهام", "Handover"), state: "done" },
    { label: L("إخلاء الطرف", "Clearance"), state: "current" },
    { label: L("الإغلاق القانوني والمالي", "Legal & Financial Closure"), state: "upcoming", marker: "5" },
    { label: L("الأرشفة", "Archiving"), state: "upcoming", marker: "6" },
  ];

  const settlement = [
    { label: L("راتب ١٩ يوماً من يونيو", "Salary for 19 days of June"), value: "+ EGP 11,083", neg: false },
    { label: L("رصيد إجازات غير مستخدم (٩ أيام × اليومي)", "Unused leave balance (9 days × daily rate)"), value: "+ EGP 5,250", neg: false },
    { label: L("خصم: باقي السلفة", "Deduction: remaining advance"), value: "− EGP 2,400", neg: true },
  ];

  const settleChecks: CheckItem[] = [
    {
      state: "ok",
      label: L("توثيق مقابلة الخروج", "Exit interview documented"),
      meta: L("السبب: عرض أفضل — قطاع البترول", "Reason: better offer — oil & gas sector"),
    },
    {
      state: "pending",
      label: L(
        "نموذج التأمينات (٦) — يُقدَّم يوم ١٩",
        "Social Insurance Form (6) — filed on the 19th"
      ),
    },
    {
      state: "pending",
      label: L(
        "إعادة المستندات الأصلية + إيصال موقّع",
        "Return original documents + signed receipt"
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">
            {L(
              "📦 Offboarding — خالد منصور إبراهيم",
              "📦 Offboarding — Khaled Mansour Ibrahim"
            )}
          </h1>
          <p className="text-[12.5px] text-muted">
            {L(
              "محاسب موقع · كوبري النيل أسيوط · AFR-2021-0233 · المُسبِّب: استقالة (عبر ESS) · آخر يوم عمل: ١٩/٠٦/٢٠٢٦",
              "Site Accountant · Nile Bridge Assiut · AFR-2021-0233 · Trigger: Resignation (via ESS) · Last working day: 19/06/2026"
            )}
          </p>
        </div>
        <Badge variant="yellow" className="px-4 py-1.5 text-[13px]">
          {L("المرحلة ٤ من ٦ — إخلاء الطرف", "Stage 4 of 6 — Clearance")}
        </Badge>
      </div>

      <Card className="mb-4">
        <Stepper steps={stages} />
        <Alert variant="green">
          {L(
            "✓ قاعدة إلزامية: مهمة قطع الصلاحيات مجدولة ١٩/٠٦ (آخر يوم) — مهمة IT مفتوحة بتصعيد تلقائي عند التأخر",
            "✓ Mandatory rule: access-cutoff task scheduled 19/06 (last working day) — IT task open with automatic escalation if late"
          )}
        </Alert>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={L("🧾 مصفوفة إخلاء الطرف", "🧾 Clearance Matrix")} flush>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {[L("القسم", "Department"), L("البنود", "Items"), L("الحالة", "Status")].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b-[1.5px] border-line px-2.5 py-2 text-start text-[11.5px] font-bold text-muted"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line">
                <td className="px-2.5 py-2.5 font-bold">IT</td>
                <td className="px-2.5 py-2.5">
                  {L("لابتوب · إغلاق البريد · استرداد الأجهزة", "Laptop · email closure · hardware recovery")}
                </td>
                <td className="px-2.5 py-2.5">
                  <Badge variant="green">{L("✓ ٢/٣ تم", "✓ 2/3 done")}</Badge>{" "}
                  <Badge variant="yellow">{L("اللابتوب يوم ١٩", "Laptop on the 19th")}</Badge>
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-2.5 py-2.5 font-bold">{L("العمليات / الإدارة", "Operations / Admin")}</td>
                <td className="px-2.5 py-2.5">
                  {L("بطاقة الهوية · الكارت الطبي · إعادة العهد", "ID card · medical card · asset return")}
                </td>
                <td className="px-2.5 py-2.5">
                  <Badge variant="yellow">{L("جارٍ", "In progress")}</Badge>
                </td>
              </tr>
              <tr className="border-b border-line">
                <td className="px-2.5 py-2.5 font-bold">{L("المالية", "Finance")}</td>
                <td className="px-2.5 py-2.5">
                  {L("تسوية سلفة (متبقٍ ٢٤٠٠ ج.م) · عهدة نقدية · التزامات", "Advance settlement (EGP 2,400 left) · petty cash · liabilities")}
                </td>
                <td className="px-2.5 py-2.5">
                  <Badge variant="yellow">{L("تُخصم من التسوية", "Deducted from settlement")}</Badge>
                </td>
              </tr>
              <tr>
                <td className="px-2.5 py-2.5 font-bold">{L("المدير المباشر", "Direct Manager")}</td>
                <td className="px-2.5 py-2.5">{L("اعتماد التسليم", "Handover approval")}</td>
                <td className="px-2.5 py-2.5">
                  <Badge variant="green">{L("✓ اعتُمد ١٠/٠٦", "✓ Approved 10/06")}</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card
          title={L(
            "💰 التسوية النهائية (مسودة — تُدفع بعد إخلاء الطرف واعتماد المالية)",
            "💰 Final Settlement (draft — paid after clearance + Finance approval)"
          )}
        >
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {settlement.map((row) => (
                <tr key={row.label} className="border-b border-line">
                  <td className="py-2.5">{row.label}</td>
                  <td
                    className={`py-2.5 text-end font-bold ${row.neg ? "text-red" : ""}`}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2.5 font-bold">{L("الصافي المستحق", "Net due")}</td>
                <td className="py-2.5 text-end text-[16px] font-bold">EGP 13,933</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2">
            <Checklist items={settleChecks} />
          </div>
          <Button size="sm" className="mt-2">
            {L("إرسال لاعتماد المالية", "Send for Finance approval")}
          </Button>
        </Card>
      </div>
    </>
  );
}
