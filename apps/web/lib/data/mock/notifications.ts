import type { Notification } from "../types";
import { DEMO_TODAY } from "./seed";

function addHours(base: string, h: number): string {
  const d = new Date(base);
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

const B = DEMO_TODAY;

export const NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    tenant_id: "tenant-001",
    created_at: addHours(B, -0.5),
    updated_at: addHours(B, -0.5),
    user_id: "user-hrm",
    type: "approval_requested",
    title_ar: "طلب اعتماد: تسوية خالد منصور",
    title_en: "Approval needed: Final settlement — Khaled Mansour",
    body_ar: "P0 · يستحق الاعتماد خلال ساعتين",
    body_en: "P0 · Requires approval within 2 hours",
    link: "/approvals",
    read_at: null,
  },
  {
    id: "notif-002",
    tenant_id: "tenant-001",
    created_at: addHours(B, -1),
    updated_at: addHours(B, -1),
    user_id: "user-hrm",
    type: "sla_breach",
    title_ar: "خرق SLA: تعديل راتب أحمد يوسف",
    title_en: "SLA breach: Salary change — Ahmed Youssef",
    body_ar: "المهلة انقضت منذ 5 ساعات — يلزم التصعيد",
    body_en: "Deadline passed 5 hours ago — escalation required",
    link: "/sla",
    read_at: null,
  },
  {
    id: "notif-003",
    tenant_id: "tenant-001",
    created_at: addHours(B, -2),
    updated_at: addHours(B, -2),
    user_id: "user-hrm",
    type: "approval_requested",
    title_ar: "طلب اعتماد: 4 لحّامين — أسيوط",
    title_en: "Approval needed: 4 Welders — Asyut",
    body_ar: "P0 · أُرسل من م. محمد عمر",
    body_en: "P0 · Submitted by Eng. Mohamed Omar",
    link: "/approvals",
    read_at: null,
  },
  {
    id: "notif-004",
    tenant_id: "tenant-001",
    created_at: addHours(B, -3),
    updated_at: addHours(B, -3),
    user_id: "user-hrm",
    type: "document_expiring",
    title_ar: "مستند يوشك على الانتهاء — محمود النجار",
    title_en: "Document expiring — Mahmoud El-Naggar",
    body_ar: "تصريح العمل ينتهي خلال 14 يومًا",
    body_en: "Work permit expires in 14 days",
    link: "/employees/emp-002",
    read_at: null,
  },
  {
    id: "notif-005",
    tenant_id: "tenant-001",
    created_at: addHours(B, -5),
    updated_at: addHours(B, -5),
    user_id: "user-hrm",
    type: "sla_warning",
    title_ar: "تحذير SLA: سلفة محمود النجار",
    title_en: "SLA warning: Advance — Mahmoud El-Naggar",
    body_ar: "P1 · 19 ساعة متبقية للاعتماد",
    body_en: "P1 · 19 hours remaining for approval",
    link: "/approvals",
    read_at: null,
  },
  {
    id: "notif-006",
    tenant_id: "tenant-001",
    created_at: addHours(B, -8),
    updated_at: addHours(B, -8),
    user_id: "user-hrm",
    type: "approval_done",
    title_ar: "تمت الموافقة: إجازة عمر فتحي",
    title_en: "Approved: Leave — Omar Fathi",
    body_ar: "اعتمدها مدير الموارد البشرية",
    body_en: "Approved by HR Manager",
    link: "/approvals",
    read_at: addHours(B, -6),
  },
  {
    id: "notif-007",
    tenant_id: "tenant-001",
    created_at: addHours(B, -12),
    updated_at: addHours(B, -12),
    user_id: "user-hrm",
    type: "onboarding_task",
    title_ar: "مهمة تعيين: تجهيز بطاقة علي حسين",
    title_en: "Onboarding task: Prepare ID card — Ali Hussein",
    body_ar: "مخصصة لقسم شؤون العاملين",
    body_en: "Assigned to Personnel Dept.",
    link: "/onboarding",
    read_at: addHours(B, -10),
  },
];

export const UNREAD_COUNT = NOTIFICATIONS.filter((n) => !n.read_at).length;
