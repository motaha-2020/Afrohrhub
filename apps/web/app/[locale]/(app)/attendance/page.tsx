import { Card } from "@/components/ui/Card";
import { Checklist, type CheckItem } from "@/components/ui/Checklist";
import { KpiCard } from "@/components/ui/KpiCard";
import { tr } from "@/lib/utils/format";

/**
 * Attendance board (demo screen 8) — live site presence across the four
 * capture methods and AI/geofence exceptions. Presentational sample
 * (docs/modules/06-attendance.md).
 */
export default async function AttendancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const sites = [
    { name: L("بنبان — أسوان", "Benban — Aswan"), method: L("GPS + سياج ٤٠٠م", "GPS + 400m geofence"), ratio: "1,058 / 1,120", pct: 94, color: "var(--color-green)" },
    { name: L("أبراج العلمين", "Alamein Towers"), method: L("كشف المشرف (٣ مشرفين)", "Supervisor sheet (3 supervisors)"), ratio: "791 / 846", pct: 93, color: "var(--color-green)" },
    { name: L("كوبري أسيوط", "Assiut Bridge"), method: L("GPS + كشف المشرف", "GPS + supervisor sheet"), ratio: "562 / 633", pct: 89, color: "var(--color-yellow)" },
    { name: L("المقر الرئيسي", "Head Office"), method: L("بصمة", "Biometric"), ratio: "176 / 197", pct: 89, color: "var(--color-yellow)" },
  ];

  const exceptions: CheckItem[] = [
    {
      state: "x",
      label: (
        <span>
          <b>{L("تسجيل GPS خارج النطاق", "GPS check-in out of range")}</b>
          {L(" — عامل بنبان على بُعد ٢.١ كم", " — Benban worker 2.1 km away")}
          <small className="block text-muted">
            {L("طُلبت صورة تحقق تلقائياً", "Verification photo requested automatically")}
          </small>
        </span>
      ),
    },
    {
      state: "warn",
      label: (
        <span>
          <b>{L("نمط مريب (AI)", "Suspicious pattern (AI)")}</b>
          {L(
            " — كشف مشرف العلمين: ١٤ إدخالاً بفارق أقل من ثانية",
            " — Alamein supervisor sheet: 14 entries less than a second apart"
          )}
          <small className="block text-muted">
            {L("أُحيل للعمليات", "Referred to Operations")}
          </small>
        </span>
      ),
    },
    {
      state: "warn",
      label: (
        <span>
          <b>{L("تأخر متكرر", "Repeated lateness")}</b>
          {L(" — كريم فوزي: ٥ مرات هذا الشهر", " — Karim Fawzy: 5 times this month")}
          <small className="block text-muted">
            {L(
              "عند اعتماد خصم → يدخل تعديلات الدورة بمستند واعتماد (Policies 4+7)",
              "If a deduction is approved → enters cycle adjustments with a document and approval (Policies 4+7)"
            )}
          </small>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">
          {L("📍 الحضور — اليوم ١٢/٠٦/٢٠٢٦", "📍 Attendance — Today 12/06/2026")}
        </h1>
        <p className="text-[12.5px] text-muted">
          {L(
            "مباشر من المواقع · ٤ طرق تسجيل: GPS · كشف المشرف · بصمة المكتب · يدوي مبرَّر",
            "Live from sites · 4 capture methods: GPS · supervisor sheet · office biometric · justified manual"
          )}
        </p>
      </div>

      <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={L("حاضر الآن", "Present now")} value={<span className="text-green">2,987</span>} sub={L("٩٢٪ من المتوقع", "92% of expected")} />
        <KpiCard label={L("إجازات معتمدة", "Approved leave")} value="184" sub={L("مُعلَّمة تلقائياً من الإجازات", "Auto-flagged from the Leave module")} />
        <KpiCard label={L("غياب بلا عذر", "Unjustified absence")} value={<span className="text-red">31</span>} sub={L("أُبلغ المديرون", "Managers notified")} />
        <KpiCard label={L("وقت إضافي بانتظار الاعتماد", "Overtime pending approval")} value={<>126 <small className="text-[13px]">{L("ساعة", "hrs")}</small></>} sub={L("لدى المديرين المباشرين", "With direct managers")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={L("🏗 المواقع الآن", "🏗 Sites now")} flush>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {[L("الموقع", "Site"), L("طريقة التسجيل", "Capture method"), L("حاضر/متوقع", "Present/Expected"), ""].map((h, i) => (
                  <th key={i} className="border-b-[1.5px] border-line px-2.5 py-2 text-start text-[11.5px] font-bold text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.name} className="border-b border-line last:border-b-0">
                  <td className="px-2.5 py-2.5">{s.name}</td>
                  <td className="px-2.5 py-2.5 text-[12px]">{s.method}</td>
                  <td className="px-2.5 py-2.5">{s.ratio}</td>
                  <td className="w-[22%] px-2.5 py-2.5">
                    <div className="h-[7px] overflow-hidden rounded-full bg-[#edf0f5]">
                      <i className="block h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title={L("⚠️ استثناءات تحتاج مراجعة", "⚠️ Exceptions needing review")}>
          <Checklist items={exceptions} />
        </Card>
      </div>
    </>
  );
}
