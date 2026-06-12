# 04 — محرك الـ SLA

## الفكرة

كل مرحلة في الدليل لها زمن مستهدف حسب الأولوية: **P0 (حرج/فوري)** و**P1 (قياسي)**. المحرك يقيس الزمن الفعلي لكل مرحلة تلقائياً، يلوّن الحالة، ويصعّد عند التجاوز — بلا أي إدخال يدوي.

## المكونات

### `sla_definitions` (مزروعة بأرقام الدليل، قابلة للتعديل لكل Tenant)
`module` · `stage_key` · `priority` (P0/P1) · `target_value` + `target_unit` (working_hours / working_days / calendar_days / fixed_date) · `warning_threshold_pct` (افتراضي 75%) · `escalate_to_role`.

### `sla_timers`
يُفتح عداد تلقائياً عند دخول الكيان مرحلة (Trigger على تغيير `stage`/`status`): `entity_type/entity_id` · `definition_id` · `started_at` · `due_at` (محسوب بساعات العمل) · `stopped_at` · `state` (green/yellow/red) · `escalated_at`.

### حساب ساعات العمل
دالة `fn_add_working_time(from, amount, unit)` تعتمد على تقويم الـ Tenant (أيام العمل الأسبوعية + جدول العطلات الرسمية المصرية `holidays`). "Same Day" = قبل نهاية يوم العمل نفسه. "Calendar Days" (مهلة قبول العرض) تُحسب بالتقويم العادي.

### الجدولة والتصعيد
مهمة `pg_cron` كل 15 دقيقة تحدّث حالات العدادات:
- **أخضر:** ضمن الوقت • **أصفر:** تجاوز 75% من المهلة → إشعار للمسؤول • **أحمر:** تجاوز المهلة → تصعيد تلقائي (إشعار للدور الأعلى المعرف في `escalate_to_role` + ظهور في لوحة المتأخرات).

## جداول الـ SLA من الدليل (مصدر الزرع)

### التوظيف (Part I)

| المرحلة | المسؤول | P0 | P1 |
|---|---|---|---|
| 1. Hiring Request Initiation | الطالب (PM/مدير القسم) | نفس اليوم | نفس اليوم |
| 2. Sourcing & Screening | Talent Acquisition | 72 ساعة عمل | 5 أيام عمل ⚠️ |
| 3. Requester Review | الطالب | 1 يوم عمل | 72 ساعة عمل |
| 4. Assessment & Interviews | الفني + HSE + TA | 3–5 أيام عمل | 5–7 أيام عمل |
| 5. Final Selection & Approval | الطالب + الفني + TA | 24–48 ساعة عمل | 2–3 أيام عمل |
| 6. Job Offer Issuance | Talent Acquisition | 24–48 ساعة عمل | 2–3 أيام عمل |
| 7. Offer Acceptance | المرشح | 30 يوماً تقويمياً كحد أقصى | 30 يوماً |
| 8. Handover to Personnel | Talent Acquisition | في تاريخ المباشرة | في تاريخ المباشرة |

> ⚠️ **تصحيح موثق:** نص الدليل الأصلي للمرحلة 2: "P1 = 5 Working **Hours**" — وهو خطأ مطبعي ظاهر (لا يُعقل أن يكون القياسي أسرع من الحرج). صُحح إلى **5 أيام عمل** ويُعتمد من الإدارة. القيمة قابلة للتعديل من إعدادات الـ Tenant دون كود.

> المرحلتان ذواتا النطاق (3–5 أيام مثلاً): الحد الأدنى = عتبة الأصفر، الحد الأقصى = عتبة الأحمر.

### الـ Onboarding (Part II)

| المرحلة | المسؤول | P0 | P1 |
|---|---|---|---|
| 1. Onboarding Initiation (Hiring Email) | Talent Acquisition | في تاريخ المباشرة | في تاريخ المباشرة |
| 2. Hiring Notification & Record | Personnel | في تاريخ المباشرة | في تاريخ المباشرة |
| 3. Document Collection & Verification | Personnel | في تاريخ المباشرة | في تاريخ المباشرة |
| 4. Contracting & Compliance | Personnel | في تاريخ المباشرة | في تاريخ المباشرة |
| 5. System Setup Registration | Personnel + TA | في تاريخ المباشرة | في تاريخ المباشرة |
| 6. Equipment & Operational Preparation | IT + Operations + Admin | 1–2 يوم عمل | 3–5 أيام عمل |
| 7. HSE Requirements | HSE | 10–15 يوم عمل | 20–25 يوم عمل |
| 8. Orientation & Induction | HR + HSE + Operations | 7–10 أيام عمل | 20–25 يوم عمل |
| 9. Employment Activation | HR | 7–10 أيام عمل (الوظائف المساندة: نفس اليوم) | 20–25 يوم عمل |

### الـ Offboarding (Part III)

| المرحلة | المسؤول | SLA |
|---|---|---|
| 1. Offboarding Initiation | Personnel | حسب سبب الخروج |
| 2. System Access Deactivation | Personnel + IT | **يوم الخروج — قاعدة إلزامية: كل الـ Access يُقطع بحد أقصى آخر يوم عمل** |
| 3. Knowledge & Task Handover | الموظف + المدير المباشر | حسب سبب الخروج |
| 4. Clearance Process | IT + Ops + HR/Admin + Finance | يوم الخروج |
| 5. Legal & Financial Closure | HR | يوم الخروج |
| 6. File Closure & Archiving | Personnel | يوم الخروج |

> "حسب سبب الخروج": استقالة = فترة الإخطار القانونية، انتهاء عقد/نهاية مشروع = من تاريخ الإخطار حتى آخر يوم، فصل = فوري. تُهيأ كقيم لكل Trigger.

### المالية (Part IV) — مواعيد تقويمية ثابتة وليست P0/P1

محرك الـ SLA نفسه يدير هذه عبر `target_unit = fixed_date` (يوم من الشهر):

| الدورة | المراحل ومواعيدها |
|---|---|
| Payroll | New Hire Sheet يوم **18** → Validation **18–19** → Register Update **18–19** → Project Allocation **20–23** → Deductions **20–23** → Processing **20–23** → Submission للمالية بحد أقصى **25** → الدفع **28–نهاية الشهر** → تقارير التكلفة بالمشروع بحد أقصى **يوم 10** التالي |
| Allowances | الطلب من المشاريع **10–15** → الإعداد **10–15** → التحقق **15–17** → التسليم للمالية بحد أقصى **17** → الدفع **20–25** → تقارير التكلفة بحد أقصى **يوم 10** |
| KPI | ربع سنوية: استلام تقييم PMO → الحساب → التحقق → التسليم → الدفع → تقارير التكلفة |

التأخير عن أي موعد يتطلب تبريراً موثقاً واعتماد الإدارة (Policy 15) — يُنفذ كحقل `delay_justification` إلزامي + اعتماد قبل فتح المرحلة المتأخرة.

## الشاشات

- **SLA Dashboard:** عدادات حية لكل المراحل المفتوحة، مجمعة بالموديول واللون، مع فلاتر (أولوية/مسؤول/مشروع).
- **شريط SLA داخل كل كيان:** في بطاقة طلب التوظيف/الـ Onboarding Case... عداد المرحلة الحالية بلونه.
- **تقارير:** Time-to-Hire فعلي مقابل SLA، نسب الالتزام لكل قسم/مسؤول، أكثر المراحل تجاوزاً.
