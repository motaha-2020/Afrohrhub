# 01 — المعمارية التقنية

## القرار: Next.js + Supabase + Vercel

**المتطلب الحاكم:** تحمّل 3000–5000 موظف لكل شركة (Tenant)، بعدة شركات على نفس النظام، مع موسمية عالية (إغلاق Payroll أيام 18–28 من كل شهر).

| الطبقة | الاختيار | المبرر |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR للأداء، RSC لتقليل الـ JS المنقول، نضج نظام i18n/RTL |
| UI | Tailwind CSS + shadcn/ui + جداول TanStack | RTL أصيل، مكونات قابلة للتخصيص، جداول ثقيلة البيانات |
| Backend | Supabase (PostgreSQL 15+) | RLS للـ Multi-Tenancy، Auth جاهز (Email + Phone/OTP)، Storage للمستندات، Realtime للإشعارات |
| Business Logic | PostgreSQL Functions + Next.js Server Actions + Edge Functions | المنطق الحرج (Status Engine، Payroll calc) في الـ DB كـ functions تحت RLS؛ التكاملات في Edge Functions |
| مهام مجدولة | pg_cron | محرك SLA، تنبيهات 60/30/7، فتح دورات الـ Payroll تلقائياً وفق التقويم |
| AI | Claude API (claude-sonnet للعمليات، claude-haiku للتصنيف الخفيف) | OCR، CV Parsing، تصنيف مستندات، Matching، بحث دلالي (pgvector) |
| النشر | Vercel (Frontend) + Supabase Cloud (Backend) | صفر إدارة بنية تحتية في مرحلة الإطلاق |

### هل يتحمل 5000 موظف؟

نعم بهامش كبير. تقدير الحجم لأثقل Tenant (5000 موظف):

- `employees` = 5,000 صف، `attendance` = ~5,000 × 26 يوم × 12 شهر ≈ **1.56M صف/سنة** (أكبر جدول)، `payroll_items` ≈ 60K صف/سنة، `audit_log` ≈ بضعة ملايين/سنة.
- PostgreSQL يتعامل مع مئات الملايين من الصفوف؛ المطلوب فقط فهرسة صحيحة (`tenant_id` أول عمود في كل فهرس مركّب) و**تقسيم جدولي الحضور والـ Audit شهرياً (Partitioning)**.
- ذروة الحمل (إغلاق Payroll) عمليات Batch داخل الـ DB وليست تفاعلية — لا تضغط على الواجهة.
- مسار التوسع لاحقاً إن لزم: Read Replicas → ترقية خطة Supabase/الانتقال لـ Postgres مُدار ذاتياً. لا حاجة لتغيير معماري.

## Multi-Tenancy

**النموذج: قاعدة بيانات واحدة، عزل بالصف (Row Isolation) عبر RLS.**

- كل جدول يحمل `tenant_id UUID NOT NULL REFERENCES tenants(id)`.
- سياسة RLS موحدة على كل الجداول: `tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid` — الـ `tenant_id` يُحقن في الـ JWT عند تسجيل الدخول ولا يستطيع العميل تغييره.
- Super Admin (مزود الخدمة) يعمل عبر `service_role` من لوحة تحكم منفصلة، ولا يظهر ضمن مستخدمي الـ Tenant.
- ملفات الـ Storage في Buckets مقسمة بمسار `tenant_id/employee_id/...` مع سياسات Storage RLS مطابقة.
- لماذا ليس Schema-per-Tenant أو DB-per-Tenant؟ حجم 5000 موظف لا يبرر تعقيد إدارة الـ Migrations عبر عشرات الـ Schemas؛ RLS أبسط وأرخص وأكثر أماناً عند الالتزام به في **كل** الجداول بلا استثناء.

## الأمان والالتزام

