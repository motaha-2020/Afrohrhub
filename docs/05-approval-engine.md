# 05 — محرك الاعتمادات (Approval Engine)

## الفكرة

محرك واحد قابل للتهيئة تستخدمه كل الموديولات بدل منطق اعتماد مكرر. كل ما يحتاج اعتماداً في الدليل يمر من هنا: طلب التوظيف، الاختيار النهائي، عرض العمل، تفعيل الموظف، تعديلات الـ Payroll والسلف (Policy 7)، صرف الرواتب والبدلات والـ KPI (Policy 13)، التسوية النهائية، الإجازات، تبرير تجاوز المواعيد (Policy 15).

## النموذج

### `approval_workflows`
تعريف لكل (نوع كيان + Tenant): `entity_type` (hiring_request / job_offer / payroll_adjustment / final_settlement / leave_request / ...)، `name`، `active`.

### `approval_steps`
خطوات الـ Workflow بالترتيب: `workflow_id`، `step_order`، `approver_type`:
- `role` — أي حامل للدور (مثل HR Manager)
- `specific_user` — شخص محدد
- `manager_chain` — المدير المباشر ثم مديره حتى مستوى N
- `dynamic` — يُحل وقت التشغيل (مثل "مدير مشروع الطلب")

+ `mode` (sequential متسلسل / parallel_all الكل / parallel_any أحدهم)، و`condition jsonb` لتفعيل الخطوة شرطياً — أمثلة:
- طلب توظيف براتب أعلى من سقف معين → خطوة إضافية لـ Company Admin
- سلفة فوق مبلغ معين → اعتماد Finance إضافي
- إحلال (Replacement) → لا يحتاج اعتماد الميزانية الذي يحتاجه New Position

### `approval_requests`
نسخة تشغيلية: `workflow_id`، `entity_type/entity_id`، `current_step`، `status` (pending/approved/rejected/cancelled)، `requested_by`، `payload_snapshot jsonb` (لقطة ما يُعتمد عليه — لا يتغير المحتوى بعد الإرسال).

### `approval_actions`
سجل القرارات: `request_id`، `step_order`، `actor_id`، `decision` (approve/reject/return_for_edit)، `comment`، `at`. الرفض أو الإرجاع يعيد الكيان لحالته السابقة مع إشعار صاحب الطلب بالسبب.

## السلوك

1. الكيان يتحول لحالة `pending_approval` ويُجمّد عن التعديل (أي تعديل = سحب وإعادة إرسال).
2. كل خطوة تُشعر معتمديها (In-App + Email/WhatsApp حسب تفضيل المستخدم) مع رابط مباشر للقرار.
3. عداد SLA اختياري على كل خطوة (تذكير بعد 24 ساعة، تصعيد بعد 48 — قابل للتهيئة).
4. **التفويض:** المعتمد يفوض صلاحياته لفترة (إجازة) — يسجَّل في الـ Audit Log.
5. اكتمال كل الخطوات → الكيان `approved` ويستأنف مساره (مثلاً: طلب التوظيف يدخل Sourcing).
6. كل شيء مسجل: مَن اعتمد، متى، بأي تعليق — يحقق Policy 4 (كل حساب مدعوم بوثائق معتمدة) وPolicy 16 (Audit).

## شاشات

- **صندوق اعتماداتي (My Approvals):** قائمة موحدة عبر كل الموديولات للمعتمد، مع إجراء سريع (اعتماد/رفض/إرجاع) من القائمة مباشرة.
- **مهيئ الـ Workflows (Company Admin / HR Manager):** بناء الخطوات بالسحب، تعريف الشروط، تجربة Dry-Run.
- **مسار الاعتماد داخل الكيان:** Stepper يوضح الخطوات والقرارات وتوقيتاتها.
