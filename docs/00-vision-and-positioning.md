# 00 — الرؤية والتموضع

## الرؤية

نظام HR سحابي (SaaS) متعدد الشركات (Multi-Tenant) موجّه لشركات المقاولات والمشاريع الهندسية في مصر والمنطقة، يدير دورة حياة الموظف كاملة من طلب التوظيف حتى أرشفة الملف، مع التزام كامل بقانون العمل المصري والتأمينات الاجتماعية.

النظام رقمنة مباشرة لدليل **People & Culture Operations Manual**: كل مرحلة من مراحله الـ 29 التشغيلية (8 توظيف + 9 Onboarding + 6 Offboarding + 6 مالية رئيسية)، وكل جداول الـ SLA، وكل سياسات الالتزام الـ 16 — مُنفَّذة كقواعد نظام لا كنصوص إرشادية.

## التمايز التنافسي (لماذا نحن وليس Odoo أو ZenHR؟)

1. **Project-Centric Architecture:** كل موظف وتكلفة وعهدة وبدل مرتبط بمشروع (بكود المشروع واسمه) وبنسب تحميل تكلفة (Cost Allocation %) — وهذا جوهر عمل شركات المقاولات ولا تخدمه الأنظمة العامة جيداً. تقارير تكلفة الرواتب والبدلات والـ KPI تصدر **بالمشروع** كما يفرض الدليل (Payroll Stage 9, Allowance Stage 6, KPI Stage 6).
2. **SLA Engine مدمج:** قياس زمن كل مرحلة بنظام الأولويات P0 (حرج/فوري) و P1 (قياسي) تلقائياً — الأرقام مأخوذة من الدليل حرفياً، مع عدادات وتلوين وتصعيد تلقائي.
3. **HSE-First:** الفحص الطبي (إلزامي لمهندسي وريجرز CM/PM) وكورسات السلامة الخمسة (Fire Fighting، First Aid، Electrical Safety، Risk Assessment، Working at Heights) **شرط تفعيل** للموظف وليست إضافة — لا يتحول الموظف Active بدونها.
4. **دعم العمالة الزرقاء:** إشعارات WhatsApp/SMS، واجهات عربية مبسطة، تسجيل دخول برقم الموبايل بدون إيميل شركة.
5. **AI مدمج في كل موديول** وليس طبقة منفصلة: OCR للمستندات، CV Parsing، تصنيف تلقائي، Matching & Ranking، بحث دلالي في الـ Talent Pool، وتنبيهات استباقية.

## الأدوار (RBAC)

| # | الدور | النطاق |
|---|---|---|
| 1 | Super Admin | مزوّد الخدمة — إدارة الـ Tenants والاشتراكات |
| 2 | Company Admin | إدارة كاملة داخل شركته |
| 3 | HR Manager | إشراف على كل موديولات HR |
| 4 | Talent Acquisition | التوظيف (المراحل 1–8) والـ Handover |
| 5 | Personnel | Onboarding، المستندات، العقود، Offboarding |
| 6 | Payroll | الرواتب والبدلات والـ KPI (وصول حصري لبيانات الراتب — Policy 9) |
| 7 | Finance | الدفع والتسويات والاعتمادات المالية |
| 8 | HSE | الفحص الطبي وكورسات السلامة والتقييمات |
| 9 | IT | الإيميلات والـ Access والعهدة التقنية |
| 10 | Operations / Admin | العهدة والتجهيزات والـ Clearance |
| 11 | PMO | تقييمات الـ KPI الربع سنوية |
| 12 | Direct Manager / Project Manager | طلبات التوظيف، مراجعة المرشحين، الـ Handover، اعتمادات فريقه |
| 13 | Employee (ESS) | بياناته ومستنداته وطلباته فقط |

التفاصيل في [مصفوفة الصلاحيات](03-rbac-permissions.md).

## خارطة المراحل

### MVP
Core HR، Recruitment، Onboarding، Attendance، Leave، Payroll & Allowances & KPI، Offboarding، Approval Engine، ESS، Notifications

### Phase 2
Assets (العهدة)، Training & HSE Certs، Probation & Contracts، Performance، Disciplinary

### Phase 3
ATS Portal عام، Manpower Planning، Advanced Analytics، eSignature، Org Chart، AI Copilot الكامل

التفاصيل والترتيب الزمني في [خارطة الطريق](07-roadmap.md).

## مصدر الحقيقة

- **الدليل المرجعي:** People & Culture Operations Manual — 23 صفحة (Afro Egypt).
- أي تعارض بين الوثائق والدليل يُحسم لصالح الدليل، باستثناء التصحيحات الموثقة (مثل الخطأ المطبعي في SLA الفرز P1 — انظر [محرك الـ SLA](04-sla-engine.md)).
- موديولا Attendance و Leave غير موجودين في الدليل وصُمما استكمالاً من قانون العمل المصري واحتياجات مواقع المقاولات، وهما موسومان بذلك في وثائقهما.
