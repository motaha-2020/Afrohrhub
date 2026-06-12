import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type RecruitmentTab = "requests" | "pipeline" | "talentPool";

const TABS: { key: RecruitmentTab; href: string; icon: string }[] = [
  { key: "requests", href: "/recruitment", icon: "📋" },
  { key: "pipeline", href: "/recruitment/pipeline", icon: "🧭" },
  { key: "talentPool", href: "/recruitment/talent-pool", icon: "🗃" },
];

/** Sub-navigation shared by the three recruitment screens. */
export async function RecruitmentTabs({ active }: { active: RecruitmentTab }) {
  const t = await getTranslations("recruitment.tabs");
  return (
    <div className="mb-5 flex w-fit gap-1 rounded-xl border border-line bg-page p-1">
      {TABS.map(({ key, href, icon }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors",
            active === key
              ? "bg-card text-ink shadow-sm"
              : "text-muted hover:text-ink"
          )}
        >
          {icon} {t(key)}
        </Link>
      ))}
    </div>
  );
}
