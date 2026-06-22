import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { tr } from "@/lib/utils/format";

/**
 * Leave management (demo screen 9) — pending requests with quick actions
 * and the seeded entitlement rules (Egyptian Labor Law). Presentational
 * sample (docs/modules/07-leave.md).
 */
export default async function LeavePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const requests = [
    { emp: L("م. سارة عادل", "Eng. Sara Adel"), type: L("اعتيادية", "Annual"), dur: L("٥ أيام (٢١–٢٥/٠٦)", "5 days (21–25/06)"), bal: "9 → 4", approver: L("مدير PMO", "PMO Manager") },
    { emp: L("محمود النجار", "Mahmoud El-Naggar"), type: L("عارضة", "Casual"), dur: L("يوم (١٥/٠٦)", "1 day (15/06)"), bal: L("4 → 3 (من الاعتيادية)", "4 → 3 (from annual)"), approver: L("مدير الموقع", "Site Manager") },
    { emp: L("م. هاني عبد الفتاح", "Eng. Hany Abdel Fattah"), type: L("مرضية", "Sick"), dur: L("٣ أيام + تقرير طبي", "3 days + medical report attached"), bal: L("٧٥٪ أجر (تأمينات)", "75% pay (social insurance)"), approver: "HR" },
  ];

  const rules = [
    { rule: L("اعتيادية — السنة الأولى (بعد ٦ شهور)", "Annual — first year (after 6 months)"), value: L("١٥ يوماً", "15 days") },
    { rule: L("اعتيادية — بعد سنة", "Annual — after one year"), value: L("٢١ يوماً", "21 days") },
    { rule: L("اعتيادية — ١٠ سنوات خدمة أو سن ٥٠", "Annual — 10 years of service or age 50"), value: L("٣٠ يوماً", "30 days") },
    { rule: L("عارضة (تُخصم من الاعتيادية)", "Casual (deducted from annual)"), value: L("٧ أيام", "7 days") },
    { rule: L("وضع", "Maternity"), value: L("٤ شهور", "4 months") },
    { rule: L("حج/عمرة (بعد ٥ سنوات — مرة)", "Hajj/Umrah (after 5 years — once)"), value: L("شهر", "1 month") },
  ];

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">{L("🏖 إدارة الإجازات", "🏖 Leave Management")}</h1>
        <p className="text-[12.5px] text-muted">
          {L(
            "وفق قانون العمل المصري — الأرصدة تُحتسب تلقائياً من مدة الخدمة والسن",
            "Per Egyptian Labor Law — balances computed automatically from service length and age"
          )}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={L("طلبات بانتظار الاعتماد", "Requests pending approval")} flush>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {[L("الموظف", "Employee"), L("النوع", "Type"), L("المدة", "Duration"), L("الرصيد بعد", "Balance after"), L("المعتمِد", "Approver"), ""].map((h, i) => (
                  <th key={i} className="border-b-[1.5px] border-line px-2 py-2 text-start text-[11.5px] font-bold text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.emp} className="border-b border-line last:border-b-0">
                  <td className="px-2 py-2.5">{r.emp}</td>
                  <td className="px-2 py-2.5">{r.type}</td>
                  <td className="px-2 py-2.5 text-[12px]">{r.dur}</td>
                  <td className="px-2 py-2.5">{r.bal}</td>
                  <td className="px-2 py-2.5 text-[12px]">{r.approver}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex gap-1.5">
                      <Button size="sm" className="bg-green text-white hover:bg-green">
                        {L("اعتماد", "Approve")}
                      </Button>
                      <Button size="sm" variant="danger">
                        {L("رفض", "Reject")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Alert variant="yellow" className="my-3">
            {L(
              "⚠️ تنبيه تداخل: ٣٤٪ من مهندسي موقع بنبان طلبوا إجازة في أسبوع عيد الأضحى — راجِع التغطية",
              "⚠️ Overlap alert: 34% of Benban site engineers requested leave during Eid Al-Adha week — review coverage"
            )}
          </Alert>
        </Card>

        <Card title={L("قواعد الاستحقاق (مزروعة — قابلة للتهيئة)", "Entitlement rules (seeded — configurable)")}>
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {rules.map((r) => (
                <tr key={r.rule} className="border-b border-line last:border-b-0">
                  <td className="py-2.5">{r.rule}</td>
                  <td className="py-2.5 text-end font-bold">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11.5px] text-muted">
            {L(
              "الرصيد غير المستخدم ينتقل تلقائياً للتسوية النهائية عند ترك الخدمة",
              "Unused balance flows automatically into the final settlement at offboarding"
            )}
          </p>
        </Card>
      </div>
    </>
  );
}
