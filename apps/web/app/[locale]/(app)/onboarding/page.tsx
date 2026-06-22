import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checklist, type CheckItem } from "@/components/ui/Checklist";
import { Stepper, type Step } from "@/components/ui/Stepper";
import { tr } from "@/lib/utils/format";

/**
 * Onboarding tracker (demo screen 5) — 9-stage stepper, HSE stage tasks,
 * the six-condition activation gate, and the auto-generated hiring email.
 * Presentational sample (docs/modules/03-onboarding.md).
 */
export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const stages: Step[] = [
    { label: L("البدء", "Initiation"), state: "done" },
    { label: L("إشعار التعيين", "Hiring Notification"), state: "done" },
    { label: L("المستندات", "Documents"), state: "done" },
    { label: L("التعاقد", "Contracting"), state: "done" },
    { label: L("تسجيل بالأنظمة", "System Registration"), state: "done" },
    { label: L("التجهيزات", "Equipment"), state: "done" },
    { label: L("متطلبات HSE", "HSE Requirements"), state: "current" },
    { label: L("التوجيه", "Orientation"), state: "upcoming", marker: "8" },
    { label: L("التفعيل", "Activation"), state: "upcoming", marker: "9" },
  ];

  const hse: CheckItem[] = [
    {
      state: "ok",
      label: (
        <span>
          {L(
            "الفحص الطبي (إلزامي لرافعي CM/PM) — ",
            "Medical exam (mandatory for CM/PM riggers) — "
          )}
          <b>{L("لائق", "Fit")}</b>
        </span>
      ),
      meta: L("٠٥/٠٦ · رُفع نموذج ١١١", "05/06 · Form 111 uploaded"),
    },
    {
      state: "ok",
      label: L("مكافحة الحريق", "Fire Fighting"),
      meta: L("الشهادة ٠٧/٠٦", "Certificate 07/06"),
    },
    {
      state: "ok",
      label: L("الإسعافات الأولية", "First Aid"),
      meta: L("الشهادة ٠٨/٠٦", "Certificate 08/06"),
    },
    {
      state: "warn",
      label: (
        <span>
          {L("العمل على الارتفاعات ", "Working at Heights ")}
          <Badge variant="yellow">
            {L("الدورة غداً ١٣/٠٦", "Course tomorrow 13/06")}
          </Badge>
        </span>
      ),
      meta: L("المسؤول: م. طارق، HSE", "Owner: Eng. Tarek, HSE"),
    },
    {
      state: "pending",
      label: L("تقييم المخاطر", "Risk Assessment"),
      meta: L("مجدول ١٥/٠٦", "Scheduled 15/06"),
    },
  ];

  const gate: CheckItem[] = [
    {
      state: "ok",
      label: L(
        "اكتمال المستندات (١٣/١٣ بعد جمع ٤ هذا الأسبوع)",
        "Documents complete (13/13 after 4 collected this week)"
      ),
    },
    {
      state: "ok",
      label: L(
        "توقيع العقود (العقد + نموذج ١ + إقرار اللائحة)",
        "Contracts signed (contract + Form 1 + Handbook ack.)"
      ),
    },
    {
      state: "warn",
      label: L(
        "متطلبات HSE — متبقٍ دورتان",
        "HSE requirements — 2 courses remaining"
      ),
    },
    {
      state: "ok",
      label: L("الموافقة الطبية — لائق", "Medical clearance — Fit"),
    },
    {
      state: "ok",
      label: L(
        "جاهزية الأنظمة (كود HR صدر · لا بريد مؤسسي — Blue Collar)",
        "Systems ready (HR Code generated · no corporate email — Blue Collar)"
      ),
    },
    {
      state: "ok",
      label: L(
        "الشهادات المطلوبة (مستوى المهارة + رخصة المزاولة ✓)",
        "Required certificates (skill level + practice license ✓)"
      ),
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">
            {L(
              "🚀 Onboarding — أحمد رجب عطية",
              "🚀 Onboarding — Ahmed Ragab Attia"
            )}
          </h1>
          <p className="text-[12.5px] text-muted">
            {L(
              "رافع CM/PM · أبراج العلمين (PRJ-009) · الانضمام ٠١/٠٦/٢٠٢٦ · أولوية P0",
              "CM/PM Rigger · Alamein Towers (PRJ-009) · Joining 01/06/2026 · Priority P0"
            )}
          </p>
        </div>
        <Badge variant="yellow" className="px-4 py-1.5 text-[13px]">
          {L("المرحلة ٧ من ٩ — متطلبات HSE", "Stage 7 of 9 — HSE Requirements")}
        </Badge>
      </div>

      <Card className="mb-4">
        <Stepper steps={stages} />
        <Alert variant="yellow">
          {L(
            "⏱ SLA المرحلة (P0): ١٠–١٥ يوم عمل — مرّ ٨ أيام، يومان حتى حد التحذير",
            "⏱ Stage SLA (P0): 10–15 working days — 8 days elapsed, 2 days to warning threshold"
          )}
        </Alert>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title={
            <span className="flex flex-wrap items-center gap-2">
              {L("🦺 المرحلة ٧: متطلبات HSE", "🦺 Stage 7: HSE Requirements")}
              <Badge variant="red">
                {L("رافع = فحص طبي إلزامي", "Rigger = mandatory medical exam")}
              </Badge>
            </span>
          }
        >
          <Checklist items={hse} />
        </Card>

        <Card
          title={L("🔐 بوابة التفعيل — الشروط الستة", "🔐 Activation Gate — the six conditions")}
        >
          <Checklist items={gate} />
          <Button disabled className="mt-2.5 w-full">
            {L(
              "تفعيل الموظف — معطّل حتى اكتمال كل الشروط (٥/٦)",
              "Activate Employee — disabled until all conditions met (5/6)"
            )}
          </Button>
          <p className="mt-2 text-[11.5px] text-muted">
            {L(
              "بعد الاكتمال تصبح الحالة Active ويدخل كشف التعيينات الجديدة تلقائياً يوم ١٨ (Policy 1)",
              "Once complete, status becomes Active and the employee enters the next New Hire Sheet automatically on the 18th (Policy 1)"
            )}
          </p>
        </Card>
      </div>

      <Card
        className="mt-4"
        title={L(
          "📨 إيميل التعيين (يُولَّد تلقائياً عند التسليم — الـ ١٤ حقلاً)",
          "📨 Hiring Email (auto-generated at handover — the 14 fields)"
        )}
      >
        <p className="text-[12.5px] leading-loose text-muted">
          {L(
            "أحمد رجب عطية · Ahmed Ragab Attia · الرقم القومي 2940112xxxxxxx · 0109 887 2231 · رافع CM/PM · ",
            "Ahmed Ragab Attia · أحمد رجب عطية · National ID 2940112xxxxxxx · 0109 887 2231 · CM/PM Rigger · "
          )}
          <b>PRJ-009</b>
          {L(
            " · أبراج العلمين الجديدة · المدير: م. هاني عبد الفتاح · الموقع: العلمين · صافي الراتب: 🔒 · البدلات: 🔒 · رقم التأمين: 1311xxxx08 · توقيع العقد: ٠١/٠٦/٢٠٢٦ · الانضمام: ٠١/٠٦/٢٠٢٦",
            " · New Alamein Towers · Manager: Eng. Hany Abdel Fattah · Location: Alamein · Net salary: 🔒 · Allowances: 🔒 · SI number: 1311xxxx08 · Contract signing: 01/06/2026 · Joining: 01/06/2026"
          )}
        </p>
      </Card>
    </>
  );
}
