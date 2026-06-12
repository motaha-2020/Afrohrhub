"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PERSONAS } from "@/lib/auth/personas";
import { useSession } from "@/lib/auth/session";
import { localizedName } from "@/lib/utils/format";

/**
 * DEV ONLY — "View as" persona switcher (like the approved demo's topbar).
 * Persists the persona cookie then refreshes so server components
 * (RBAC-gated tabs, sidebar scope) re-render under the new roles.
 * Removed when Supabase Auth lands.
 */
export function ViewAsSwitcher() {
  const { persona, setPersonaId } = useSession();
  const t = useTranslations("common");
  const tRoles = useTranslations("roles");
  const locale = useLocale();
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-2 rounded-full border-[1.5px] border-primary bg-primary-soft py-1 pe-1.5 ps-3.5"
      title={t("viewAsHint")}
    >
      <b className="whitespace-nowrap text-xs text-primary">{t("viewAs")}</b>
      <select
        value={persona.id}
        onChange={(event) => {
          setPersonaId(event.target.value);
          router.refresh();
        }}
        className="cursor-pointer rounded-full border-none bg-card px-2.5 py-[5px] text-[12.5px] font-bold text-primary"
      >
        {PERSONAS.map((p) => (
          <option key={p.id} value={p.id}>
            {tRoles(p.roles[0])} — {localizedName(p, locale)}
          </option>
        ))}
      </select>
    </div>
  );
}
