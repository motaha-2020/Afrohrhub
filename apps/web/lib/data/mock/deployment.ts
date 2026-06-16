import type { DeploymentEnvVar, PilotMilestone } from "../types";

export const ENV_VARS: DeploymentEnvVar[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", description_en: "Supabase project URL (from Project Settings → API)", description_ar: "رابط مشروع Supabase (من Project Settings ← API)", status: "missing", required: true, phase: 1 },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description_en: "Supabase anon/public key", description_ar: "مفتاح Supabase العام (anon key)", status: "missing", required: true, phase: 1 },
  { key: "SUPABASE_SERVICE_ROLE_KEY", description_en: "Supabase service role key — server-side only, never exposed to browser", description_ar: "مفتاح Supabase الخدمي — من جانب الخادم فقط، لا يُرسَل للمتصفح", status: "missing", required: true, phase: 1 },
  { key: "ANTHROPIC_API_KEY", description_en: "Claude API key — flips AI tools from mock to live inference (Session 11)", description_ar: "مفتاح Claude API — يحوّل أدوات الذكاء الاصطناعي من التجريبي إلى الحي (الجلسة 11)", status: "missing", required: false, phase: 1 },
  { key: "NEXT_PUBLIC_APP_URL", description_en: "Public URL of the deployed app (e.g. https://afrohrhub.vercel.app)", description_ar: "الرابط العام للتطبيق المُنشَر (مثال: https://afrohrhub.vercel.app)", status: "missing", required: true, phase: 1 },
  { key: "WHATSAPP_ACCESS_TOKEN", description_en: "Meta WhatsApp Business API access token (Phase 2)", description_ar: "رمز وصول WhatsApp Business API من Meta (المرحلة الثانية)", status: "optional_missing", required: false, phase: 2 },
  { key: "WHATSAPP_PHONE_NUMBER_ID", description_en: "Meta WhatsApp phone number ID (Phase 2)", description_ar: "معرف رقم هاتف WhatsApp من Meta (المرحلة الثانية)", status: "optional_missing", required: false, phase: 2 },
  { key: "SMS_PROVIDER_API_KEY", description_en: "Egyptian SMS provider API key — e.g. Saudigate / ClickSend (Phase 2)", description_ar: "مفتاح API لمزود SMS المصري — مثال: Saudigate / ClickSend (المرحلة الثانية)", status: "optional_missing", required: false, phase: 2 },
];

export const PILOT_MILESTONES: PilotMilestone[] = [
  { id: "p-01", title_en: "Supabase project created & migrations applied", title_ar: "إنشاء مشروع Supabase وتطبيق الـ Migrations", owner_en: "IT / DevOps", owner_ar: "IT / DevOps", due_date: "2026-06-20", status: "in_progress", note_en: "Run supabase db push in the /supabase directory", note_ar: "شغّل supabase db push من مجلد /supabase" },
  { id: "p-02", title_en: "Vercel project linked & environment variables set", title_ar: "ربط مشروع Vercel وضبط متغيرات البيئة", owner_en: "IT / DevOps", owner_ar: "IT / DevOps", due_date: "2026-06-20", status: "pending" },
  { id: "p-03", title_en: "Seed real company org structure (projects, grades, job titles)", title_ar: "إدخال الهيكل التنظيمي الحقيقي للشركة (مشاريع، درجات، مسميات)", owner_en: "HR Manager", owner_ar: "مدير الموارد البشرية", due_date: "2026-06-22", status: "pending" },
  { id: "p-04", title_en: "Bulk employee import from Excel (Import Tool)", title_ar: "استيراد الموظفين بالجملة من Excel (أداة الاستيراد)", owner_en: "Personnel Team", owner_ar: "فريق شؤون العاملين", due_date: "2026-06-25", status: "pending", note_en: "Use /import wizard — dry-run first, fix errors, then commit", note_ar: "استخدم معالج /import — التشغيل التجريبي أولاً، إصلاح الأخطاء، ثم التثبيت" },
  { id: "p-05", title_en: "Bank verification for all imported employees", title_ar: "التحقق من الحسابات البنكية لكل الموظفين المستوردين", owner_en: "Payroll Team", owner_ar: "فريق الرواتب", due_date: "2026-06-28", status: "pending" },
  { id: "p-06", title_en: "First live payroll cycle (July 2026) — parallel run alongside Excel", title_ar: "أول دورة رواتب حية (يوليو 2026) — تشغيل موازٍ مع Excel", owner_en: "Payroll + Finance", owner_ar: "الرواتب + المالية", due_date: "2026-07-25", status: "pending", note_en: "Run the full 9-stage cycle; compare totals with existing Excel payroll", note_ar: "أتمم الدورة الكاملة بـ 9 مراحل؛ قارن الإجماليات مع Payroll Excel الحالي" },
  { id: "p-07", title_en: "ESS app installed on site supervisors' phones", title_ar: "تثبيت تطبيق ESS على هواتف مشرفي المواقع", owner_en: "IT + Operations", owner_ar: "IT + العمليات", due_date: "2026-07-05", status: "pending" },
  { id: "p-08", title_en: "Attendance GPS check-in live at Benban site (1 week trial)", title_ar: "تسجيل حضور GPS حي في موقع بنبان (أسبوع تجريبي)", owner_en: "Operations Admin", owner_ar: "مدير العمليات", due_date: "2026-07-12", status: "pending" },
  { id: "p-09", title_en: "WhatsApp Business account verified with Meta (Phase 2 prep)", title_ar: "توثيق حساب WhatsApp Business لدى Meta (تحضير المرحلة الثانية)", owner_en: "HR + IT", owner_ar: "HR + IT", due_date: "2026-07-15", status: "pending" },
  { id: "p-10", title_en: "One-month pilot review: accuracy vs Excel, user feedback", title_ar: "مراجعة الشهر التجريبي: دقة مقارنة بـ Excel + آراء المستخدمين", owner_en: "HR Manager", owner_ar: "مدير الموارد البشرية", due_date: "2026-08-05", status: "pending" },
];
