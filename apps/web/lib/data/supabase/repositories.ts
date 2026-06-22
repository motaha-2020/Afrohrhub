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
  DocumentType,
  Employee,
  EmployeeCompensation,
  EmployeeEvent,
  Grade,
  HseRecord,
  JobTitle,
  Project,
  ProjectAllocation,
} from "../types";
import { hasAnyRole } from "@/lib/rbac/roles";
import { daysBetween } from "@/lib/utils/format";
import { DEMO_TODAY } from "../mock/seed";
import { DEMO_TENANT_ID, getAdminClient } from "@/lib/supabase/server";

/**
 * Supabase-backed data layer (Core HR). Mirrors the mock repositories'
 * behavior against the real `afrohr` database, scoped to the demo tenant
 * (service-role access — see lib/supabase/server.ts). Same EmployeeRepository
 * / ProjectRepository contracts, so screens are unchanged.
 */

const EXPIRY_WARNING_DAYS = 30;
const T = DEMO_TENANT_ID;

/** Bilingual HSE record names (the DB stores `course_key`, not a name). */
const HSE_NAMES: Record<string, { ar: string; en: string }> = {
  medical_exam: { ar: "الفحص الطبي (نموذج 111)", en: "Medical exam (Form 111)" },
  fire_fighting: { ar: "مكافحة الحريق", en: "Fire Fighting" },
  first_aid: { ar: "الإسعافات الأولية", en: "First Aid" },
  risk_assessment: { ar: "تقييم المخاطر", en: "Risk Assessment" },
  working_at_heights: { ar: "العمل على الارتفاعات", en: "Working at Heights" },
};

const EMP_COLS =
  "id,tenant_id,created_at,updated_at,archived_at,hr_code,name_ar,name_en,national_id,mobile,personal_email,work_email,photo_path,job_title_id,grade_id,department_id,direct_manager_id,employment_type,collar,hire_date,contract_signing_date,status,social_insurance_number,insurance_office,is_rehire,requires_medical_exam,safety_sensitive_role";

function summarize(docs: EmployeeDocumentWithType[]): DocumentSummary {
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
  };
}

