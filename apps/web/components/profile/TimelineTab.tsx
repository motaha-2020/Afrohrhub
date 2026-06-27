import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { employeeRepository } from "@/lib/data";
import { formatDate } from "@/lib/utils/format";

/** Append-only employment timeline (docs/02 `employee_events`). */
export async function TimelineTab({
  employeeId,
  locale,
}: {
  employeeId: string;
  locale: string;
}) {
  const t = await getTranslations("profile.timeline");
  const events = await employeeRepository.getEvents(employeeId);

  return (
    <Card title={t("title")}>
      {events.length === 0 ? (
        <EmptyState
          icon="🕐"
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <ul className="ms-1.5 border-s-2 border-line ps-5">
          {events.map((event) => {
            const title =
              locale === "ar" ? event.payload.title_ar : event.payload.title_en;
            const note =
              locale === "ar" ? event.payload.note_ar : event.payload.note_en;
            return (
              <li key={event.id} className="relative pb-[18px] last:pb-1">
                <span className="absolute -start-[27px] top-[5px] size-3 rounded-full border-[2.5px] border-white bg-primary shadow-[0_0_0_2px_var(--color-primary-soft)]" />
                <b className="text-[13px]">{title}</b>
                <small className="block text-[11.5px] text-muted">
                  {formatDate(event.effective_date, locale)}
                  {note ? ` · ${note}` : ""}
                </small>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