| المتطلب | التنفيذ | مصدره |
|---|---|---|
| سرية بيانات الراتب | أعمدة الراتب في جدول منفصل `employee_compensation` بسياسة RLS إضافية (أدوار Payroll/HR Manager/Finance فقط) — وليس مجرد إخفاء في الواجهة | Policy 9 |
| Audit Log كامل | Trigger عام على الجداول الحساسة يكتب في `audit_log` (مَن، متى، ماذا تغير قبل/بعد) — جدول Append-only | Policy 16 |
| لا حذف نهائي | Soft-delete + أرشفة فقط (`archived_at`)؛ صلاحية DELETE غير ممنوحة لأي دور | Policy 14 + احتفاظ بالسجلات |
| التحقق من الحساب البنكي | حقل `bank_verified` + لا تمر أي دفعة (راتب/بدل/KPI) لموظف غير مُتحقق | Policy 6 |
| قطع الـ Access آخر يوم عمل | مهمة Offboarding إلزامية بتاريخ استحقاق = آخر يوم عمل + تنبيه تصعيدي | قاعدة إلزامية — Offboarding Stage 2 |
| المستندات | Supabase Storage بروابط موقّتة (Signed URLs)، لا روابط عامة أبداً | — |

## طبقة الذكاء الاصطناعي

طبقة خدمات داخلية واحدة (`ai-service` كـ Edge Functions) تستدعيها الموديولات:

| الخدمة | المدخل | المخرج | يستخدمها |
|---|---|---|---|
| Document OCR | صورة بطاقة/مستند | حقول مهيكلة (اسم، رقم قومي، عنوان...) | Core HR, Onboarding |
| Document Classifier | ملف مرفوع | نوع المستند من الـ 13 + مطابقة الـ Checklist | Core HR, Onboarding |
| NID Validator | رقم قومي 14 خانة | صحة + تاريخ ميلاد + نوع + محافظة | Core HR |
| CV Parser | ملف سيرة ذاتية | بروفايل مرشح مهيكل | Recruitment |
| Matcher & Ranker | طلب توظيف + مرشحون | ترتيب بـ Match % | Recruitment |
| Semantic Search | استعلام نصي حر | نتائج من Talent Pool (pgvector embeddings) | Recruitment |
| JD Generator | مسمى + متطلبات | وصف وظيفي عربي/إنجليزي | Recruitment |

مبدأ التصميم: **الـ AI يقترح والإنسان يعتمد** — كل مخرجات الـ AI تُعرض كمسودة قابلة للتعديل قبل الحفظ، خاصة البيانات القانونية (الرقم القومي، العقود).

## i18n / RTL

- عربي افتراضياً (RTL) + إنجليزي (LTR) من اليوم الأول — `next-intl` مع ملفات رسائل `ar.json` / `en.json`.
- Tailwind بخصائص منطقية (`ms-`/`me-` بدل `ml-`/`mr-`) — لا تكييف يدوي للاتجاه.
- كل الكيانات النصية المزدوجة في الـ DB بعمودين (`name_ar`, `name_en`).
- التواريخ ميلادية بصيغة مصر، والأرقام قابلة للتهيئة (شرقية/غربية) لكل Tenant.

## الإشعارات (ملخص — التفاصيل في موديول 09)

- قنوات: In-App (Supabase Realtime)، Email (Resend)، WhatsApp (WhatsApp Business API)، SMS (مزود محلي مصري).
- WhatsApp/SMS أساسية وليست رفاهية — العمالة الزرقاء بلا إيميل شركة.

## بنية المستودع المستهدفة (عند بدء التنفيذ)

```
apps/web/            ← Next.js (App Router)
  app/[locale]/      ← i18n routing
  modules/           ← مجلد لكل موديول (core-hr, recruitment, ...)
supabase/
  migrations/        ← SQL migrations (الـ Schema من docs/02-data-model.md)
  functions/         ← Edge Functions (ai-service, notifications, sla-engine)
docs/                ← هذه الوثائق
```
