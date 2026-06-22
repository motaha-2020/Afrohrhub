import type {
  ApprovalEntityType,
  ApprovalRequest,
  Collar,
  Employee,
  EmployeeCompensation,
  EmployeeDocument,
  EmployeeEvent,
  EmployeeStatus,
  DocumentType,
  Grade,
  HseRecord,
  JobTitle,
  Project,
  ProjectAllocation,
  WorkLocation,
} from "./types";
import type { Role } from "@/lib/rbac/roles";

/**
 * Repository interfaces — the only seam the UI talks to. The mock
 * implementations in `lib/data/mock/` are swapped for Supabase-backed
 * ones (RLS-scoped queries) without touching screens.
 */

export interface EmployeeFilters {
  project_id?: string;
  status?: EmployeeStatus;
  collar?: Collar;
  q?: string;
}

/** Aggregate document state used by directory badges. */
export interface DocumentSummary {
  total: number;
  received: number;
  missing: number;
  /** Closest applicable document expiring within 60 days, if any. */
  expiring_soon: {
    name_ar: string;
    name_en: string;
    days_left: number;
  } | null;
  /** Offboarding only — assets pending return. */
  assets_to_return?: number;
}

export interface EmployeeListItem {
  employee: Employee;
  job_title: JobTitle;
  grade: Grade | null;
  /** Primary (highest %) active project, if allocated. */
  project: Project | null;
  documents: DocumentSummary;
}

export type EmployeeDocumentWithType = EmployeeDocument & {
  document_type: DocumentType;
};

export type AllocationWithProject = ProjectAllocation & {
  project: Project;
  work_location: WorkLocation | null;
};

export interface EmployeeRepository {
  list(filters?: EmployeeFilters): Promise<EmployeeListItem[]>;
  getById(id: string): Promise<Employee | null>;
  getListItem(id: string): Promise<EmployeeListItem | null>;
  getDocuments(employee_id: string): Promise<EmployeeDocumentWithType[]>;
  getEvents(employee_id: string): Promise<EmployeeEvent[]>;
  getAllocations(employee_id: string): Promise<AllocationWithProject[]>;
  getCompensation(employee_id: string): Promise<EmployeeCompensation | null>;
  getHseRecords(employee_id: string): Promise<HseRecord[]>;
}

export interface ProjectRepository {
  list(): Promise<Project[]>;
}

export interface ApprovalFilters {
  entity_type?: ApprovalEntityType;
  /** Only requests whose current step awaits one of these roles. */
  awaiting_roles?: readonly Role[];
}

export interface ApprovalRepository {
  /** Pending requests, newest first; optionally scoped to the actor's roles. */
  listPending(filters?: ApprovalFilters): Promise<ApprovalRequest[]>;
}
