-- ============================================================================
-- 0010 — Seed data: demo tenant "Afro Egypt Contracting"
-- Matches demo/afrohrhub-demo.html and the literal numbers of the docs:
--   * 12 document types          — docs/modules/01-core-hr.md
--   * Egyptian leave types       — docs/modules/07-leave.md
--   * SLA definitions            — docs/04-sla-engine.md (verbatim values)
--   * default approval workflows — docs/05-approval-engine.md
--
-- Deterministic UUIDs ('00000000-0000-0000-SSSS-0000000000NN') so tests can
-- reference rows directly. Segment map:
--   0000 tenant · 0001 departments · 0002 grades · 0003 projects ·
--   0004 job_titles · 0005 work_locations · 0006 document_types ·
--   0007 leave_types · 0010 employees · 0011 compensation ·
--   0012 allocations · 0013 employee_documents · 0020 approval workflows ·
--   0021 approval steps · 0030 payroll cycle · 0031 offboarding ·
--   0032 onboarding
--
-- RLS note: this seed runs as the table OWNER (the migration role), which
-- bypasses RLS because 0009 deliberately does NOT use FORCE ROW LEVEL
-- SECURITY. SET LOCAL row_security = off is belt-and-braces.
-- ============================================================================

BEGIN;
SET LOCAL row_security = off;

-- ----------------------------------------------------------------------------
-- Tenant
-- ----------------------------------------------------------------------------
INSERT INTO tenants (id, name_ar, name_en, slug, plan, status, settings) VALUES
('00000000-0000-0000-0000-000000000001',
 'أفرو إيجيبت للمقاولات', 'Afro Egypt Contracting', 'afro-egypt', 'pro', 'active',
 '{"hr_code_format": "AFR-{YYYY}-{####}", "working_days": [0,1,2,3,4], "payroll_day": 25, "locale_default": "ar"}'::jsonb);

-- ----------------------------------------------------------------------------
-- Departments
-- ----------------------------------------------------------------------------
INSERT INTO departments (id, tenant_id, code, name_ar, name_en) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'HR',  'الموارد البشرية', 'HR'),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'FIN', 'المالية', 'Finance'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'IT',  'تكنولوجيا المعلومات', 'IT'),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'HSE', 'الصحة والسلامة والبيئة', 'HSE'),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'OPS', 'العمليات', 'Operations'),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'PMO', 'مكتب إدارة المشاريع', 'PMO'),
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', 'TO',  'المكتب الفني', 'Technical Office');

-- ----------------------------------------------------------------------------
-- Grades: E1–E5 engineers, T1–T4 technicians, M1–M3 management
-- ----------------------------------------------------------------------------
INSERT INTO grades (id, tenant_id, code, name_ar, name_en)
SELECT format('00000000-0000-0000-0002-%s', lpad((row_number() OVER ())::text, 12, '0'))::uuid,
       '00000000-0000-0000-0000-000000000001', g.code, g.ar, g.en
FROM (VALUES
  ('E1', 'مهندس درجة 1', 'Engineer Grade 1'),
  ('E2', 'مهندس درجة 2', 'Engineer Grade 2'),
  ('E3', 'مهندس درجة 3', 'Engineer Grade 3'),
  ('E4', 'مهندس درجة 4', 'Engineer Grade 4'),
  ('E5', 'مهندس درجة 5', 'Engineer Grade 5'),
  ('T1', 'فني درجة 1', 'Technician Grade 1'),
  ('T2', 'فني درجة 2', 'Technician Grade 2'),
  ('T3', 'فني درجة 3', 'Technician Grade 3'),
  ('T4', 'فني درجة 4', 'Technician Grade 4'),
  ('M1', 'إدارة درجة 1', 'Management Grade 1'),
  ('M2', 'إدارة درجة 2', 'Management Grade 2'),
  ('M3', 'إدارة درجة 3', 'Management Grade 3')
) AS g(code, ar, en);

