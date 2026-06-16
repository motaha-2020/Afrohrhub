import { hasAnyRole, type Role } from "./roles";

/**
 * Back-office navigation map — docs/06-screens-map.md.
 * `labelKey` resolves under the `nav.items` message namespace and
 * `sectionKey` under `nav.sections`. Items with `enabled: false` are
 * modules on the roadmap that are not built yet: they render as
 * non-clickable entries so the IA matches the approved demo.
 */
export interface NavItem {
  key: string;
  labelKey: string;
  href: string;
  icon: string;
  allowedRoles: Role[] | "all";
  enabled: boolean;
}

export interface NavSection {
  key: string;
  labelKey: string;
  items: NavItem[];
}

const BACK_OFFICE: Role[] = [
  "company_admin",
  "hr_manager",
  "talent_acquisition",
  "personnel",
  "payroll",
  "finance",
  "hse",
  "it",
  "operations_admin",
  "pmo",
  "direct_manager",
];

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "general",
    labelKey: "general",
    items: [
      {
        key: "dashboard",
        labelKey: "dashboard",
        href: "/dashboard",
        icon: "📊",
        allowedRoles: "all",
        enabled: true,
      },
      {
        key: "approvals",
        labelKey: "approvals",
        href: "/approvals",
        icon: "✅",
        allowedRoles: "all",
        enabled: true,
      },
      {
        key: "sla",
        labelKey: "sla",
        href: "/sla",
        icon: "⏱",
        allowedRoles: ["company_admin", "hr_manager", "pmo"],
        enabled: true,
      },
    ],
  },
  {
    key: "lifecycle",
    labelKey: "lifecycle",
    items: [
      {
        key: "employees",
        labelKey: "employees",
        href: "/employees",
        icon: "👥",
        allowedRoles: BACK_OFFICE,
        enabled: true,
      },
      {
        key: "recruitment",
        labelKey: "recruitment",
        href: "/recruitment",
        icon: "🎯",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "talent_acquisition",
          "direct_manager",
          "pmo",
        ],
        enabled: true,
      },
      {
        key: "onboarding",
        labelKey: "onboarding",
        href: "/onboarding",
        icon: "🚀",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "personnel",
          "it",
          "hse",
          "operations_admin",
        ],
        enabled: true,
      },
      {
        key: "offboarding",
        labelKey: "offboarding",
        href: "/offboarding",
        icon: "📦",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "personnel",
          "it",
          "operations_admin",
          "finance",
        ],
        enabled: true,
      },
    ],
  },
  {
    key: "finance",
    labelKey: "finance",
    items: [
      {
        key: "payroll",
        labelKey: "payroll",
        href: "/payroll",
        icon: "💰",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "payroll",
          "finance",
          "pmo",
          "direct_manager",
        ],
        enabled: true,
      },
      {
        key: "allowances",
        labelKey: "allowances",
        href: "/allowances",
        icon: "🏗",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "payroll",
          "finance",
          "pmo",
          "direct_manager",
          "operations_admin",
        ],
        enabled: true,
      },
      {
        key: "kpi",
        labelKey: "kpi",
        href: "/kpi",
        icon: "📈",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "payroll",
          "finance",
          "pmo",
          "direct_manager",
        ],
        enabled: true,
      },
      {
        key: "costReports",
        labelKey: "costReports",
        href: "/cost-reports",
        icon: "📋",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "payroll",
          "finance",
          "pmo",
        ],
        enabled: true,
      },
      {
        key: "attendance",
        labelKey: "attendance",
        href: "/attendance",
        icon: "📍",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "operations_admin",
          "direct_manager",
          "payroll",
        ],
        enabled: true,
      },
      {
        key: "leave",
        labelKey: "leave",
        href: "/leave",
        icon: "🏖",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "personnel",
          "operations_admin",
          "direct_manager",
        ],
        enabled: true,
      },
    ],
  },
  {
    key: "portal",
    labelKey: "portal",
    items: [
      {
        key: "ess",
        labelKey: "ess",
        href: "/ess",
        icon: "📱",
        allowedRoles: ["employee", "direct_manager"],
        enabled: true,
      },
    ],
  },
  {
    key: "system",
    labelKey: "system",
    items: [
      {
        key: "import",
        labelKey: "import",
        href: "/import",
        icon: "📥",
        allowedRoles: ["company_admin", "hr_manager", "personnel"],
        enabled: true,
      },
      {
        key: "ai",
        labelKey: "ai",
        href: "/ai",
        icon: "✦",
        allowedRoles: [
          "company_admin",
          "hr_manager",
          "talent_acquisition",
          "personnel",
        ],
        enabled: true,
      },
      {
        key: "notificationTemplates",
        labelKey: "notificationTemplates",
        href: "/settings/notifications",
        icon: "📨",
        allowedRoles: ["company_admin", "hr_manager"],
        enabled: true,
      },
      {
        key: "settings",
        labelKey: "settings",
        href: "/settings",
        icon: "⚙️",
        allowedRoles: ["company_admin", "hr_manager"],
        enabled: true,
      },
      {
        key: "audit",
        labelKey: "audit",
        href: "/audit",
        icon: "🧾",
        allowedRoles: ["company_admin", "hr_manager"],
        enabled: true,
      },
    ],
  },
];

/** Sections/items visible to a set of roles; empty sections are dropped. */
export function navForRoles(roles: readonly Role[]): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      hasAnyRole(roles, item.allowedRoles)
    ),
  })).filter((section) => section.items.length > 0);
}
