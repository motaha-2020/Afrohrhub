import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { tr } from "@/lib/utils/format";

/**
 * Audit & compliance log (docs/06 §Audit) — surfaces the append-only
 * `audit_log` (docs/02): who changed/read what, when, before→after. Read
 * access is Company Admin / HR Manager only (docs/03); compensation reads
 * are themselves logged events (Policy 9 + 16). Presentational sample;
 * replaced by the partitioned audit table query later.
 */
type ActionKey =
  | "create"
  | "update"
  | "read_sensitive"
  | "approve"
  | "export"
  | "blocked";

const ACTION_VARIANT: Record<ActionKey, BadgeVariant> = {
  create: "green",
  update: "blue",
  read_sensitive: "purple",
  approve: "green",
  export: "gray",
  blocked: "red",
};

export default async function AuditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const L = (ar: string, en: string) => tr(locale, ar, en);

  const actionLabel: Record<ActionKey, string> = {
    create: L("إنشاء", "Create"),
    update: L("تعديل", "Update"),
    read_sensitive: L("قراءة حسّاسة", "Sensitive read"),
    approve: L("اعتماد", "Approve"),
    export: L("تصدير", "Export"),
    blocked: L("محاولة محظورة", "Blocked attempt"),
  };

  const rows: {
    action: ActionKey;
    entity: string;
    actor: string;
    details: string;
    policy: string;
    at: string;
  }[] = [
    {
      action: "read_sensitive",
      entity: L("employee_compensation · أحمد عبد الحليم", "employee_compensation · Ahmed Abdel Halim"),
      actor: L("منى طه (مدير HR)", "Mona Taha (HR Manager)"),
      details: L("فتح تبويب الرواتب في الملف", "Opened the profile Compensation tab"),
      policy: "Policy 9 + 16",
      at: L("اليوم · ١٠:٤٢ص", "Today · 10:42 AM"),
    },
    {
      action: "approve",
      entity: L("approval_request · سلفة ٨٠٠٠ — محمود النجار", "approval_request · Advance 8,000 — Mahmoud El-Naggar"),
      actor: L("منى طه (مدير HR)", "Mona Taha (HR Manager)"),
      details: L("اعتماد الخطوة ١/٢ بتعليق", "Approved step 1/2 with a comment"),
      policy: "Policy 4 + 7",
      at: L("اليوم · ٠٩:١٥ص", "Today · 9:15 AM"),
    },
    {
      action: "update",
      entity: L("employees · سارة عادل", "employees · Sara Adel"),
      actor: L("مصطفى كامل (شؤون العاملين)", "Mostafa Kamel (Personnel)"),
      details: L("الموبايل: 0111•••• ← 0111••••", "Mobile: 0111•••• → 0111••••"),
      policy: "Policy 16",
      at: L("أمس · ٤:٣٠م", "Yesterday · 4:30 PM"),
    },
    {
      action: "create",
      entity: L("employees · أحمد رجب عطية", "employees · Ahmed Ragab Attia"),
      actor: L("النظام (تسليم من التوظيف)", "System (handover from Recruitment)"),
      details: L("إنشاء ملف الموظف + كود HR", "Created employee file + HR code"),
      policy: "Policy 16",
      at: L("٠١/٠٦ · ٠٨:٠٠ص", "01/06 · 8:00 AM"),
    },
    {
      action: "blocked",
      entity: L("employee_compensation · خالد منصور", "employee_compensation · Khaled Mansour"),
      actor: L("هبة سمير (التوظيف)", "Heba Samir (Talent Acquisition)"),
      details: L("محاولة وصول للرواتب — رُفضت (RLS)", "Attempted compensation access — denied (RLS)"),
      policy: "Policy 9",
      at: L("٠٣/٠٦ · ١١:٢٠ص", "03/06 · 11:20 AM"),
    },
    {
      action: "export",
      entity: L("payroll_items · دورة مايو", "payroll_items · May cycle"),
      actor: L("نرمين لطفي (الرواتب)", "Nermin Lotfy (Payroll)"),
      details: L("تصدير سجل الدورة (CSV) — ٣٢٤٧ صفاً", "Exported cycle register (CSV) — 3,247 rows"),
      policy: "Policy 16",
      at: L("٢٨/٠٥ · ٠٢:٠٥م", "28/05 · 2:05 PM"),
    },
  ];

  const reports = [
    { name: L("تقرير الوصول لبيانات الرواتب (Policy 9)", "Compensation access report (Policy 9)"), period: L("يونيو ٢٠٢٦", "June 2026") },
    { name: L("الالتزام بسلسلة الاعتمادات (Policy 4)", "Approval-chain compliance (Policy 4)"), period: L("الربع الثاني", "Q2 2026") },
    { name: L("سجل تعديلات بيانات الموظفين", "Employee data change log"), period: L("يونيو ٢٠٢٦", "June 2026") },
    { name: L("المحاولات المحظورة (RLS)", "Blocked attempts (RLS)"), period: L("آخر ٩٠ يوماً", "Last 90 days") },
  ];

  const selectClass =
    "rounded-[9px] border border-line bg-card px-3 py-2 text-[12.5px] text-ink";

  return (
    <>
      <div className="mb-[18px]">
        <h1 className="text-[21px] font-bold">
          {L("🧾 سجل التدقيق والالتزام", "🧾 Audit & Compliance Log")}
        </h1>
        <p className="text-[12.5px] text-muted">
          {L(
            "سجل غير قابل للتعديل (Append-only) لكل حدث حسّاس — مَن، متى، القيمة قبل وبعد (Policy 16)",
            "Append-only record of every sensitive event — who, when, before & after (Policy 16)"
          )}
        </p>
      </div>

      <div className="mb-5 grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
        <KpiCard label={L("أحداث اليوم", "Events today")} value="1,284" sub={L("عبر كل الموديولات", "Across all modules")} />
        <KpiCard label={L("قراءات بيانات حسّاسة (الشهر)", "Sensitive reads (month)")} value="312" sub={L("رواتب + تأمينات", "Compensation + insurance")} />
        <KpiCard label={L("محاولات محظورة", "Blocked attempts")} value={<span className="text-red">7</span>} sub={L("رفضتها RLS", "Denied by RLS")} />
        <KpiCard label={L("سياسة الاحتفاظ", "Retention policy")} value={L("لا حذف", "No delete")} sub={<Badge variant="blue">Policy 14</Badge>} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <select className={selectClass} defaultValue="">
          <option value="">{L("كل الجداول", "All tables")}</option>
          <option>employees</option>
          <option>employee_compensation</option>
          <option>approval_requests</option>
          <option>payroll_items</option>
        </select>
        <select className={selectClass} defaultValue="">
          <option value="">{L("كل الإجراءات", "All actions")}</option>
          {(Object.keys(actionLabel) as ActionKey[]).map((k) => (
            <option key={k}>{actionLabel[k]}</option>
          ))}
        </select>
        <select className={selectClass} defaultValue="">
          <option value="">{L("كل المستخدمين", "All users")}</option>
          <option>{L("منى طه", "Mona Taha")}</option>
          <option>{L("مصطفى كامل", "Mostafa Kamel")}</option>
          <option>{L("نرمين لطفي", "Nermin Lotfy")}</option>
        </select>
        <input className={selectClass} placeholder={L("بحث في التفاصيل…", "Search details…")} />
      </div>

      <Card flush title={L("أحدث الأحداث", "Recent events")}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {[
                L("الإجراء", "Action"),
                L("الكيان", "Entity"),
                L("المستخدم", "Actor"),
                L("التفاصيل", "Details"),
                L("السياسة", "Policy"),
                L("الوقت", "Time"),
              ].map((h) => (
                <th
                  key={h}
                  className="border-b-[1.5px] border-line px-2.5 py-2 text-start text-[11.5px] font-bold text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-b-0 hover:bg-[#fafbfd]">
                <td className="px-2.5 py-2.5">
                  <Badge variant={ACTION_VARIANT[r.action]}>{actionLabel[r.action]}</Badge>
                </td>
                <td className="px-2.5 py-2.5 font-mono text-[11.5px]">{r.entity}</td>
                <td className="px-2.5 py-2.5">{r.actor}</td>
                <td className="px-2.5 py-2.5 text-[12px]">{r.details}</td>
                <td className="px-2.5 py-2.5">
                  <Badge variant="gray">{r.policy}</Badge>
                </td>
                <td className="px-2.5 py-2.5 whitespace-nowrap text-[12px] text-muted">{r.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Alert variant="yellow" className="mt-3.5">
        {L(
          "🔒 سجل التدقيق Append-only ومُقسَّم شهرياً — لا يُعدَّل ولا يُحذف، ويُحتفظ به وفق سياسة الاحتفاظ (Policy 14 + 16)",
          "🔒 The audit log is append-only and partitioned monthly — never edited or deleted, retained per policy (Policy 14 + 16)"
        )}
      </Alert>

      <Card className="mt-4" title={L("📑 تقارير الالتزام الجاهزة", "📑 Ready compliance reports")}>
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {reports.map((rep) => (
              <tr key={rep.name} className="border-b border-line last:border-b-0">
                <td className="py-2.5">{rep.name}</td>
                <td className="py-2.5 text-muted">{rep.period}</td>
                <td className="py-2.5 text-end">
                  <Button size="sm" variant="outline">
                    {L("تنزيل", "Download")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
