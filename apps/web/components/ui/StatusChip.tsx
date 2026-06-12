import { useTranslations } from "next-intl";
import type { EmployeeStatus } from "@/lib/data/types";
import { Badge, type BadgeVariant } from "./Badge";

const STATUS_VARIANT: Record<EmployeeStatus, BadgeVariant> = {
  active: "green",
  pending: "yellow",
  suspended: "red",
  offboarding: "red",
  archived: "gray",
};

/** Employee Status Engine state → badge (docs/02 `employees.status`). */
export function StatusChip({ status }: { status: EmployeeStatus }) {
  const t = useTranslations("status");
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>;
}
