/**
 * Mock data for ESS Portal, Settings, and Audit modules.
 */

import { DEMO_TODAY } from "./seed";

/* ============================== ESS Portal ============================= */

export interface EssQuickAction {
  key: string;
  icon: string;
  label_ar: string;
  label_en: string;
  href: string;
}

export const ESS_QUICK_ACTIONS: EssQuickAction[] = [
  { key: "attendance", icon: "📍", label_ar: "تسجيل الحضور", label_en: "Check-in", href: "/ess/attendance" },
  { key: "leave", icon: "🏖", label_ar: "طلب إجازة", label_en: "Leave request", href: "/ess/leave" },
  { key: "payslip", icon: "💰", label_ar: "قسيمة الراتب", label_en: "Payslip", href: "/ess/payslip" },
  { key: "documents", icon: "📄", label_ar: "مستنداتي", label_en: "My documents", href: "/ess/documents" },
  { key: "advance", icon: "💳", label_ar: "طلب سلفة", label_en: "Salary advance", href: "/ess/advance" },
  { key: "resign", icon: "📦", label_ar: "تقديم استقالة", label_en: "Resignation", href: "/ess/resign" },
];

export interface EssNotification {
  id: string;
  message_ar: string;
  message_en: string;
  time_ar: string;
  time_en: string;
  read: boolean;
}

export const ESS_NOTIFICATIONS: EssNotification[] = [
  {
    id: "notif-1",
    message_ar: "تم اعتماد إجازتك العارضة يوم 13/06",
    message_en: "Your casual leave on 13 Jun was approved",
    time_ar: "منذ ساعتين",
    time_en: "2 hours ago",
    read: false,
  },
  {
    id: "notif-2",
    message_ar: "قسيمة راتب مايو 2026 جاهزة للعرض",
    message_en: "May 2026 payslip is ready",
    time_ar: "أمس",
    time_en: "Yesterday",
    read: false,
  },
  {
    id: "notif-3",
    message_ar: "تذكير: الفيش الجنائي ينتهي خلال 28 يوم",
    message_en: "Reminder: Criminal record expires in 28 days",
    time_ar: "منذ 3 أيام",
    time_en: "3 days ago",
    read: true,
  },
  {
    id: "notif-4",
    message_ar: "تم تسجيل حضورك — 07:41 ص",
    message_en: "Check-in recorded — 07:41 AM",
    time_ar: "اليوم",
    time_en: "Today",
    read: true,
  },
];

export const ESS_SUMMARY = {
  check_in_time: "07:41",
  check_in_status_ar: "متأخر 11 دقيقة",
  check_in_status_en: "11 min late",
  leave_balance: 13,
  leave_type_ar: "اعتيادية",
  leave_type_en: "Annual",
  pending_requests: 1,
  unread_notifications: 2,
  last_payslip_ar: "مايو 2026",
  last_payslip_en: "May 2026",
  net_salary_egp: 14200,
} as const;

/* ============================== Settings =============================== */

export interface SettingsSection {
  key: string;
  name_ar: string;
  name_en: string;
  icon: string;
  items: SettingsItem[];
}

export interface SettingsItem {
  key: string;
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
  editable: boolean;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    key: "company",
    name_ar: "بيانات الشركة",
    name_en: "Company profile",
    icon: "🏢",
    items: [
      { key: "name", label_ar: "اسم الشركة", label_en: "Company name", value_ar: "أفرو إيجيبت للمقاولات", value_en: "Afro Egypt Contracting", editable: true },
      { key: "plan", label_ar: "الخطة", label_en: "Plan", value_ar: "Enterprise", value_en: "Enterprise", editable: false },
      { key: "slug", label_ar: "المعرّف", label_en: "Slug", value_ar: "afro-egypt", value_en: "afro-egypt", editable: false },
    ],
  },
  {
    key: "hr_config",
    name_ar: "إعدادات الموارد البشرية",
    name_en: "HR configuration",
    icon: "⚙️",
    items: [
      { key: "hr_code_format", label_ar: "صيغة كود الموظف", label_en: "HR code format", value_ar: "AFR-{YYYY}-{SEQ:4}", value_en: "AFR-{YYYY}-{SEQ:4}", editable: true },
      { key: "probation_days", label_ar: "مدة الاختبار (يوم)", label_en: "Probation period (days)", value_ar: "90", value_en: "90", editable: true },
      { key: "working_days", label_ar: "أيام العمل", label_en: "Working days", value_ar: "الأحد – الخميس", value_en: "Sun – Thu", editable: true },
      { key: "working_hours", label_ar: "ساعات العمل", label_en: "Working hours", value_ar: "07:00 – 16:00", value_en: "07:00 – 16:00", editable: true },
    ],
  },
  {
    key: "payroll_calendar",
    name_ar: "تقويم الرواتب",
    name_en: "Payroll calendar",
    icon: "📅",
    items: [
      { key: "inputs_start", label_ar: "بداية الإدخال", label_en: "Inputs start", value_ar: "يوم 18 من الشهر", value_en: "18th of month", editable: true },
      { key: "calc_deadline", label_ar: "موعد الحساب", label_en: "Calc deadline", value_ar: "يوم 19", value_en: "19th", editable: true },
      { key: "hr_approval", label_ar: "اعتماد HR", label_en: "HR approval", value_ar: "يوم 23", value_en: "23rd", editable: true },
      { key: "finance_approval", label_ar: "اعتماد المالية", label_en: "Finance approval", value_ar: "يوم 25", value_en: "25th", editable: true },
      { key: "disburse", label_ar: "الصرف", label_en: "Disbursement", value_ar: "يوم 28", value_en: "28th", editable: true },
      { key: "payslips", label_ar: "إرسال القسائم", label_en: "Payslips sent", value_ar: "يوم 10 التالي", value_en: "10th of next month", editable: true },
    ],
  },
  {
    key: "notifications",
    name_ar: "قنوات الإشعارات",
    name_en: "Notification channels",
    icon: "🔔",
    items: [
      { key: "email", label_ar: "البريد الإلكتروني", label_en: "Email", value_ar: "مفعّل", value_en: "Enabled", editable: true },
      { key: "in_app", label_ar: "داخل التطبيق", label_en: "In-app", value_ar: "مفعّل", value_en: "Enabled", editable: true },
      { key: "whatsapp", label_ar: "WhatsApp", label_en: "WhatsApp", value_ar: "بانتظار ربط الـ API", value_en: "Pending API setup", editable: false },
      { key: "sms", label_ar: "SMS", label_en: "SMS", value_ar: "بانتظار اختيار المزود", value_en: "Pending provider selection", editable: false },
    ],
  },
];

