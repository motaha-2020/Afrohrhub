import type {
  AllocationWithProject,
  ApprovalFilters,
  ApprovalRepository,
  DocumentSummary,
  EmployeeDocumentWithType,
  EmployeeFilters,
  EmployeeListItem,
  EmployeeRepository,
  ProjectRepository,
} from "../repository";
import type {
  ApprovalRequest,
  Employee,
  EmployeeCompensation,
  EmployeeEvent,
  HseRecord,
  Project,
} from "../types";
import { hasAnyRole } from "@/lib/rbac/roles";
import { APPROVAL_REQUESTS } from "./approvals";
import { daysBetween } from "@/lib/utils/format";
import {
  ALLOCATIONS,
  ASSETS_TO_RETURN,
  COMPENSATIONS,
  DEMO_TODAY,
  DOCUMENT_TYPES,
  EMPLOYEE_DOCUMENTS,
  EMPLOYEE_EVENTS,
  EMPLOYEES,
  GRADES,
  HSE_RECORDS,
  JOB_TITLES,
  PROJECTS,
  WORK_LOCATIONS,
} from "./seed";

/** Expiry window (days) that surfaces a document warning in the directory. */
const EXPIRY_WARNING_DAYS = 30;

function documentsFor(employeeId: string): EmployeeDocumentWithType[] {
  return EMPLOYEE_DOCUMENTS.filter((d) => d.employee_id === employeeId)
    .map((d) => ({
      ...d,
      document_type: DOCUMENT_TYPES.find(
        (dt) => dt.id === d.document_type_id
      )!,
    }))
    .sort((a, b) => a.document_type.sort_order - b.document_type.sort_order);
}

function summarize(employee: Employee): DocumentSummary {
  const docs = documentsFor(employee.id);
  const received = docs.filter(
    (d) => d.status === "received" || d.status === "verified"
  );
  let expiring: DocumentSummary["expiring_soon"] = null;
  for (const doc of received) {
    if (!doc.expiry_date) continue;
    const days = daysBetween(DEMO_TODAY, doc.expiry_date);
    if (days <= EXPIRY_WARNING_DAYS && (!expiring || days < expiring.days_left)) {
      expiring = {
        name_ar: doc.document_type.name_ar,
        name_en: doc.document_type.name_en,
        days_left: days,
      };
    }
  }
  return {
    total: docs.length,
    received: received.length,
    missing: docs.length - received.length,
    expiring_soon: expiring,
    assets_to_return: ASSETS_TO_RETURN[employee.id],
  };
}

function toListItem(employee: Employee): EmployeeListItem {
  const allocations = ALLOCATIONS.filter(
    (a) => a.employee_id === employee.id && !a.end_date
  ).sort((a, b) => b.allocation_pct - a.allocation_pct);
  const project = allocations.length
    ? (PROJECTS.find((p) => p.id === allocations[0].project_id) ?? null)
    : null;
  return {
    employee,
    job_title: JOB_TITLES.find((jt) => jt.id === employee.job_title_id)!,
    grade: GRADES.find((g) => g.id === employee.grade_id) ?? null,
    project,
    documents: summarize(employee),
  };
}

export class MockEmployeeRepository implements EmployeeRepository {
  async list(filters: EmployeeFilters = {}): Promise<EmployeeListItem[]> {
    const q = filters.q?.trim().toLowerCase();
    return EMPLOYEES.filter((e) => !e.archived_at)
      .map(toListItem)
      .filter((item) => {
        const { employee } = item;
        if (filters.status && employee.status !== filters.status) return false;
        if (filters.collar && employee.collar !== filters.collar) return false;
        if (
          filters.project_id &&
          !ALLOCATIONS.some(
            (a) =>
              a.employee_id === employee.id &&
              a.project_id === filters.project_id &&
              !a.end_date
          )
        ) {
          return false;
        }
        if (q) {
          const haystack = [
            employee.name_ar,
            employee.name_en,
            employee.hr_code,
            employee.national_id,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      });
  }

  async getById(id: string): Promise<Employee | null> {
    return EMPLOYEES.find((e) => e.id === id) ?? null;
  }

  async getListItem(id: string): Promise<EmployeeListItem | null> {
    const employee = await this.getById(id);
    return employee ? toListItem(employee) : null;
  }

  async getDocuments(employeeId: string): Promise<EmployeeDocumentWithType[]> {
    return documentsFor(employeeId);
  }

  async getEvents(employeeId: string): Promise<EmployeeEvent[]> {
    return EMPLOYEE_EVENTS.filter((e) => e.employee_id === employeeId).sort(
      (a, b) => b.effective_date.localeCompare(a.effective_date)
    );
  }

  async getAllocations(employeeId: string): Promise<AllocationWithProject[]> {
    return ALLOCATIONS.filter(
      (a) => a.employee_id === employeeId && !a.end_date
    )
      .sort((a, b) => b.allocation_pct - a.allocation_pct)
      .map((a) => ({
        ...a,
        project: PROJECTS.find((p) => p.id === a.project_id)!,
        work_location:
          WORK_LOCATIONS.find((l) => l.id === a.work_location_id) ?? null,
      }));
  }

  async getCompensation(
    employeeId: string
  ): Promise<EmployeeCompensation | null> {
    return COMPENSATIONS.find((c) => c.employee_id === employeeId) ?? null;
  }

  async getHseRecords(employeeId: string): Promise<HseRecord[]> {
    return HSE_RECORDS.filter((r) => r.employee_id === employeeId);
  }
}

export class MockProjectRepository implements ProjectRepository {
  async list(): Promise<Project[]> {
    return PROJECTS.filter((p) => p.status === "active");
  }
}

export class MockApprovalRepository implements ApprovalRepository {
  async listPending(filters: ApprovalFilters = {}): Promise<ApprovalRequest[]> {
    return APPROVAL_REQUESTS.filter((req) => {
      if (req.status !== "pending") return false;
      if (filters.entity_type && req.entity_type !== filters.entity_type) {
        return false;
      }
      if (
        filters.awaiting_roles &&
        !hasAnyRole(filters.awaiting_roles, req.awaiting_roles)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => b.requested_at.localeCompare(a.requested_at));
  }
}
