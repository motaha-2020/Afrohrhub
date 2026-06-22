import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { tr } from "@/lib/utils/format";

/**
 * SLA dashboard (demo screen 11) — working-hour timers, breaches and
 * time-to-hire, per the SLA engine (docs/04-sla-engine.md). Presentational
 * sample.
 */
export default async function SlaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const rows: {
    entity: string;
    module: string;
    stage: string;
    priority: { text: string; variant: BadgeVariant } | null;
    sla: string;
    elapsed: string;
    state: { text: string; variant: BadgeVariant };
  }[] = [
    {
      entity: L("HR-118 مهندس كهرباء قوى", "HR-118 Power Electrical Engineer"),
      module: L("التوظيف", "Recruitment"),
      stage: L("التوفير والفرز", "Sourcing & Screening"),
      priority: { text: "P0", variant: "red" },
      sla: L("٧٢ ساعة عمل", "72 working hrs"),
      elapsed: L("٧٨ ساعة", "78 hrs"),
      state: { text: L("🔴 تجاوُز — صُعّد لمدير HR", "🔴 Breached — escalated to HR Manager"), variant: "red" },
    },
    {
      entity: L("Onboarding — منار صبري", "Onboarding — Manar Sabry"),
      module: "Onboarding",
      stage: L("تجهيز المعدات", "Equipment Preparation"),
      priority: { text: "P0", variant: "red" },
      sla: L("١–٢ يوم عمل", "1–2 working days"),
      elapsed: L("١.٦ يوم", "1.6 days"),
      state: { text: L("🟡 تحذير ٨٠٪", "🟡 Warning 80%"), variant: "yellow" },
    },
    {
      entity: L("Offboarding — خالد منصور", "Offboarding — Khaled Mansour"),
      module: "Offboarding",
      stage: L("إخلاء الطرف", "Clearance"),
      priority: null,
      sla: L("يوم الخروج ١٩/٠٦", "Exit day 19/06"),
      elapsed: "—",
      state: { text: L("🟢 في الموعد", "🟢 On time"), variant: "green" },
    },
    {
      entity: L("HR-117 محاسب (إحلال)", "HR-117 Accountant (replacement)"),
      module: L("التوظيف", "Recruitment"),
      stage: L("المقابلات", "Interviews"),
      priority: { text: "P1", variant: "blue" },
      sla: L("٥–٧ أيام عمل", "5–7 working days"),
      elapsed: L("٣ أيام", "3 days"),
      state: { text: "🟢", variant: "green" },
    },
    {
      entity: L("دورة رواتب يونيو", "June payroll cycle"),
      module: L("الرواتب", "Payroll"),
      stage: L("بدلات كوبري أسيوط", "Assiut Bridge allowances"),
      priority: null,
      sla: L("١٥ من الشهر", "15th of month"),
      elapsed: L("متأخر يومان", "2 days late"),
      state: { text: L("🔴 تذكير ثانٍ + إبلاغ الرواتب", "🔴 2nd reminder + Payroll notified"), variant: "red" },
    },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{L("⏱ لوحة الـ SLA", "⏱ SLA Dashboard")}</h1>
        <p className="text-[12.5px] text-muted">
          {L(
            "عدّادات حية بساعات العمل (الجمعة + العطلات) · أصفر عند ٧٥٪ · تصعيد تلقائي عند التجاوز",
            "Live timers in working hours (Friday off + public holidays) · yellow at 75% · automatic escalation on breach"
          )}
        </p>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <KpiCard label={L("الالتزام هذا الشهر", "Compliance this month")} value={<span className="text-green">91%</span>} tone="up" sub={L("▲ ٤٪ عن مايو", "▲ 4% vs. May")} />
        <KpiCard label={L("مراحل متجاوِزة الآن", "Stages in breach now")} value={<span className="text-red">3</span>} sub={L("صُعّدت تلقائياً", "Auto-escalated")} />
        <KpiCard label={L("متوسط وقت التعيين (P0)", "Avg. Time-to-Hire (P0)")} value={L("١١ يوماً", "11 days")} sub={L("المستهدف: ٩–١٤", "Manual target: 9–14")} />
      </div>

      <Card flush>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {[L("الكيان", "Entity"), L("الموديول", "Module"), L("المرحلة", "Stage"), L("الأولوية", "Priority"), "SLA", L("المنقضي", "Elapsed"), L("الحالة", "State")].map((h, i) => (
                <th key={i} className="border-b-[1.5px] border-line px-2.5 py-2 text-start text-[11.5px] font-bold text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.entity} className="border-b border-line last:border-b-0">
                <td className="px-2.5 py-2.5">{r.entity}</td>
                <td className="px-2.5 py-2.5">{r.module}</td>
                <td className="px-2.5 py-2.5">{r.stage}</td>
                <td className="px-2.5 py-2.5">
                  {r.priority ? <Badge variant={r.priority.variant}>{r.priority.text}</Badge> : "—"}
                </td>
                <td className="px-2.5 py-2.5 text-[12px]">{r.sla}</td>
                <td className="px-2.5 py-2.5 text-[12px]">{r.elapsed}</td>
                <td className="px-2.5 py-2.5">
                  <Badge variant={r.state.variant}>{r.state.text}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Alert variant="yellow" className="mt-3.5">
        {L(
          "📌 ملاحظة معايرة: SLA «فرز P1» صُحّح إلى ٥ أيام عمل (الدليل يقول «٥ ساعات» — خطأ موثّق بانتظار اعتماد الإدارة — قابل للتعديل في الإعدادات)",
          "📌 Calibration note: Screening P1 SLA corrected to 5 working days (manual says 5 hours — documented typo, pending official sign-off — editable in Settings)"
        )}
      </Alert>
    </>
  );
}