-- ----------------------------------------------------------------------------
-- Work locations (geofence for GPS attendance)
-- ----------------------------------------------------------------------------
INSERT INTO work_locations (id, tenant_id, code, name_ar, name_en, type, geofence_lat, geofence_lng, geofence_radius_m) VALUES
('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0000-000000000001', 'HQ',      'المكتب الرئيسي — القاهرة', 'Head Office — Cairo', 'office', 30.044420, 31.235712, 200),
('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0000-000000000001', 'BENBAN',  'موقع بنبان — أسوان', 'Benban Site — Aswan', 'site', 24.457400, 32.742600, 1000),
('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000001', 'ALAMEIN', 'موقع العلمين الجديدة', 'New Alamein Site', 'site', 30.839000, 28.954400, 1000),
('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0000-000000000001', 'ASSIUT',  'موقع كوبري أسيوط', 'Assiut Bridge Site', 'site', 27.180900, 31.183700, 800),
('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0000-000000000001', 'SOKHNA',  'موقع العين السخنة', 'Ain Sokhna Site', 'site', 29.598100, 32.308900, 1000);

-- ----------------------------------------------------------------------------
-- Projects (the 5 demo projects)
-- ----------------------------------------------------------------------------
INSERT INTO projects (id, tenant_id, code, name_ar, name_en, status, location_id) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'PRJ-014', 'محطة محولات بنبان 500 ك.ف', 'Benban 500kV Substation', 'active', '00000000-0000-0000-0005-000000000002'),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'PRJ-009', 'أبراج العلمين الجديدة', 'New Alamein Towers', 'active', '00000000-0000-0000-0005-000000000003'),
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'PRJ-021', 'كوبري النيل — أسيوط', 'Nile Bridge — Assiut', 'active', '00000000-0000-0000-0005-000000000004'),
('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'PRJ-017', 'مصنع أسمنت العين السخنة', 'Ain Sokhna Cement Plant', 'active', '00000000-0000-0000-0005-000000000005'),
('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'HQ-001',  'المكتب الرئيسي', 'Head Office', 'active', '00000000-0000-0000-0005-000000000001');

-- ----------------------------------------------------------------------------
-- Job titles
-- ----------------------------------------------------------------------------
INSERT INTO job_titles (id, tenant_id, code, name_ar, name_en, grade_id) VALUES
('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001', 'CIV-ENG',  'مهندس موقع مدني', 'Civil Site Engineer', '00000000-0000-0000-0002-000000000003'),
('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001', 'WELD-AR',  'لحام أرجون', 'Argon Welder', '00000000-0000-0000-0002-000000000007'),
('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001', 'PMO-PLN',  'مهندس تخطيط PMO', 'PMO Planning Engineer', '00000000-0000-0000-0002-000000000002'),
('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000001', 'RIGGER',   'ريجر أوناش CM/PM', 'CM/PM Rigger', '00000000-0000-0000-0002-000000000006'),
('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0000-000000000001', 'SITE-ACC', 'محاسب موقع', 'Site Accountant', '00000000-0000-0000-0002-000000000002'),
('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0000-000000000001', 'ELEC-INS', 'فني تركيبات كهربائية', 'Electrical Installer', '00000000-0000-0000-0002-000000000007'),
('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0000-000000000001', 'CM',       'مدير إنشاءات', 'Construction Manager', '00000000-0000-0000-0002-000000000011'),
('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0000-000000000001', 'PM',       'مدير مشروع', 'Project Manager', '00000000-0000-0000-0002-000000000012');

-- ----------------------------------------------------------------------------
-- The 12 document types of the manual (module 01, Onboarding Stage 3).
-- Type #13 in the manual = "tenant custom types" → added by tenants at runtime.
-- ----------------------------------------------------------------------------
INSERT INTO document_types (id, tenant_id, name_ar, name_en, applies_to, is_original, requires_expiry) VALUES
('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000001', 'شهادة ميلاد كمبيوتر', 'Computer Birth Certificate', 'all', true,  false),
('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0000-000000000001', 'شهادة المؤهل الدراسي', 'Education Qualification Certificate', 'all', true,  false),
('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0000-000000000001', 'شهادة الخدمة العسكرية', 'Military Service Certificate', 'all', true,  false),
('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0000-000000000001', 'نموذج 6 تأمينات أو برنت رسمي', 'Social Insurance Form 6 / Official Print', 'all', false, false),
('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0000-000000000001', 'كعب العمل', 'Work Record (Ka''b Amal)', 'all', false, false),
('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0000-000000000001', 'فيش جنائي باسم الشركة', 'Criminal Record Check (issued in company name)', 'all', false, true),
('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0000-000000000001', 'ست صور شخصية حديثة', 'Six Recent Personal Photos', 'all', false, false),
('00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0000-000000000001', 'صورتان من بطاقة سارية', 'Two Copies of Valid National ID', 'all', false, true),
('00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0000-000000000001', 'تقرير الفحص الطبي — نموذج 111', 'Medical Examination Report — Form 111', 'all', false, true),
('00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0000-000000000001', 'صورتان من كارنيه نقابة المهندسين', 'Two Copies of Engineers Syndicate Card', 'engineers', false, true),
('00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0000-000000000001', 'شهادة قياس مستوى مهارة', 'Skill Level Measurement Certificate', 'technicians', false, false),
('00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0000-000000000001', 'ترخيص مزاولة المهنة', 'Trade Practice License', 'technicians', false, true);

-- ----------------------------------------------------------------------------
-- Leave types — Egyptian labor law (module 07). Official holidays are not a
-- leave type: they come from the holidays table automatically.
-- ----------------------------------------------------------------------------
INSERT INTO leave_types (id, tenant_id, code, name_ar, name_en, max_days, rules) VALUES
('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0000-000000000001', 'ANNUAL', 'سنوية', 'Annual', 21,
 '{"first_year_days": 15, "first_year_eligible_after_months": 6, "days_after_10_years_service_or_age_50": 30, "cash_out_unused_on_exit": true}'::jsonb),
('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0000-000000000001', 'CASUAL', 'عارضة', 'Casual', 7,
 '{"max_consecutive_days": 2, "deducted_from_annual": true}'::jsonb),
('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0000-000000000001', 'SICK', 'مرضية', 'Sick', NULL,
 '{"requires_medical_report": true, "pay_pct": 75, "per_social_insurance_rules": true}'::jsonb),
('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0000-000000000001', 'MATERNITY', 'وضع', 'Maternity', 120,
 '{"months": 4, "max_times_during_service": 2, "law": "Labor Law 14/2025"}'::jsonb),
('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0000-000000000001', 'PILGRIMAGE', 'حج / عمرة', 'Pilgrimage', 30,
 '{"once_during_service": true, "min_service_years": 5}'::jsonb),
('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0000-000000000001', 'UNPAID', 'بدون أجر', 'Unpaid', NULL,
 '{"special_approval": true, "suspends_accruals": true, "payroll_deduction": true}'::jsonb);

-- ----------------------------------------------------------------------------
-- Holidays (fixed-date Egyptian official holidays for 2026; Islamic-calendar
-- holidays are inserted per-year by the tenant admin)
-- ----------------------------------------------------------------------------
INSERT INTO holidays (tenant_id, holiday_date, name_ar, name_en) VALUES
('00000000-0000-0000-0000-000000000001', '2026-01-07', 'عيد الميلاد المجيد', 'Coptic Christmas'),
('00000000-0000-0000-0000-000000000001', '2026-04-25', 'عيد تحرير سيناء', 'Sinai Liberation Day'),
('00000000-0000-0000-0000-000000000001', '2026-05-01', 'عيد العمال', 'Labour Day'),
('00000000-0000-0000-0000-000000000001', '2026-06-30', 'ثورة 30 يونيو', 'June 30 Revolution'),
('00000000-0000-0000-0000-000000000001', '2026-07-23', 'عيد ثورة 23 يوليو', 'July 23 Revolution Day'),
('00000000-0000-0000-0000-000000000001', '2026-10-06', 'عيد القوات المسلحة', 'Armed Forces Day');

-- ----------------------------------------------------------------------------
-- Employees (8, matching demo/afrohrhub-demo.html).
-- National IDs are structurally valid: century-YYMMDD-governorate-sequence,
-- 13th digit parity matches gender, embedded date matches birth_date.
-- Managers first (FK direct_manager_id).
-- ----------------------------------------------------------------------------
INSERT INTO employees (id, tenant_id, hr_code, name_ar, name_en, national_id, birth_date, gender, governorate,
                       mobile, work_email, job_title_id, grade_id, department_id, employment_type, collar,
                       hire_date, contract_signing_date, status, requires_medical_exam, safety_sensitive_role) VALUES
-- managers
('00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0000-000000000001', 'AFR-2019-0021',
 'وليد الجندي', 'Walid El-Gendy', '28002110101532', '1980-02-11', 'male', 'Cairo',
 '01001112233', 'w.elgendy@afroegypt.com',
 '00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0002-000000000011', '00000000-0000-0000-0001-000000000005',
 'permanent', 'white', '2019-04-01', '2019-04-01', 'active', false, false),
('00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0000-000000000001', 'AFR-2018-0007',
 'هاني عبد الفتاح', 'Hany Abdel Fattah', '27806251401718', '1978-06-25', 'male', 'Qalyubia',
 '01002223344', 'h.abdelfattah@afroegypt.com',
 '00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0002-000000000012', '00000000-0000-0000-0001-000000000005',
 'permanent', 'white', '2018-02-01', '2018-02-01', 'active', false, false);

INSERT INTO employees (id, tenant_id, hr_code, name_ar, name_en, national_id, birth_date, gender, governorate,
                       mobile, work_email, job_title_id, grade_id, department_id, direct_manager_id,
                       employment_type, collar, hire_date, contract_signing_date, status,
                       requires_medical_exam, safety_sensitive_role) VALUES
('00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0000-000000000001', 'AFR-2024-0312',
 'أحمد عبد الحليم سعد', 'Ahmed Abdel Halim Saad', '29005140102357', '1990-05-14', 'male', 'Cairo',
 '01002345678', 'a.abdelhalim@afroegypt.com',
 '00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000005',
 '00000000-0000-0000-0010-000000000001', 'project', 'white', '2024-03-15', '2024-03-10', 'active', false, false),
('00000000-0000-0000-0010-000000000004', '00000000-0000-0000-0000-000000000001', 'AFR-2023-0871',
 'محمود سيد النجار', 'Mahmoud Sayed El-Naggar', '28811021303172', '1988-11-02', 'male', 'Sharqia',
 '01003456789', NULL,
 '00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000005',
 '00000000-0000-0000-0010-000000000001', 'project', 'blue', '2023-07-10', '2023-07-05', 'active', false, true),
('00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0000-000000000001', 'AFR-2025-0044',
 'سارة عادل توفيق', 'Sara Adel Tawfik', '29607230204861', '1996-07-23', 'female', 'Alexandria',
 '01004567890', 's.adel@afroegypt.com',
 '00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000006',
 '00000000-0000-0000-0010-000000000002', 'permanent', 'white', '2025-01-05', '2025-01-02', 'active', false, false),
('00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0000-000000000001', 'AFR-2022-0540',
 'كريم فوزي الشناوي', 'Karim Fawzy El-Shenawy', '29309181701134', '1993-09-18', 'male', 'Monufia',
 '01005678901', NULL,
 '00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000005',
 '00000000-0000-0000-0010-000000000001', 'project', 'blue', '2022-11-01', '2022-10-28', 'active', false, true),
('00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0000-000000000001', 'AFR-2021-0233',
 'خالد منصور إبراهيم', 'Khaled Mansour Ibrahim', '28503301501351', '1985-03-30', 'male', 'Kafr El Sheikh',
 '01006789012', 'k.mansour@afroegypt.com',
 '00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002',
 '00000000-0000-0000-0010-000000000002', 'permanent', 'white', '2021-05-02', '2021-04-28', 'offboarding', false, false),
('00000000-0000-0000-0010-000000000008', '00000000-0000-0000-0000-000000000001', 'AFR-2026-0119',
 'أحمد رجب عطية', 'Ahmed Ragab Attia', '29401121234577', '1994-01-12', 'male', 'Dakahlia',
 '01098872231', NULL,
 '00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000005',
 '00000000-0000-0000-0010-000000000002', 'project', 'blue', '2026-06-01', '2026-06-01', 'pending', true, true);

-- project managers (after employees exist)
UPDATE projects SET project_manager_id = '00000000-0000-0000-0010-000000000001'
 WHERE id IN ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0003-000000000004');
UPDATE projects SET project_manager_id = '00000000-0000-0000-0010-000000000002'
 WHERE id IN ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0003-000000000003');

-- ----------------------------------------------------------------------------
-- Compensation — bank_verified = true except the pending hire Ahmed Ragab
-- (Policy 6 demo: his payroll insert must fail).
-- ----------------------------------------------------------------------------
INSERT INTO employee_compensation (id, tenant_id, employee_id, net_salary, gross_salary, insurable_salary,
                                   allowances, bank_name, bank_account, bank_verified, bank_verified_at) VALUES
('00000000-0000-0000-0011-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000001',
 65000, 78000, 14000, '{"site": 6000, "car": 4000}'::jsonb, 'CIB', 'EG380010001234567890123451', true, now()),
('00000000-0000-0000-0011-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000002',
 80000, 96000, 14000, '{"site": 6000, "car": 5000}'::jsonb, 'CIB', 'EG380010001234567890123452', true, now()),
('00000000-0000-0000-0011-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000003',
 28000, 34000, 12000, '{"site": 3000}'::jsonb, 'Banque Misr', 'EG380010001234567890123453', true, now()),
('00000000-0000-0000-0011-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000004',
 18000, 21000, 10000, '{"site": 2000, "hazard": 1500}'::jsonb, 'NBE', 'EG380010001234567890123454', true, now()),
('00000000-0000-0000-0011-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000005',
 24000, 29000, 12000, '{}'::jsonb, 'CIB', 'EG380010001234567890123455', true, now()),
('00000000-0000-0000-0011-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000006',
 15000, 17500, 9000, '{"site": 1500}'::jsonb, 'NBE', 'EG380010001234567890123456', true, now()),
('00000000-0000-0000-0011-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000007',
 22000, 26500, 11000, '{}'::jsonb, 'Banque du Caire', 'EG380010001234567890123457', true, now()),
-- pending hire: bank NOT verified yet (Policy 6)
('00000000-0000-0000-0011-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 14000, 16500, 9000, '{"site": 1500, "hazard": 1000}'::jsonb, 'NBE', 'EG380010001234567890123458', false, NULL);

-- ----------------------------------------------------------------------------
-- Project allocations (Policy 12). Ahmed Abdel Halim: Benban 80% + HQ 20%.
-- ----------------------------------------------------------------------------
INSERT INTO employee_project_allocations (id, tenant_id, employee_id, project_id, allocation_pct, work_location_id, start_date) VALUES
('00000000-0000-0000-0012-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0003-000000000001', 80, '00000000-0000-0000-0005-000000000002', '2026-01-15'),
('00000000-0000-0000-0012-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0003-000000000005', 20, '00000000-0000-0000-0005-000000000001', '2026-01-15'),
('00000000-0000-0000-0012-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000004', '00000000-0000-0000-0003-000000000004', 100, '00000000-0000-0000-0005-000000000005', '2023-07-10'),
('00000000-0000-0000-0012-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0003-000000000005', 100, '00000000-0000-0000-0005-000000000001', '2025-01-05'),
('00000000-0000-0000-0012-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0003-000000000001', 100, '00000000-0000-0000-0005-000000000002', '2022-11-01'),
('00000000-0000-0000-0012-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0003-000000000003', 100, '00000000-0000-0000-0005-000000000004', '2021-05-02'),
('00000000-0000-0000-0012-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008', '00000000-0000-0000-0003-000000000002', 100, '00000000-0000-0000-0005-000000000003', '2026-06-01'),
('00000000-0000-0000-0012-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0003-000000000001', 100, '00000000-0000-0000-0005-000000000002', '2019-04-01'),
('00000000-0000-0000-0012-000000000009', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0003-000000000002', 100, '00000000-0000-0000-0005-000000000003', '2018-02-01');

-- ----------------------------------------------------------------------------
-- Sample document vault rows (matching demo alerts)
-- ----------------------------------------------------------------------------
INSERT INTO employee_documents (id, tenant_id, employee_id, document_type_id, status, file_path, expiry_date,
                                original_received, received_at) VALUES
-- Ahmed Abdel Halim — complete file
('00000000-0000-0000-0013-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000003',
 '00000000-0000-0000-0006-000000000001', 'verified', 'docs/emp3/birth_cert.pdf', NULL, true, now()),
('00000000-0000-0000-0013-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000003',
 '00000000-0000-0000-0006-000000000008', 'verified', 'docs/emp3/national_id.pdf', '2030-05-14', false, now()),
-- Mahmoud — practice license expiring in ~28 days (demo alert)
('00000000-0000-0000-0013-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000004',
 '00000000-0000-0000-0006-000000000012', 'received', 'docs/emp4/practice_license.pdf', '2026-07-10', false, now()),
('00000000-0000-0000-0013-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000004',
 '00000000-0000-0000-0006-000000000011', 'verified', 'docs/emp4/skill_cert.pdf', NULL, false, now()),
-- Karim — criminal record cert expiring in 7 days (demo alert)
('00000000-0000-0000-0013-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000006',
 '00000000-0000-0000-0006-000000000006', 'received', 'docs/emp6/criminal_record.pdf', '2026-06-19', false, now()),
-- Ahmed Ragab (pending) — 4 documents still missing (blocks activation, demo "9/13")
('00000000-0000-0000-0013-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 '00000000-0000-0000-0006-000000000001', 'received', 'docs/emp8/birth_cert.pdf', NULL, true, now()),
('00000000-0000-0000-0013-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 '00000000-0000-0000-0006-000000000004', 'required', NULL, NULL, false, NULL),
('00000000-0000-0000-0013-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 '00000000-0000-0000-0006-000000000006', 'required', NULL, NULL, false, NULL),
('00000000-0000-0000-0013-000000000009', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 '00000000-0000-0000-0006-000000000009', 'required', NULL, NULL, false, NULL),
('00000000-0000-0000-0013-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 '00000000-0000-0000-0006-000000000011', 'required', NULL, NULL, false, NULL);

-- ----------------------------------------------------------------------------
-- Default approval workflows (docs/05): hiring_request, leave_request,
-- payroll_adjustment, final_settlement
-- ----------------------------------------------------------------------------
INSERT INTO approval_workflows (id, tenant_id, entity_type, name, active) VALUES
('00000000-0000-0000-0020-000000000001', '00000000-0000-0000-0000-000000000001', 'hiring_request',     'Default hiring request approval', true),
('00000000-0000-0000-0020-000000000002', '00000000-0000-0000-0000-000000000001', 'leave_request',      'Default leave approval', true),
('00000000-0000-0000-0020-000000000003', '00000000-0000-0000-0000-000000000001', 'payroll_adjustment', 'Default payroll adjustment approval (Policy 7)', true),
('00000000-0000-0000-0020-000000000004', '00000000-0000-0000-0000-000000000001', 'final_settlement',   'Default final settlement approval (Policy 13)', true);

INSERT INTO approval_steps (id, tenant_id, workflow_id, step_order, approver_type, approver_role, mode, condition) VALUES
-- hiring_request: HR Manager → Company Admin (extra step only above salary cap)
('00000000-0000-0000-0021-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000001', 1, 'role', 'hr_manager', 'sequential', NULL),
('00000000-0000-0000-0021-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000001', 2, 'role', 'company_admin', 'sequential', '{"when": {"salary_range_max_gt": 50000}}'::jsonb),
-- leave_request: direct manager → HR Manager for special types
('00000000-0000-0000-0021-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000002', 1, 'manager_chain', NULL, 'sequential', NULL),
('00000000-0000-0000-0021-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000002', 2, 'role', 'hr_manager', 'sequential', '{"when": {"leave_type_in": ["MATERNITY", "PILGRIMAGE", "UNPAID"]}}'::jsonb),
-- payroll_adjustment: HR Manager → Finance (Policy 7)
('00000000-0000-0000-0021-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000003', 1, 'role', 'hr_manager', 'sequential', NULL),
('00000000-0000-0000-0021-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000003', 2, 'role', 'finance', 'sequential', NULL),
-- final_settlement: HR Manager → Finance before payout (Policy 13)
('00000000-0000-0000-0021-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000004', 1, 'role', 'hr_manager', 'sequential', NULL),
('00000000-0000-0000-0021-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0020-000000000004', 2, 'role', 'finance', 'sequential', NULL);

-- ----------------------------------------------------------------------------
-- SLA definitions — VERBATIM from docs/04-sla-engine.md.
-- Ranged targets ("3–5 days"): target_value = range max (red threshold),
-- warning_threshold_pct = round(min/max × 100) (yellow threshold).
-- "Same day" = 1 working day, meaning end of the same working day.
-- ----------------------------------------------------------------------------
INSERT INTO sla_definitions (tenant_id, module, stage_key, priority, target_value, target_unit, warning_threshold_pct, escalate_to_role) VALUES
-- Recruitment (Part I) — 8 stages × P0/P1
('00000000-0000-0000-0000-000000000001', 'recruitment', 'hiring_request_initiation', 'P0', 1, 'working_days', 75, 'hr_manager'),  -- same day
('00000000-0000-0000-0000-000000000001', 'recruitment', 'hiring_request_initiation', 'P1', 1, 'working_days', 75, 'hr_manager'),  -- same day
('00000000-0000-0000-0000-000000000001', 'recruitment', 'sourcing_screening',        'P0', 72, 'working_hours', 75, 'hr_manager'),
-- documented correction (docs/04): manual said "5 working HOURS" — typo, approved as 5 working DAYS
('00000000-0000-0000-0000-000000000001', 'recruitment', 'sourcing_screening',        'P1', 5, 'working_days', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'recruitment', 'requester_review',          'P0', 1, 'working_days', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'recruitment', 'requester_review',          'P1', 72, 'working_hours', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'recruitment', 'assessment_interviews',     'P0', 5, 'working_days', 60, 'hr_manager'),  -- range 3–5
('00000000-0000-0000-0000-000000000001', 'recruitment', 'assessment_interviews',     'P1', 7, 'working_days', 71, 'hr_manager'),  -- range 5–7
('00000000-0000-0000-0000-000000000001', 'recruitment', 'final_selection_approval',  'P0', 48, 'working_hours', 50, 'hr_manager'), -- range 24–48
('00000000-0000-0000-0000-000000000001', 'recruitment', 'final_selection_approval',  'P1', 3, 'working_days', 67, 'hr_manager'),  -- range 2–3
('00000000-0000-0000-0000-000000000001', 'recruitment', 'job_offer_issuance',        'P0', 48, 'working_hours', 50, 'hr_manager'), -- range 24–48
('00000000-0000-0000-0000-000000000001', 'recruitment', 'job_offer_issuance',        'P1', 3, 'working_days', 67, 'hr_manager'),  -- range 2–3
('00000000-0000-0000-0000-000000000001', 'recruitment', 'offer_acceptance',          'P0', 30, 'calendar_days', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'recruitment', 'offer_acceptance',          'P1', 30, 'calendar_days', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'recruitment', 'handover_to_personnel',     'P0', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'recruitment', 'handover_to_personnel',     'P1', NULL, 'on_joining_date', 75, 'hr_manager'),
-- Onboarding (Part II) — stages 1–5 on joining date, 6–9 ranged
('00000000-0000-0000-0000-000000000001', 'onboarding', 'onboarding_initiation',       'P0', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'onboarding_initiation',       'P1', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'hiring_notification_record',  'P0', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'hiring_notification_record',  'P1', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'document_collection',         'P0', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'document_collection',         'P1', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'contracting_compliance',      'P0', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'contracting_compliance',      'P1', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'system_setup',                'P0', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'system_setup',                'P1', NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'onboarding', 'equipment_preparation',       'P0', 2, 'working_days', 50, 'hr_manager'),  -- range 1–2
('00000000-0000-0000-0000-000000000001', 'onboarding', 'equipment_preparation',       'P1', 5, 'working_days', 60, 'hr_manager'),  -- range 3–5
('00000000-0000-0000-0000-000000000001', 'onboarding', 'hse_requirements',            'P0', 15, 'working_days', 67, 'hr_manager'), -- range 10–15
('00000000-0000-0000-0000-000000000001', 'onboarding', 'hse_requirements',            'P1', 25, 'working_days', 80, 'hr_manager'), -- range 20–25
('00000000-0000-0000-0000-000000000001', 'onboarding', 'orientation_induction',       'P0', 10, 'working_days', 70, 'hr_manager'), -- range 7–10
('00000000-0000-0000-0000-000000000001', 'onboarding', 'orientation_induction',       'P1', 25, 'working_days', 80, 'hr_manager'), -- range 20–25
('00000000-0000-0000-0000-000000000001', 'onboarding', 'employment_activation',       'P0', 10, 'working_days', 70, 'hr_manager'), -- range 7–10 (support roles: same day)
('00000000-0000-0000-0000-000000000001', 'onboarding', 'employment_activation',       'P1', 25, 'working_days', 80, 'hr_manager'), -- range 20–25
-- Offboarding (Part III) — exit-day stages; anchor date = last_working_day.
-- Stages 1 (initiation) and 3 (handover) depend on the exit trigger
-- (resignation = legal notice period, termination = immediate) and are
-- configured per tenant — not seeded with a fixed number.
('00000000-0000-0000-0000-000000000001', 'offboarding', 'system_access_deactivation', NULL, NULL, 'on_joining_date', 75, 'company_admin'), -- MANDATORY: at most last working day
('00000000-0000-0000-0000-000000000001', 'offboarding', 'clearance_process',          NULL, NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'offboarding', 'legal_financial_closure',    NULL, NULL, 'on_joining_date', 75, 'hr_manager'),
('00000000-0000-0000-0000-000000000001', 'offboarding', 'file_closure_archiving',     NULL, NULL, 'on_joining_date', 75, 'hr_manager'),
-- Payroll (Part IV) — fixed calendar dates (Policy 2): 18/19/23/25/28/10
('00000000-0000-0000-0000-000000000001', 'payroll', 'new_hires',            NULL, 18, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'validation',           NULL, 19, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'register_updated',     NULL, 19, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'allocations_review',   NULL, 23, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'adjustments',          NULL, 23, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'processing',           NULL, 23, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'submitted_to_finance', NULL, 25, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'paid',                 NULL, 28, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'payroll', 'cost_reported',        NULL, 10, 'fixed_date', 75, 'finance'), -- day 10 of the NEXT month
-- Allowances (Part IV) — request 10–15 → prep 10–15 → verify 15–17 → handover ≤17 → pay 20–25 → cost report ≤10
('00000000-0000-0000-0000-000000000001', 'allowance', 'request_from_projects', NULL, 15, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'allowance', 'preparation',           NULL, 15, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'allowance', 'verification',          NULL, 17, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'allowance', 'handover_to_finance',   NULL, 17, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'allowance', 'payment',               NULL, 25, 'fixed_date', 75, 'finance'),
('00000000-0000-0000-0000-000000000001', 'allowance', 'cost_reported',         NULL, 10, 'fixed_date', 75, 'finance');

-- ----------------------------------------------------------------------------
-- A current payroll cycle (June 2026) for smoke tests
-- ----------------------------------------------------------------------------
INSERT INTO payroll_cycles (id, tenant_id, month, status) VALUES
('00000000-0000-0000-0030-000000000001', '00000000-0000-0000-0000-000000000001', '2026-06-01', 'new_hires');

-- ----------------------------------------------------------------------------
-- Open cases matching the demo: Khaled offboarding, Ahmed Ragab onboarding
-- ----------------------------------------------------------------------------
INSERT INTO offboarding_cases (id, tenant_id, employee_id, trigger_reason, notice_date, last_working_day, status, stage) VALUES
('00000000-0000-0000-0031-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000007',
 'resignation', '2026-05-19', '2026-06-19', 'in_progress', 4);

INSERT INTO clearance_items (tenant_id, case_id, department, item_key, status) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0031-000000000001', 'it', 'laptop_return', 'pending'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0031-000000000001', 'operations_admin', 'id_card_return', 'pending'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0031-000000000001', 'finance', 'advance_clearance', 'pending'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0031-000000000001', 'direct_manager', 'handover_approval', 'pending');

INSERT INTO onboarding_cases (id, tenant_id, employee_id, hiring_email, joining_date, priority, status) VALUES
('00000000-0000-0000-0032-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0010-000000000008',
 '{"name_ar": "أحمد رجب عطية", "name_en": "Ahmed Ragab Attia", "national_id": "29401121234577",
   "mobile": "01098872231", "job_title": "CM/PM Rigger", "project_code": "PRJ-009",
   "project_name": "New Alamein Towers", "direct_manager": "Eng. Hany Abdel Fattah",
   "work_location": "Alamein", "net_salary": 14000, "allowances": {"site": 1500, "hazard": 1000},
   "social_insurance_number": "13119908", "contract_signing_date": "2026-06-01",
   "joining_date": "2026-06-01"}'::jsonb,
 '2026-06-01', 'P0', 'in_progress');

INSERT INTO onboarding_tasks (tenant_id, case_id, stage, task_key, owner_role, due_date, status) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0032-000000000001', 3, 'document_collection', 'personnel', '2026-06-01', 'in_progress'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0032-000000000001', 7, 'medical_exam', 'hse', '2026-06-22', 'pending'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0032-000000000001', 7, 'course_heights', 'hse', '2026-06-22', 'pending');

COMMIT;