/* ================================ Audit ================================ */

export type AuditAction = "create" | "update" | "delete" | "login" | "approve" | "reject" | "export";

export interface AuditEntry {
  id: string;
  timestamp: string;
  user_ar: string;
  user_en: string;
  role_ar: string;
  role_en: string;
  action: AuditAction;
  resource_ar: string;
  resource_en: string;
  detail_ar: string;
  detail_en: string;
  ip: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-06-12T14:32:00Z",
    user_ar: "منى طه",
    user_en: "Mona Taha",
    role_ar: "مدير الموارد البشرية",
    role_en: "HR Manager",
    action: "approve",
    resource_ar: "طلب ترقية APR-2210",
    resource_en: "Promotion request APR-2210",
    detail_ar: "اعتماد ترقية أحمد عبد الحليم إلى E3",
    detail_en: "Approved Ahmed Abdel Halim promotion to E3",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-002",
    timestamp: "2026-06-12T11:15:00Z",
    user_ar: "نرمين لطفي",
    user_en: "Nermin Lotfy",
    role_ar: "Payroll",
    role_en: "Payroll",
    action: "update",
    resource_ar: "دورة الرواتب — يونيو 2026",
    resource_en: "Payroll cycle — June 2026",
    detail_ar: "تقديم المرحلة من الإدخال إلى المراجعة",
    detail_en: "Advanced stage from inputs to review",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-003",
    timestamp: "2026-06-12T09:41:00Z",
    user_ar: "مصطفى كامل",
    user_en: "Mostafa Kamel",
    role_ar: "Personnel",
    role_en: "Personnel",
    action: "create",
    resource_ar: "موظف — أحمد رجب عطية (AFR-2026-0119)",
    resource_en: "Employee — Ahmed Ragab Attia (AFR-2026-0119)",
    detail_ar: "إنشاء ملف موظف جديد + فتح حالة Onboarding",
    detail_en: "Created new employee file + opened Onboarding case",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-004",
    timestamp: "2026-06-11T16:22:00Z",
    user_ar: "وليد الجندي",
    user_en: "Walid El-Gendy",
    role_ar: "مدير المشروع",
    role_en: "Project Manager",
    action: "approve",
    resource_ar: "طلب إجازة — كريم فوزي",
    resource_en: "Leave request — Karim Fawzy",
    detail_ar: "اعتماد إجازة عارضة يوم واحد (13/06)",
    detail_en: "Approved 1-day casual leave (13 Jun)",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-005",
    timestamp: "2026-06-11T10:05:00Z",
    user_ar: "هبة سمير",
    user_en: "Heba Samir",
    role_ar: "Talent Acquisition",
    role_en: "Talent Acquisition",
    action: "create",
    resource_ar: "مرشح — هاني صلاح الدين",
    resource_en: "Candidate — Hany Salah",
    detail_ar: "إضافة مرشح من Talent Pool لطلب توظيف HR-2231",
    detail_en: "Added candidate from Talent Pool to hiring request HR-2231",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-006",
    timestamp: "2026-06-10T14:48:00Z",
    user_ar: "شريف أنور",
    user_en: "Sherif Anwar",
    role_ar: "Finance",
    role_en: "Finance",
    action: "export",
    resource_ar: "تقرير التكلفة بالمشروع — مايو 2026",
    resource_en: "Cost-by-project report — May 2026",
    detail_ar: "تصدير PDF لتقرير التكلفة الشهرية",
    detail_en: "Exported monthly cost report PDF",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-007",
    timestamp: "2026-06-10T08:30:00Z",
    user_ar: "طارق سليم",
    user_en: "Tarek Selim",
    role_ar: "HSE",
    role_en: "HSE",
    action: "update",
    resource_ar: "سجل HSE — أحمد رجب عطية",
    resource_en: "HSE record — Ahmed Ragab Attia",
    detail_ar: "رفع شهادة مكافحة الحريق — الحالة: ناجح",
    detail_en: "Uploaded fire-fighting certificate — result: pass",
    ip: "196.219.xx.xx",
  },
  {
    id: "aud-008",
    timestamp: "2026-06-09T17:12:00Z",
    user_ar: "منى طه",
    user_en: "Mona Taha",
    role_ar: "مدير الموارد البشرية",
    role_en: "HR Manager",
    action: "login",
    resource_ar: "تسجيل دخول",
    resource_en: "Login",
    detail_ar: "تسجيل دخول ناجح",
    detail_en: "Successful login",
    ip: "196.219.xx.xx",
  },
];

export const AUDIT_KPIS = {
  entries_today: 47,
  unique_users: 8,
  sensitive_actions: 6,
  exports: 2,
} as const;
