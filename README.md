# AfroHR Hub — نظام HR SaaS لشركات المقاولات والمشاريع الهندسية

نظام موارد بشرية سحابي متعدد الشركات (Multi-Tenant SaaS) موجّه لشركات المقاولات والمشاريع الهندسية في مصر والمنطقة، يدير دورة حياة الموظف كاملة — من طلب التوظيف حتى أرشفة الملف — مع التزام كامل بقانون العمل المصري والتأمينات الاجتماعية.

النظام مبني مباشرة على **دليل عمليات People & Culture** (Hiring, Onboarding, Offboarding, Payroll, Allowances & KPI Management) — كل مرحلة وكل SLA وكل سياسة في الدليل لها مقابل مُنفَّذ في النظام.

> **حالة المشروع:** مرحلة التصميم — هذا المستودع يحتوي حالياً على وثائق التصميم الكاملة. التنفيذ يبدأ في المرحلة التالية وفق [خارطة الطريق](docs/07-roadmap.md).

---

## فهرس الوثائق

### الأساس

| الوثيقة | المحتوى |
|---|---|
| [00 — الرؤية والتموضع](docs/00-vision-and-positioning.md) | الرؤية، التمايز التنافسي، الأدوار، خارطة المراحل |
| [01 — المعمارية](docs/01-architecture.md) | الـ Tech Stack ومبرراته، Multi-Tenancy، التوسع حتى 5000 موظف، طبقة AI، i18n/RTL |
| [02 — نموذج البيانات](docs/02-data-model.md) | ERD + تعريف جداول قاعدة البيانات الكاملة لكل موديولات الـ MVP |
| [03 — الأدوار والصلاحيات](docs/03-rbac-permissions.md) | مصفوفة RBAC للأدوار الـ 13 + صلاحيات مستوى الحقل |
| [04 — محرك الـ SLA](docs/04-sla-engine.md) | محرك قياس P0/P1، ساعات العمل، التلوين، التصعيد التلقائي |
| [05 — محرك الاعتمادات](docs/05-approval-engine.md) | سلاسل الاعتماد القابلة للتهيئة (متسلسل/متوازي/شرطي) |
| [06 — خريطة الشاشات](docs/06-screens-map.md) | كل شاشات النظام + الـ Navigation لكل دور |
| [07 — خارطة الطريق](docs/07-roadmap.md) | MVP ← Phase 2 ← Phase 3 + ترتيب جلسات التنفيذ |

### الموديولات (MVP)

| # | الموديول | مصدره في الدليل |
|---|---|---|
| 1 | [Core HR & Employee Records](docs/modules/01-core-hr.md) | عرضي — يخدم كل الأجزاء |
| 2 | [Recruitment](docs/modules/02-recruitment.md) | Part I — Hiring (8 مراحل) |
| 3 | [Onboarding](docs/modules/03-onboarding.md) | Part II — Onboarding (9 مراحل) |
| 4 | [Offboarding](docs/modules/04-offboarding.md) | Part III — Offboarding (6 مراحل) |
| 5 | [Payroll, Allowances & KPI](docs/modules/05-payroll-allowances-kpi.md) | Part IV + سياسات الالتزام الـ 16 |
| 6 | [Attendance](docs/modules/06-attendance.md) | خارج نطاق الدليل — تصميم مكمّل |
| 7 | [Leave Management](docs/modules/07-leave.md) | خارج نطاق الدليل — قانون العمل المصري |
| 8 | [ESS Portal](docs/modules/08-ess-portal.md) | عرضي — بوابة الموظف |
| 9 | [Notifications](docs/modules/09-notifications.md) | عرضي — Email/WhatsApp/SMS/In-App |

---

## الـ Tech Stack (ملخص)

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui — عربي RTL أولاً مع i18n
- **Backend & Database:** Supabase — PostgreSQL مع Row Level Security للـ Multi-Tenancy، وAuth، وStorage للمستندات
- **المهام الخلفية:** pg_cron + Supabase Edge Functions (محرك SLA، التنبيهات الاستباقية، تقويم الـ Payroll)
- **AI:** Claude API (OCR للمستندات، CV Parsing، تصنيف، Matching، بحث دلالي)
- **النشر:** Vercel

التفاصيل والمبررات في [وثيقة المعمارية](docs/01-architecture.md).
