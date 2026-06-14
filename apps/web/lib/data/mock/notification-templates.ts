import type {
  ChannelDeliveryStat,
  NotificationTemplate,
} from "../types";
import { DEMO_TODAY } from "./seed";

/**
 * Notification template catalog — the multi-channel messaging engine
 * (docs/modules/09-notifications.md). Each event has bilingual variants
 * per channel; WhatsApp variants carry a Meta registration status. HR
 * Managers edit these from the template builder. The actual WhatsApp
 * Business API / Egyptian SMS provider wiring is Phase 2 — this seeds the
 * catalog, channel preferences, and the delivery monitor.
 */

function base(id: string) {
  return {
    id,
    tenant_id: "tn-afro",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: DEMO_TODAY + "T08:00:00Z",
    archived_at: null,
  };
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    ...base("ntpl-pay-disbursed-wa"),
    event_key: "payroll.disbursed",
    module: "payroll",
    channel: "whatsapp",
    name_ar: "تم صرف الراتب",
    name_en: "Salary disbursed",
    // Policy 9 — no salary figures in any external channel.
    body_ar:
      "مرحباً {{employee_name}}، تم صرف راتب شهر {{month}}. التفاصيل في تطبيق الموظف 📱",
    body_en:
      "Hi {{employee_name}}, your {{month}} salary has been disbursed. See details in the employee app 📱",
    variables: ["employee_name", "month"],
    registration_status: "approved",
    critical: true,
    active: true,
  },
  {
    ...base("ntpl-leave-approved-wa"),
    event_key: "leave.approved",
    module: "attendance",
    channel: "whatsapp",
    name_ar: "اعتماد الإجازة",
    name_en: "Leave approved",
    body_ar:
      "تم اعتماد إجازتك ({{leave_type}}) من {{start_date}} إلى {{end_date}}. رصيدك المتبقي {{balance}} يوم.",
    body_en:
      "Your {{leave_type}} leave from {{start_date}} to {{end_date}} is approved. Remaining balance: {{balance}} days.",
    variables: ["leave_type", "start_date", "end_date", "balance"],
    registration_status: "approved",
    critical: false,
    active: true,
  },
  {
    ...base("ntpl-doc-expiring-wa"),
    event_key: "documents.expiring",
    module: "documents",
    channel: "whatsapp",
    name_ar: "اقتراب انتهاء مستند",
    name_en: "Document expiring",
    body_ar:
      "تنبيه: {{document_name}} ينتهي خلال {{days_left}} يوم ({{expiry_date}}). برجاء تجديده ورفعه من التطبيق.",
    body_en:
      "Reminder: your {{document_name}} expires in {{days_left}} days ({{expiry_date}}). Please renew and upload it in the app.",
    variables: ["document_name", "days_left", "expiry_date"],
    registration_status: "pending",
    critical: false,
    active: true,
  },
  {
    ...base("ntpl-offboard-access-sms"),
    event_key: "offboarding.access_escalation",
    module: "offboarding",
    channel: "sms",
    name_ar: "تصعيد: لم يُقطع الـ Access",
    name_en: "Escalation: access not revoked",
    body_ar:
      "تصعيد عاجل: صلاحيات {{employee_name}} لم تُقطع رغم انقضاء آخر يوم عمل ({{last_working_day}}).",
    body_en:
      "Urgent escalation: access for {{employee_name}} is still active past the last working day ({{last_working_day}}).",
    variables: ["employee_name", "last_working_day"],
    registration_status: "not_required",
    critical: true,
    active: true,
  },
  {
    ...base("ntpl-approval-pending-inapp"),
    event_key: "approvals.pending",
    module: "approvals",
    channel: "in_app",
    name_ar: "طلب بانتظار اعتمادك",
    name_en: "Approval awaiting you",
    body_ar:
      "لديك طلب جديد ({{subject}}) بانتظار اعتمادك — يستحق خلال {{sla_hours}} ساعة.",
    body_en:
      "A new request ({{subject}}) is awaiting your approval — due in {{sla_hours}} hours.",
    variables: ["subject", "sla_hours"],
    registration_status: "not_required",
    critical: true,
    active: true,
  },
  {
    ...base("ntpl-offer-sent-email"),
    event_key: "recruitment.offer_sent",
    module: "recruitment",
    channel: "email",
    name_ar: "إرسال عرض العمل",
    name_en: "Job offer sent",
    body_ar:
      "عزيزي {{candidate_name}}، يسعدنا تقديم عرض للانضمام كـ {{job_title}}. للقبول خلال 30 يوماً: {{offer_link}}",
    body_en:
      "Dear {{candidate_name}}, we are pleased to offer you the {{job_title}} role. Accept within 30 days: {{offer_link}}",
    variables: ["candidate_name", "job_title", "offer_link"],
    registration_status: "not_required",
    critical: false,
    active: true,
  },
  {
    ...base("ntpl-onboard-task-inapp"),
    event_key: "onboarding.task_assigned",
    module: "onboarding",
    channel: "in_app",
    name_ar: "مهمة Onboarding مسندة لقسمك",
    name_en: "Onboarding task assigned",
    body_ar:
      "مهمة جديدة ({{task_title}}) للموظف {{employee_name}} مسندة لـ {{owner_role}} — تستحق {{due_date}}.",
    body_en:
      "New task ({{task_title}}) for {{employee_name}} assigned to {{owner_role}} — due {{due_date}}.",
    variables: ["task_title", "employee_name", "owner_role", "due_date"],
    registration_status: "not_required",
    critical: false,
    active: true,
  },
  {
    ...base("ntpl-doc-expiring-sms"),
    event_key: "documents.expiring",
    module: "documents",
    channel: "sms",
    name_ar: "اقتراب انتهاء مستند (SMS احتياطي)",
    name_en: "Document expiring (SMS fallback)",
    body_ar:
      "{{employee_name}}: {{document_name}} ينتهي {{expiry_date}}. برجاء التجديد.",
    body_en:
      "{{employee_name}}: {{document_name}} expires {{expiry_date}}. Please renew.",
    variables: ["employee_name", "document_name", "expiry_date"],
    registration_status: "not_required",
    critical: false,
    active: false,
  },
];

export function templatesByModule(): Record<string, NotificationTemplate[]> {
  return NOTIFICATION_TEMPLATES.reduce<Record<string, NotificationTemplate[]>>(
    (acc, tpl) => {
      (acc[tpl.module] ??= []).push(tpl);
      return acc;
    },
    {}
  );
}

/** Send-monitor counters for the last 30 days (Company Admin dashboard). */
export const CHANNEL_DELIVERY_STATS: ChannelDeliveryStat[] = [
  { channel: "in_app", sent: 1840, delivered: 1840, failed: 0 },
  { channel: "whatsapp", sent: 1226, delivered: 1192, failed: 34 },
  { channel: "sms", sent: 318, delivered: 305, failed: 13 },
  { channel: "email", sent: 274, delivered: 270, failed: 4 },
];
