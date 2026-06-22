import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { tr } from "@/lib/utils/format";

/**
 * Recruitment pipeline (demo screen 4) — Kanban across the 8 recruitment
 * stages. Presentational sample data; replaced by the Recruitment module's
 * data-bound board (docs/modules/02-recruitment.md) later.
 */
interface KCard {
  title: string;
  sub: string;
  badges?: { text: string; variant: BadgeVariant }[];
  sla?: { text: string; variant: BadgeVariant };
  cta?: string;
}
interface KColumn {
  title: string;
  count: number;
  cards: KCard[];
}

export default async function RecruitmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const columns: KColumn[] = [
    {
      title: L("٢· التوفير والفرز", "2· Sourcing & Screening"),
      count: 12,
      cards: [
        {
          title: L("م. عمرو السباعي", "Eng. Amr El-Sebaey"),
          sub: L(
            "كهرباء قوى · خبرة ٧ سنوات · متاح فوراً",
            "Power electrical · 7 yrs exp. · available now"
          ),
          badges: [
            { text: L("تطابق ٩٢٪", "Match 92%"), variant: "green" },
            { text: L("التوقع: ضمن النطاق", "Expectation: in range"), variant: "gray" },
          ],
        },
        {
          title: L("م. دينا مجدي", "Eng. Dina Magdy"),
          sub: L(
            "كهرباء تحكم · ٥ سنوات · إشعار شهر",
            "Control electrical · 5 yrs · 1-month notice"
          ),
          badges: [{ text: L("تطابق ٨٧٪", "Match 87%"), variant: "green" }],
        },
        {
          title: L("م. شريف حلمي", "Eng. Sherif Helmy"),
          sub: L("قوى · ٤ سنوات · محطات شمسية", "Power · 4 yrs · solar plants"),
          badges: [
            { text: L("تطابق ٧٤٪", "Match 74%"), variant: "yellow" },
            { text: L("التوقع أعلى من النطاق", "Expectation above range"), variant: "red" },
          ],
        },
      ],
    },
    {
      title: L("٣· مراجعة الطالب", "3· Requester Review"),
      count: 3,
      cards: [
        {
          title: L("م. ياسمين فؤاد", "Eng. Yasmin Fouad"),
          sub: L(
            "بانتظار م. وليد الجندي منذ ٢٢ ساعة",
            "Waiting on Eng. Walid El-Gendy for 22h"
          ),
          sla: { text: L("P0: متبقٍ ساعتان", "P0: 2h left"), variant: "yellow" },
        },
      ],
    },
    {
      title: L("٤· المقابلات", "4· Interviews"),
      count: 4,
      cards: [
        {
          title: L("م. حاتم الشيخ", "Eng. Hatem El-Sheikh"),
          sub: L(
            "فني ✓ ٤.٢/٥ · HSE اليوم ٢:٠٠م · HR غداً",
            "Technical ✓ 4.2/5 · HSE today 2:00 PM · HR tomorrow"
          ),
          badges: [{ text: L("أُرسلت دعوات التقويم", "Calendar invites sent"), variant: "blue" }],
        },
        {
          title: L("م. نهى عبد العزيز", "Eng. Noha Abdel Aziz"),
          sub: L("الفني مجدول الأحد", "Technical scheduled Sunday"),
          badges: [{ text: L("تذكير تلقائي للمُقابِل", "Auto-reminder to interviewer"), variant: "gray" }],
        },
      ],
    },
    {
      title: L("٥· الاختيار النهائي", "5· Final Selection"),
      count: 2,
      cards: [
        {
          title: L("مقارنة: حاتم × كريم", "Compare: Hatem × Karim"),
          sub: L(
            "التقييمات + الرواتب + الإتاحة",
            "Evaluations + salaries + availability"
          ),
          badges: [{ text: L("اعتماد متسلسل ٢/٣", "Sequential approval 2/3"), variant: "purple" }],
        },
      ],
    },
    {
      title: L("٦–٧· العرض والقبول", "6–7· Offer & Acceptance"),
      count: 2,
      cards: [
        {
          title: L("م. حسام الديب", "Eng. Hossam El-Deeb"),
          sub: L(
            "أُرسل العرض ١٨/٠٥ · رابط قبول إلكتروني",
            "Offer sent 18/05 · e-acceptance link"
          ),
          sla: { text: L("نافذة ٣٠ يوم: متبقٍ ٣ أيام", "30-day window: 3 days left"), variant: "yellow" },
        },
        {
          title: L("م. منار صبري", "Eng. Manar Sabry"),
          sub: L("✓ قبلت — الانضمام ٠١/٠٧", "✓ Accepted — joining 01/07"),
          badges: [{ text: L("جاهز للتسليم", "Ready for handover"), variant: "green" }],
        },
      ],
    },
    {
      title: L("٨· التسليم لشؤون العاملين", "8· Handover to Personnel"),
      count: 1,
      cards: [
        {
          title: L("م. منار صبري", "Eng. Manar Sabry"),
          sub: L("الملف مكتمل", "File complete"),
          cta: L("تسليم ← Onboarding", "Handover → Onboarding"),
        },
      ],
    },
  ];

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-[21px] font-bold">
            {L("🎯 التوظيف — Pipeline", "🎯 Recruitment — Pipeline")}
          </h1>
          <p className="text-[12.5px] text-muted">
            {L(
              "١٤ طلب مفتوح · ٨٧ مرشح في الـ Pipeline · متوسط وقت التعيين: ١١ يوم (P0)",
              "14 open requests · 87 candidates in pipeline · Avg. Time-to-Hire: 11 days (P0)"
            )}
          </p>
        </div>
        <Button>{L("+ طلب توظيف", "+ Hiring Request")}</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Badge variant="red">
          {L(
            "⏱ فرز P0 = ٧٢ ساعة — متأخر ٦ ساعات، صُعّد تلقائياً لمدير HR",
            "⏱ Screening SLA P0 = 72h — 6h overdue, auto-escalated to HR Manager"
          )}
        </Badge>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-2.5">
        {columns.map((col) => (
          <div
            key={col.title}
            className="min-w-[240px] max-w-[240px] rounded-card bg-[#eef1f6] p-3"
          >
            <h4 className="mb-2.5 flex items-center justify-between text-[12.5px] font-semibold text-[#3a4860]">
              <span>{col.title}</span>
              <span className="rounded-full bg-card px-2 text-[11px]">
                {col.count}
              </span>
            </h4>
            {col.cards.map((card) => (
              <div
                key={card.title}
                className="mb-2.5 rounded-[10px] border border-line bg-card p-2.5 shadow-card"
              >
                <b className="block text-[12.5px]">{card.title}</b>
                <small className="mt-0.5 mb-1.5 block text-[11px] text-muted">
                  {card.sub}
                </small>
                <div className="flex flex-wrap gap-1.5">
                  {card.badges?.map((b) => (
                    <Badge key={b.text} variant={b.variant}>
                      {b.text}
                    </Badge>
                  ))}
                  {card.sla ? (
                    <Badge variant={card.sla.variant}>{card.sla.text}</Badge>
                  ) : null}
                </div>
                {card.cta ? (
                  <Button
                    size="sm"
                    className="mt-2 w-full bg-green text-white hover:bg-green"
                  >
                    {card.cta}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-2 text-[11.5px] text-muted">
        {L(
          "🤖 ذكاء اصطناعي: ترتيب المرشحين بنسبة التطابق · بحث دلالي في Talent Pool · توليد الوصف الوظيفي · رفض مهذّب تلقائي",
          "🤖 AI: candidate ranking by Match % · semantic Talent Pool search · JD generator · automatic polite rejections"
        )}
      </p>
    </>
  );
}
