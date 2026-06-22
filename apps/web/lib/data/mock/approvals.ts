/**
 * Mock approval inbox — mirrors the "بانتظار اعتمادك" items of the approved
 * demo, expanded into full chains so the Approval Engine surface (docs/05)
 * can be exercised. Replaced by Supabase queries (RLS-scoped) later.
 */
import type { ApprovalRequest } from "../types";
import { MOCK_TENANT } from "./seed";

const base = (id: string, requested_at: string) => ({
  id,
  tenant_id: MOCK_TENANT.id,
  created_at: requested_at,
  updated_at: requested_at,
  archived_at: null,
  requested_at,
  status: "pending" as const,
});

export const APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    ...base("apr-001", "2026-06-12T07:10:00Z"),
    entity_type: "hiring_request",
    entity_id: "hr-2026-0188",
    title_ar: "طلب توظيف: 4 لحّامين أرجون",
    title_en: "Hiring request: 4 Argon Welders",
    summary: [
      {
        label_ar: "المشروع",
        label_en: "Project",
        value_ar: "كوبري النيل — أسيوط",
        value_en: "Nile Bridge — Assiut",
      },
      {
        label_ar: "نوع الطلب",
        label_en: "Request type",
        value_ar: "احتياج جديد (P0 حرج)",
        value_en: "New need (P0 critical)",
      },
      {
        label_ar: "سقف الراتب",
        label_en: "Salary cap",
        value_ar: "9,500 ج.م / فرد",
        value_en: "EGP 9,500 / head",
      },
    ],
    amount: null,
    requested_by_name_ar: "وليد الجندي",
    requested_by_name_en: "Walid El-Gendy",
    current_step: 2,
    sla_state: "due_soon",
    sla_label_ar: "متبقٍ 6 ساعات",
    sla_label_en: "6 hours left",
    awaiting_roles: ["hr_manager"],
    steps: [
      {
        step_order: 1,
        approver_label_ar: "مدير المشروع",
        approver_label_en: "Project Manager",
        decision: "approve",
        actor_name_ar: "وليد الجندي",
        actor_name_en: "Walid El-Gendy",
        comment_ar: "احتياج عاجل لاستكمال طاقم اللحام بالموقع.",
        comment_en: "Urgent need to complete the site welding crew.",
        at: "2026-06-12T07:12:00Z",
      },
      {
        step_order: 2,
        approver_label_ar: "مدير الموارد البشرية",
        approver_label_en: "HR Manager",
        decision: null,
      },
      {
        step_order: 3,
        approver_label_ar: "مدير الشركة (تجاوز السقف)",
        approver_label_en: "Company Admin (cap override)",
        decision: null,
      },
    ],
  },
  {
    ...base("apr-002", "2026-06-12T04:30:00Z"),
    entity_type: "payroll_adjustment",
    entity_id: "adv-2026-0421",
    title_ar: "سلفة 8,000 ج.م — محمود النجار",
    title_en: "Advance EGP 8,000 — Mahmoud El-Naggar",
    summary: [
      {
        label_ar: "الموظف",
        label_en: "Employee",
        value_ar: "محمود سيد النجار (AFR-2023-0871)",
        value_en: "Mahmoud Sayed El-Naggar (AFR-2023-0871)",
      },
      {
        label_ar: "نوع التعديل",
        label_en: "Adjustment type",
        value_ar: "سلفة على الراتب",
        value_en: "Salary advance",
      },
      {
        label_ar: "خطة السداد",
        label_en: "Repayment plan",
        value_ar: "4 أقساط شهرية",
        value_en: "4 monthly installments",
      },
    ],
    amount: 8000,
    requested_by_name_ar: "مصطفى كامل",
    requested_by_name_en: "Mostafa Kamel",
    current_step: 1,
    sla_state: "on_time",
    sla_label_ar: "متبقٍ يوم و4 ساعات",
    sla_label_en: "1 day 4 hours left",
    awaiting_roles: ["hr_manager"],
    steps: [
      {
        step_order: 1,
        approver_label_ar: "مدير الموارد البشرية",
        approver_label_en: "HR Manager",
        decision: null,
      },
      {
        step_order: 2,
        approver_label_ar: "المالية (سلفة > 5,000)",
        approver_label_en: "Finance (advance > 5,000)",
        decision: null,
      },
    ],
  },
  {
    ...base("apr-003", "2026-06-11T09:00:00Z"),
    entity_type: "final_settlement",
    entity_id: "set-2026-0033",
    title_ar: "تسوية نهائية — خالد منصور",
    title_en: "Final settlement — Khaled Mansour",
    summary: [
      {
        label_ar: "الموظف",
        label_en: "Employee",
        value_ar: "خالد منصور إبراهيم (AFR-2021-0233)",
        value_en: "Khaled Mansour Ibrahim (AFR-2021-0233)",
      },
      {
        label_ar: "آخر يوم عمل",
        label_en: "Last working day",
        value_ar: "19/06/2026",
        value_en: "19/06/2026",
      },
      {
        label_ar: "رصيد إجازات مُحتسب",
        label_en: "Leave balance settled",
        value_ar: "11 يوم",
        value_en: "11 days",
      },
    ],
    amount: 47350,
    requested_by_name_ar: "مصطفى كامل",
    requested_by_name_en: "Mostafa Kamel",
    current_step: 2,
    sla_state: "overdue",
    sla_label_ar: "متأخر 3 ساعات",
    sla_label_en: "3 hours overdue",
    awaiting_roles: ["hr_manager"],
    steps: [
      {
        step_order: 1,
        approver_label_ar: "شؤون العاملين",
        approver_label_en: "Personnel",
        decision: "approve",
        actor_name_ar: "مصطفى كامل",
        actor_name_en: "Mostafa Kamel",
        comment_ar: "اكتملت مصفوفة إخلاء الطرف (Clearance).",
        comment_en: "Clearance matrix complete.",
        at: "2026-06-11T09:05:00Z",
      },
      {
        step_order: 2,
        approver_label_ar: "مدير الموارد البشرية",
        approver_label_en: "HR Manager",
        decision: null,
      },
      {
        step_order: 3,
        approver_label_ar: "المالية (الصرف)",
        approver_label_en: "Finance (disbursement)",
        decision: null,
      },
    ],
  },
  {
    ...base("apr-004", "2026-06-11T11:20:00Z"),
    entity_type: "leave_request",
    entity_id: "lv-2026-0902",
    title_ar: "إجازة 5 أيام — م. سارة عادل",
    title_en: "Leave 5 days — Eng. Sara Adel",
    summary: [
      {
        label_ar: "الموظف",
        label_en: "Employee",
        value_ar: "سارة عادل توفيق (AFR-2025-0044)",
        value_en: "Sara Adel Tawfik (AFR-2025-0044)",
      },
      {
        label_ar: "النوع",
        label_en: "Type",
        value_ar: "اعتيادية",
        value_en: "Annual",
      },
      {
        label_ar: "الفترة",
        label_en: "Period",
        value_ar: "23/06 — 27/06/2026",
        value_en: "23/06 — 27/06/2026",
      },
      {
        label_ar: "الرصيد بعد الإجازة",
        label_en: "Balance after leave",
        value_ar: "9 أيام",
        value_en: "9 days",
      },
    ],
    amount: null,
    requested_by_name_ar: "سارة عادل توفيق",
    requested_by_name_en: "Sara Adel Tawfik",
    current_step: 1,
    sla_state: "on_time",
    sla_label_ar: "متبقٍ يومان",
    sla_label_en: "2 days left",
    awaiting_roles: ["direct_manager", "hr_manager"],
    steps: [
      {
        step_order: 1,
        approver_label_ar: "المدير المباشر",
        approver_label_en: "Direct Manager",
        decision: null,
      },
      {
        step_order: 2,
        approver_label_ar: "الموارد البشرية (تأكيد الرصيد)",
        approver_label_en: "HR (balance confirm)",
        decision: null,
      },
    ],
  },
];
