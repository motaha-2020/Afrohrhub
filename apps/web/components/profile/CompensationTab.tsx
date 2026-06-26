import { getTranslations } from "next-intl/server";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { employeeRepository } from "@/lib/data";
import type { Employee } from "@/lib/data/types";
import { canViewCompensation, type Role } from "@/lib/rbac/roles";
import { formatDate, formatNumber } from "@/lib/utils/format";

/**
 * Compensation tab — SERVER-SIDE role gate (Policy 9): data is fetched and
 * rendered only when the current roles may read `employee_compensation`.
 * Other roles get the access-denied panel; in production the RLS policy
 * makes the query itself return nothing, and every read / attempt is
 * written to the audit log (Policy 16).
 */
export async function CompensationTab({
  employee,
  locale,
  roles,
}: {
  employee: Employee;
  locale: string;
  roles: Role[];
}) {
  const t = await getTranslations("profile.compensation");

  if (!canViewCompensation(roles)) {
    return (
      <Alert variant="red" className="px-5 py-4">
        <p className="mb-1 text-sm font-extrabold">{t("denied.title")}</p>
        <p className="font-medium">{t("denied.body")}</p>
      </Alert>
    );
  }

  const comp = await employeeRepository.getCompensation(employee.id);
  if (!comp) {
    return <Alert variant="yellow">{t("noData")}</Alert>;
  }

  const tCommon = await getTranslations("common");
  const allowanceTotal = Object.values(comp.allowances).reduce(
    (sum, v) => sum + v,
    0
  );
  const allowanceBreakdown = Object.entries(comp.allowances)
    .map(
      ([key, value]) => `${t(`allowance.${key}`)} ${formatNumber(value, locale)}`
    )
    .join(" · ");

  return (
    <>
      <Alert variant="yellow" className="mb-3">
        {t("auditNotice")}
      </Alert>
      <div className="mb-4 grid gap-4 max-lg:grid-cols-1 lg:grid-cols-3">
        <KpiCard
          label={t("netSalary")}
          value={
            <>
              {formatNumber(comp.net_salary, locale)}{" "}
              <small className="text-[13px]">{tCommon("egp")}</small>
            </>
          }
          sub={t("netSalarySub", {
            gross: formatNumber(comp.gross_salary, locale),
            insurable: formatNumber(comp.insurable_salary, locale),
          })}
        />
        <KpiCard
          label={t("allowancesTitle")}
          value={formatNumber(allowanceTotal, locale)}
          sub={allowanceBreakdown}
        />
        <KpiCard
          label={t("bank")}
          value={
            <span className="text-base">
              {comp.bank_name ? `${comp.bank_name} ${comp.bank_account}` : "—"}
            </span>
          }
          sub={
            comp.bank_verified && comp.bank_verified_at ? (
              <>
                <Badge variant="green">{t("bankVerified")}</Badge>{" "}
                {t("bankVerifiedBy", {
                  date: formatDate(comp.bank_verified_at, locale),
                })}
              </>
            ) : (
              <Badge variant="red">{t("bankUnverified")}</Badge>
            )
          }
        />
      </div>
      {employee.social_insurance_number ? (
        <Card title={t("si.title")}>
          <p className="text-[13px]">
            {t("si.body", {
              number: employee.social_insurance_number,
              office: employee.insurance_office ?? "—",
              date: employee.contract_signing_date
                ? formatDate(employee.contract_signing_date, locale)
                : "—",
            })}
          </p>
        </Card>
      ) : null}
    </>
  );
}
