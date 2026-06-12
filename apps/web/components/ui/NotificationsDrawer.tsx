"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { NOTIFICATIONS } from "@/lib/data/mock/notifications";
import type { Notification, NotificationType } from "@/lib/data/types";

const TYPE_ICON: Record<NotificationType, string> = {
  approval_requested: "✅",
  approval_done: "✔️",
  sla_warning: "⚠️",
  sla_breach: "🚨",
  document_expiring: "📄",
  onboarding_task: "🚀",
};

function timeAgo(iso: string, locale: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) {
    const diffM = Math.floor(diffMs / 60_000);
    return locale === "ar" ? `منذ ${diffM} د` : `${diffM}m ago`;
  }
  if (diffH < 24) return locale === "ar" ? `منذ ${diffH} س` : `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return locale === "ar" ? `منذ ${diffD} يوم` : `${diffD}d ago`;
}

export function NotificationsDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);
  const locale = useLocale();
  const t = useTranslations("notifications");
  const router = useRouter();

  const unread = items.filter((n) => !n.read_at).length;

  function markAllRead() {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  }

  function handleClick(n: Notification) {
    if (!n.read_at) {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, read_at: now } : item
        )
      );
    }
    setOpen(false);
    if (n.link) router.push(n.link as "/approvals");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative cursor-pointer text-lg leading-none"
        aria-label={t("title")}
        title={t("title")}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -end-1.5 rounded-full bg-red px-[5px] py-px text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed inset-y-0 end-0 z-50 flex w-[360px] flex-col overflow-hidden border-s border-line bg-card shadow-xl"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <header className="flex items-center gap-3 border-b border-line px-5 py-4">
              <h2 className="flex-1 text-[15px] font-bold">
                {t("title")}
                {unread > 0 && (
                  <span className="ms-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </h2>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[12px] font-semibold text-primary hover:underline"
                >
                  {t("markAllRead")}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="ms-1 text-[18px] text-muted hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <ul className="flex-1 overflow-y-auto divide-y divide-line">
              {items.length === 0 && (
                <li className="flex items-center justify-center py-16 text-sm text-muted">
                  {t("empty")}
                </li>
              )}
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className={[
                      "w-full text-start flex items-start gap-3 px-5 py-3.5 hover:bg-page transition-colors",
                      !n.read_at ? "bg-blue-soft/40" : "",
                    ].join(" ")}
                  >
                    <span className="mt-0.5 text-xl leading-none">
                      {TYPE_ICON[n.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={[
                          "text-[13px] leading-snug",
                          !n.read_at ? "font-semibold text-ink" : "text-muted",
                        ].join(" ")}
                      >
                        {locale === "ar" ? n.title_ar : n.title_en}
                      </p>
                      {(locale === "ar" ? n.body_ar : n.body_en) && (
                        <p className="mt-0.5 text-[11.5px] text-muted truncate">
                          {locale === "ar" ? n.body_ar : n.body_en}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted/70">
                        {timeAgo(n.created_at, locale)}
                      </p>
                    </div>
                    {!n.read_at && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </>
      )}
    </>
  );
}