export class SupabaseEmployeeRepository implements EmployeeRepository {
  async list(filters: EmployeeFilters = {}): Promise<EmployeeListItem[]> {
    const db = getAdminClient();
    const [employees, jobTitles, grades, projects, allocations, documents] =
      await Promise.all([
        db
          .from("employees")
          .select(EMP_COLS)
          .eq("tenant_id", T)
          .is("archived_at", null),
        db.from("job_titles").select("*").eq("tenant_id", T),
        db.from("grades").select("*").eq("tenant_id", T),
        db.from("projects").select("*").eq("tenant_id", T),
        db
          .from("employee_project_allocations")
          .select("*")
          .eq("tenant_id", T)
          .is("end_date", null),
        db
          .from("employee_documents")
          .select("*, document_type:document_types(*)")
          .eq("tenant_id", T),
      ]);

    for (const r of [employees, jobTitles, grades, projects, allocations, documents]) {
      if (r.error) throw new Error(r.error.message);
    }

    const jobs = (jobTitles.data ?? []) as JobTitle[];
    const grds = (grades.data ?? []) as Grade[];
    const prjs = (projects.data ?? []) as Project[];
    const allocs = (allocations.data ?? []) as ProjectAllocation[];
    const docs = (documents.data ?? []) as EmployeeDocumentWithType[];
    const q = filters.q?.trim().toLowerCase();

    return ((employees.data ?? []) as Employee[])
      .map((employee) => {
        const empAllocs = allocs
          .filter((a) => a.employee_id === employee.id)
          .sort((a, b) => b.allocation_pct - a.allocation_pct);
        const project = empAllocs.length
          ? (prjs.find((p) => p.id === empAllocs[0].project_id) ?? null)
          : null;
        const empDocs = docs.filter((d) => d.employee_id === employee.id);
        return {
          employee,
          job_title: jobs.find((j) => j.id === employee.job_title_id)!,
          grade: grds.find((g) => g.id === employee.grade_id) ?? null,
          project,
          documents: summarize(empDocs),
        } satisfies EmployeeListItem;
      })
      .filter((item) => {
        const { employee } = item;
        if (filters.status && employee.status !== filters.status) return false;
        if (filters.collar && employee.collar !== filters.collar) return false;
        if (
          filters.project_id &&
          !allocs.some(
            (a) =>
              a.employee_id === employee.id &&
              a.project_id === filters.project_id
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
    const db = getAdminClient();
    const { data, error } = await db
      .from("employees")
      .select(EMP_COLS)
      .eq("tenant_id", T)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Employee | null) ?? null;
  }

  async getListItem(id: string): Promise<EmployeeListItem | null> {
    const employee = await this.getById(id);
    if (!employee) return null;
    const db = getAdminClient();
    const [jobTitle, grade, allocations, documents] = await Promise.all([
      db.from("job_titles").select("*").eq("id", employee.job_title_id).maybeSingle(),
      employee.grade_id
        ? db.from("grades").select("*").eq("id", employee.grade_id).maybeSingle()
        : Promise.resolve({ data: null }),
      db
        .from("employee_project_allocations")
        .select("*, project:projects(*)")
        .eq("employee_id", id)
        .is("end_date", null),
      db
        .from("employee_documents")
        .select("*, document_type:document_types(*)")
        .eq("employee_id", id),
    ]);

    const allocs = (allocations.data ?? []) as (ProjectAllocation & {
      project: Project;
    })[];
    const primary = [...allocs].sort(
      (a, b) => b.allocation_pct - a.allocation_pct
    )[0];

    return {
      employee,
      job_title: jobTitle.data as JobTitle,
      grade: (grade.data as Grade | null) ?? null,
      project: primary?.project ?? null,
      documents: summarize(
        (documents.data ?? []) as EmployeeDocumentWithType[]
      ),
    };
  }

  async getDocuments(employeeId: string): Promise<EmployeeDocumentWithType[]> {
    const db = getAdminClient();
    const { data, error } = await db
      .from("employee_documents")
      .select("*, document_type:document_types(*)")
      .eq("employee_id", employeeId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as EmployeeDocumentWithType[]).sort(
      (a, b) =>
        (a.document_type.sort_order ?? 0) - (b.document_type.sort_order ?? 0)
    );
  }

  async getEvents(employeeId: string): Promise<EmployeeEvent[]> {
    const db = getAdminClient();
    const { data, error } = await db
      .from("employee_events")
      .select("*")
      .eq("employee_id", employeeId)
      .order("effective_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as EmployeeEvent[];
  }

  async getAllocations(employeeId: string): Promise<AllocationWithProject[]> {
    const db = getAdminClient();
    const { data, error } = await db
      .from("employee_project_allocations")
      .select("*, project:projects(*), work_location:work_locations(*)")
      .eq("employee_id", employeeId)
      .is("end_date", null);
    if (error) throw new Error(error.message);
    return ((data ?? []) as AllocationWithProject[]).sort(
      (a, b) => b.allocation_pct - a.allocation_pct
    );
  }

  async getCompensation(
    employeeId: string
  ): Promise<EmployeeCompensation | null> {
    const db = getAdminClient();
    const { data, error } = await db
      .from("employee_compensation")
      .select("*")
      .eq("employee_id", employeeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as EmployeeCompensation | null) ?? null;
  }

  async getHseRecords(employeeId: string): Promise<HseRecord[]> {
    const db = getAdminClient();
    const { data, error } = await db
      .from("hse_records")
      .select("*")
      .eq("employee_id", employeeId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as Omit<HseRecord, "name_ar" | "name_en">[]).map(
      (row) => {
        const name =
          HSE_NAMES[row.course_key ?? ""] ??
          ({ ar: row.course_key ?? "", en: row.course_key ?? "" } as const);
        return { ...row, name_ar: name.ar, name_en: name.en } as HseRecord;
      }
    );
  }
}

/** Columns of approval_requests + the denormalized presentation snapshot. */
interface ApprovalRow {
  id: string;
  tenant_id: string;
  entity_type: ApprovalRequest["entity_type"];
  entity_id: string;
  current_step: number;
  status: ApprovalRequest["status"];
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  payload_snapshot: Omit<
    ApprovalRequest,
    | keyof import("../types").BaseRow
    | "entity_type"
    | "entity_id"
    | "current_step"
    | "status"
  >;
}

export class SupabaseApprovalRepository implements ApprovalRepository {
  async listPending(filters: ApprovalFilters = {}): Promise<ApprovalRequest[]> {
    const db = getAdminClient();
    let query = db
      .from("approval_requests")
      .select("*")
      .eq("tenant_id", T)
      .eq("status", "pending")
      .is("archived_at", null);
    if (filters.entity_type) query = query.eq("entity_type", filters.entity_type);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return ((data ?? []) as ApprovalRow[])
      .map((row) => {
        const { payload_snapshot: p } = row;
        return {
          id: row.id,
          tenant_id: row.tenant_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          archived_at: row.archived_at,
          entity_type: row.entity_type,
          entity_id: row.entity_id,
          current_step: row.current_step,
          status: row.status,
          ...p,
        } satisfies ApprovalRequest;
      })
      .filter(
        (req) =>
          !filters.awaiting_roles ||
          hasAnyRole(filters.awaiting_roles, req.awaiting_roles)
      )
      .sort((a, b) => b.requested_at.localeCompare(a.requested_at));
  }
}

export class SupabaseProjectRepository implements ProjectRepository {
  async list(): Promise<Project[]> {
    const db = getAdminClient();
    const { data, error } = await db
      .from("projects")
      .select("*")
      .eq("tenant_id", T)
      .eq("status", "active");
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  }
}

/** Tenant document checklist from the DB (no sort column → ordered by name). */
export async function listDocumentTypesFromDb(): Promise<DocumentType[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("document_types")
    .select("*")
    .eq("tenant_id", T)
    .order("name_en", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Omit<DocumentType, "sort_order">[]).map(
    (row, i) => ({ ...row, sort_order: i }) as DocumentType
  );
}
