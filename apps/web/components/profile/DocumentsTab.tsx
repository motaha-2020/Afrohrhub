import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { employeeRepository, listDocumentTypes } from "@/lib/data";
import type { EmployeeDocumentWithType } from "@/lib/data/repository";
import type { DocumentType } from "@/lib/data/types";
import { DEMO_TODAY } from "@/lib/data/mock/seed";
import { daysBetween, formatDate, localizedName } from "@/lib/utils/format";

const EXPIRY_WARNING_DAYS = 30;

type ChecklistRow = {
  type: DocumentType;
  doc: EmployeeDocumentWithType | null;
};

function rowIcon(row: ChecklistRow): { cls: string; mark: string } {
  if (!row.doc) return { cls: "bg-[#eef1f5] text-muted", mark: "—" };
  const { doc } = row;
  if (doc.status === "required")
    return { cls: "bg-[#eef1f5] text-muted", mark: "○" };
  if (doc.status === "expired") return { cls: "bg-red text-white", mark: "✗" };
  if (
    doc.expiry_date &&
    daysBetween(DEMO_TODAY, doc.expiry_date) <= EXPIRY_WARNING_DAYS
  ) {
    return { cls: "bg-yellow text-white", mark: "!" };
  }
  return { cls: "bg-green text-white", mark: "✓" };
}

/** The manual's 13-item document checklist (demo Profile 360 → Documents). */
export async function DocumentsTab({
  employeeId,
  locale,
}: {
  employeeId: string;
  locale: string;
}) {
  const t = await getTranslations("profile.documents");
  const [docs, types] = await Promise.all([
    employeeRepository.getDocuments(employeeId),
    listDocumentTypes(),
  ]);

  const rows: ChecklistRow[] = types.map((type) => ({
    type,
    doc: docs.find((d) => d.document_type_id === type.id) ?? null,
  }));
  const received = docs.filter(
    (d) => d.status === "received" || d.status === "verified"
  );
  const expiring = received.filter(
    (d) =>
      d.expiry_date &&
      daysBetween(DEMO_TODAY, d.expiry_date) <= EXPIRY_WARNING_DAYS
  ).length;

  const half = Math.ceil(rows.length / 2);
  const columns = [rows.slice(0, half), rows.slice(half)];

  return (
    <Card
      title={t("title")}
      action={
        <Badge variant={expiring > 0 ? "yellow" : "green"}>
          {expiring > 0
            ? t("summary", { received: received.length, expiring })
            : t("summaryComplete", { received: received.length })}
        </Badge>
      }
    >
      <div className="grid gap-4 max-lg:grid-cols-1 lg:grid-cols-2">
        {columns.map((column, ci) => (
          <ul key={ci}>
            {column.map((row) => {
              const icon = rowIcon(row);
              const note = row.doc
                ? locale === "ar"
                  ? row.doc.note_ar
                  : row.doc.note_en
                : undefined;
              return (
                <li
                  key={row.type.id}
                  className="flex flex-wrap items-center gap-2.5 border-b border-dashed border-line px-1 py-[9px] text-[13px] last:border-b-0"
                >
                  <span
                    className={cn(
                      "flex size-[21px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                      icon.cls
                    )}
                  >
                    {icon.mark}
                  </span>
                  <span className={cn(!row.doc && "text-muted")}>
                    {localizedName(row.type, locale)}
                  </span>
                  {!row.doc ? (
                    <Badge variant="gray">{t("na")}</Badge>
                  ) : (
                    <>
                      {row.type.is_original && row.doc.original_received ? (
                        <Badge variant="blue">{t("originalHeld")}</Badge>
                      ) : null}
                      {row.doc.status === "required" ? (
                        <Badge variant="red">{t("statusLabel.required")}</Badge>
                      ) : null}
                      {row.doc.expiry_date ? (
                        <Badge
                          variant={
                            daysBetween(DEMO_TODAY, row.doc.expiry_date) <=
                            EXPIRY_WARNING_DAYS
                              ? "yellow"
                              : "gray"
                          }
                        >
                          {t("expires", {
                            date: formatDate(row.doc.expiry_date, locale),
                          })}
                        </Badge>
                      ) : null}
                    </>
                  )}
                  <span className="ms-auto text-end text-[11px] text-muted">
                    {note ??
                      (row.doc && row.doc.status === "verified"
                        ? t("statusLabel.verified")
                        : "")}
                  </span>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-muted">{t("aiNote")}</p>
    </Card>
  );
}
