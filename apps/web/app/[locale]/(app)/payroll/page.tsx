import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stepper, type Step } from "@/components/ui/Stepper";
import { tr } from "@/lib/utils/format";

/**
 * Payroll cycle board (demo screen 7) — the manual's 9-stage calendar
 * (Policy 2), exclusion/anomaly alerts, the cycle register, allowances and
 * KPI. Presentational sample (docs/modules/05-payroll-allowances-kpi.md).
 */
export default async function PayrollPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const cycle: Step[] = [
    { label: L("كشف التعيينات", "New Hire Sheet"), state: "done", marker: "18" },
    { label: L("تدقيق البيانات", "Data Validation"), state: "done", marker: "19" },
    { label: L("تحديث السجل", "Register Update"), state: "done", marker: "19" },
    { label: L("توزيع المشاريع", "Project Allocation"), state: "current", marker: "23" },
    { label: L("الاستقطاعات", "Deductions"), state: "current", marker: "23" },
    { label: L("المعالجة والضرائب", "Processing & Taxes"), state: "upcoming", marker: "23" },
    { label: L("التقديم للمالية", "Submit to Finance"), state: "upcoming", marker: "25" },
    { label: L("الدفع", "Payment"), state: "upcoming", marker: "28" },
    { label: L("تقارير التكلفة", "Cost Reports"), state: "upcoming", marker: "10" },
  ];

  const register = [
    { emp: L("أحمد عبد الحليم", "Ahmed Abdel Halim"), prj: L("بنبان ٨٠٪ / المقر ٢٠٪", "Benban 80% / HQ 20%"), net: "28,500", ded: "—", status: { text: L("جاهز", "Ready"), variant: "green" as const }, warn: false },
    { emp: L("محمود النجار", "Mahmoud El-Naggar"), prj: L("السخنة ١٠٠٪", "Sokhna 100%"), net: "14,200", ded: L("قسط سلفة ١٠٠٠ ✓ معتمد", "Advance installment 1,000 ✓ Approved"), status: { text: L("جاهز", "Ready"), variant: "green" as const }, warn: false },
    { emp: L("سارة عادل", "Sara Adel"), prj: L("المقر ١٠٠٪", "HQ 100%"), net: "31,000", ded: "—", status: { text: L("جاهز", "Ready"), variant: "green" as const }, warn: false },
    { emp: L("هشام قنديل", "Hesham Kandil"), prj: L("العلمين ١٠٠٪", "Alamein 100%"), net: "22,600 ⚠", ded: "—", status: { text: L("مراجعة شذوذ", "Anomaly review"), variant: "red" as const }, warn: true },
  ];

  const allowances = [
    { label: L("بنبان — بدلات الموقع، ١١٢٠ موظف", "Benban — site allowances, 1,120 employees"), badge: { text: L("✓ استُلمت من PM", "✓ Received from PM"), variant: "green" as const } },
    { label: L("العلمين — ٨٤٦ موظف", "Alamein — 846 employees"), badge: { text: L("✓ استُلمت", "✓ Received"), variant: "green" as const } },
    { label: L("كوبري أسيوط — ٦٣٣", "Assiut Bridge — 633"), badge: { text: L("متأخر — أُرسل تذكير لـ PM", "Late — reminder sent to PM"), variant: "red" as const } },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">
            {L("💰 دورة رواتب يونيو ٢٠٢٦", "💰 June 2026 Payroll Cycle")}
          </h1>
          <p className="text-[12.5px] text-muted">
            {L(
              "٣٢٤٧ موظف مستحق · الإجمالي التقديري: ٤١.٢ مليون ج.م · اليوم ١٢/٠٦ — الدورة تُفتح تلقائياً يوم ١٨",
              "3,247 eligible employees · estimated total: EGP 41.2M · today is 12/06 — cycle opens automatically on the 18th"
            )}
          </p>
        </div>
        <Badge variant="blue" className="px-4 py-1.5 text-[13px]">
          {L("دورة مايو: مدفوعة ✓ ومقفلة 🔒", "May cycle: paid ✓ and locked 🔒")}
        </Badge>
      </div>

      <Card className="mb-4" title={L("📅 تقويم الدورة (من الدليل — Policy 2)", "📅 Cycle calendar (from the manual — Policy 2)")}>
        <Stepper steps={cycle} />
        <p className="text-[11.5px] text-muted">
          {L(
            "⬆ يُعرض تقويم دورة مايو المكتملة كمثال. التوزيعات الناقصة يوم ٢٣ تُرحَّل للدورة التالية تلقائياً (Policy 3)",
            "⬆ Showing the completed May cycle as an example. Project allocations missing the 23rd are carried to the next cycle automatically (Policy 3)"
          )}
        </p>
      </Card>

      <div className="mb-4 space-y-3">
        <Alert variant="red">
          {L(
            "⛔ استُبعد ٣ موظفين تلقائياً: ٢ بحالة Pending (Policy 1 — لا راتب قبل التفعيل) · ١ حساب بنكي غير موثّق (Policy 6)",
            "⛔ 3 employees auto-excluded: 2 with Pending status (Policy 1 — no payroll before activation) · 1 unverified bank account (Policy 6)"
          )}
        </Alert>
        <Alert variant="yellow">
          {L(
            "🤖 فحص الشذوذ بالذكاء الاصطناعي: راتب «م. هشام قنديل» أعلى ٢٢٪ عن الشهر الماضي بلا تعديل معتمد — راجِع قبل التقديم (Policy 11)",
            "🤖 AI anomaly check: Eng. Hesham Kandil's salary is 22% above last month with no approved adjustment — review before submission (Policy 11)"
          )}
        </Alert>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={L("سجل الدورة (عيّنة)", "Cycle register (sample)")} flush>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {[L("الموظف", "Employee"), L("المشروع", "Project"), L("الصافي", "Net"), L("الاستقطاعات", "Deductions"), L("الحالة", "Status")].map((h) => (
                  <th key={h} className="border-b-[1.5px] border-line px-2 py-2 text-start text-[11.5px] font-bold text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {register.map((r) => (
                <tr key={r.emp} className="border-b border-line last:border-b-0">
                  <td className="px-2 py-2.5">{r.emp}</td>
                  <td className="px-2 py-2.5">{r.prj}</td>
                  <td className={`px-2 py-2.5 ${r.warn ? "font-bold text-red" : ""}`}>{r.net}</td>
                  <td className="px-2 py-2.5 text-[11.5px]">{r.ded}</td>
                  <td className="px-2 py-2.5">
                    <Badge variant={r.status.variant}>{r.status.text}</Badge>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-2 py-2.5">{L("أحمد رجب", "Ahmed Ragab")}</td>
                <td className="px-2 py-2.5">{L("العلمين", "Alamein")}</td>
                <td className="px-2 py-2.5 text-[11.5px] text-muted" colSpan={2}>
                  {L("مُستبعد — Pending (ينضم لدورة يوليو بعد التفعيل)", "Excluded — Pending (joins July cycle after activation)")}
                </td>
                <td className="px-2 py-2.5">
                  <Badge variant="gray">{L("مُستبعد", "Excluded")}</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card title={L("💵 البدلات (دورة ١٠–١٧)", "💵 Allowances (cycle 10–17)")}>
            <table className="w-full border-collapse text-[13px]">
              <tbody>
                {allowances.map((a) => (
                  <tr key={a.label} className="border-b border-line last:border-b-0">
                    <td className="py-2.5">{a.label}</td>
                    <td className="py-2.5 text-end">
                      <Badge variant={a.badge.variant}>{a.badge.text}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11.5px] text-muted">
              {L("تقديم المالية بحلول ١٧ · الدفع ٢٠–٢٥", "Finance submission by the 17th · payment 20–25")}
            </p>
          </Card>

          <Card title={L("🏆 KPI — الربع الثاني ٢٠٢٦", "🏆 KPI — Q2 2026")}>
            <p className="text-[13px]">
              {L(
                "تقييمات PMO مستحقة نهاية يونيو · آخر صرف (Q1): ٢.٨٤ مليون ج.م لـ ٤١٢ موظفاً ✓ · التقارير موزّعة بالمشروع",
                "PMO evaluations due end of June · last payout (Q1): EGP 2.84M to 412 employees ✓ · cost reports distributed by project"
              )}
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              {L("تقارير التكلفة بالمشروع", "Cost reports by project")}
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
