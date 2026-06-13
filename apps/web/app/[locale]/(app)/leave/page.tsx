import { getLocale, getTranslations } from "next-intl/server";
import {
  LEAVE_BALANCES,
  LEAVE_REQUESTS,
  LEAVE_TYPES,
} from "@/lib/data/mock/leave";
import { EMPLOYEES } from "@/lib/data/mock/seed";
import { LeaveClient } from "./LeaveClient";

export default async function LeavePage() {
  const locale = await getLocale();
  await getTranslations("leave");

  const enrichedRequests = LEAVE_REQUESTS.map((request) => {
    const emp = EMPLOYEES.find((e) => e.id === request.employee_id)!;
    return { request, emp };
  });

  // Balances grouped by employee, for the active workforce only.
  const balanceEmployees = Array.from(
    new Set(LEAVE_BALANCES.map((b) => b.employee_id))
  ).map((empId) => {
    const emp = EMPLOYEES.find((e) => e.id === empId)!;
    const balances = LEAVE_BALANCES.filter((b) => b.employee_id === empId);
    return { emp, balances };
  });

  return (
    <LeaveClient
      types={LEAVE_TYPES}
      enrichedRequests={enrichedRequests}
      balanceEmployees={balanceEmployees}
      locale={locale}
    />
  );
}
