import { getLocale, getTranslations } from "next-intl/server";
import {
  ATTENDANCE_MONTH,
  ATTENDANCE_SUMMARY,
  recordsForDate,
} from "@/lib/data/mock/attendance";
import { EMPLOYEES, PROJECTS, WORK_LOCATIONS, DEMO_TODAY } from "@/lib/data/mock/seed";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const locale = await getLocale();
  await getTranslations("attendance");

  const records = recordsForDate(DEMO_TODAY);

  const enrichedRecords = records.map((record) => {
    const emp = EMPLOYEES.find((e) => e.id === record.employee_id)!;
    const project = record.project_id
      ? PROJECTS.find((p) => p.id === record.project_id) ?? null
      : null;
    const location = record.verified_location_id
      ? WORK_LOCATIONS.find((l) => l.id === record.verified_location_id) ?? null
      : null;
    return { record, emp, project, location };
  });

  const enrichedSummary = ATTENDANCE_SUMMARY.map((row) => {
    const emp = EMPLOYEES.find((e) => e.id === row.employee_id)!;
    return { row, emp };
  });

  return (
    <AttendanceClient
      enrichedRecords={enrichedRecords}
      enrichedSummary={enrichedSummary}
      month={ATTENDANCE_MONTH}
      today={DEMO_TODAY}
      locale={locale}
    />
  );
}
