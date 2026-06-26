import "server-only";

import { supabase } from "@/lib/supabase/client";
import { daysBetween } from "@/lib/utils/format";
import type {
  AllocationWithProject,
  DocumentSummary,
  EmployeeDocumentWithType,
  EmployeeFilters,
  EmployeeListItem,
  EmployeeRepository,
  ProjectRepository,
} from "../repository";
import type {
  Employee,
  EmployeeCompensation,
  EmployeeEvent,
  HseRecord,
  Project,
} from "../types";

const EXPIRY_WARNING_DAYS = 30;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowToEmployee(r: Record<string, unknown>): Employee {
  return {
    id: r.id as string,
    tenant_id: r.tenant_id as string,
    hr_code: r.hr_code as string,
    name_ar: r.name_ar as string,
    name_en: r.name_en as string,
    national_id: r.national_id as string,
    mobile: r.mobile as string,
    personal_email: (r.personal_email as string) ?? null,
    work_email: (r.work_email as string) ?? null,
    photo_path: (r.photo_path as string) ?? null,
    job_title_id: r.job_title_id as string,
    grade_id: (r.grade_id as string) ?? null,
    department_id: (r.department_id as string) ?? null,
    direct_manager_id: (r.direct_manager_id as string) ?? null,
    employment_type: (r.employment_type as Employee["employment_type"]) ?? "permanent",
    collar: (r.collar as Employee["collar"]) ?? "white",
    hire_date: r.hire_date as string,
    contract_signing_date: (r.contract_signing_date as string) ?? null,
    status: (r.status as Employee["status"]) ?? "active",
    social_insurance_number: (r.social_insurance_number as string) ?? null,
    insurance_office: (r.insurance_office as string) ?? null,
    is_rehire: (r.is_rehire as boolean) ?? false,
    requires_medical_exam: (r.requires_medical_exam as boolean) ?? false,
    safety_sensitive_role: (r.safety_sensitive_role as boolean) ?? false,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    archived_at: (r.archived_at as string) ?? null,
  };
}

export class SupabaseEmployeeRepository implements EmployeeRepository {
  async list(filters: EmployeeFilters = {}): Promise<EmployeeListItem[]> {
    let query = supabase
      .from("employees")
      .select(
        `
        *,
        job_title:job_titles!job_title_id(*),
        grade:grades!grade_id(*),
        allocations:employee_project_allocations!employee_id(
          *,
          project:projects!project_id(*)
        )
      `
      )
      .is("archived_at", null)
      .order("hr_code", { ascending: true });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.collar) {
      query = query.eq("collar", filters.collar);
    }
    if (filters.q) {
      const q = filters.q.trim();
      query = query.or(
        `name_ar.ilike.%${q}%,name_en.ilike.%${q}%,hr_code.ilike.%${q}%,national_id.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("SupabaseEmployeeRepository.list error:", error);
      return [];
    }

    let items: EmployeeListItem[] = (data ?? []).map((row: Record<string, unknown>) => {
      const employee = rowToEmployee(row);
      const allocs = (row.allocations as Record<string, unknown>[]) ?? [];
      const activeAllocs = allocs
        .filter((a) => !a.end_date)
        .sort(
          (a, b) =>
            (b.allocation_pct as number) - (a.allocation_pct as number)
        );
      const primaryProject =
        activeAllocs.length > 0
          ? (activeAllocs[0].project as {
              id: string;
              tenant_id: string;
              code: string;
              name_ar: string;
              name_en: string;
              status: string;
              project_manager_id: string | null;
              location_id: string | null;
              created_at: string;
              updated_at: string;
              archived_at: string | null;
            })
          : null;

      return {
        employee,
        job_title: row.job_title as EmployeeListItem["job_title"],
        grade: (row.grade as EmployeeListItem["grade"]) ?? null,
        project: primaryProject as Project | null,
        documents: {
          total: 0,
          received: 0,
          missing: 0,
          expiring_soon: null,
        } as DocumentSummary,
      };
    });

    if (filters.project_id) {
      items = items.filter(
        (item) => item.project?.id === filters.project_id
      );
    }

    // Enrich document summaries
    for (const item of items) {
      item.documents = await this.getDocumentSummary(item.employee);
    }

    return items;
  }

  async getById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return rowToEmployee(data);
  }

  async getListItem(id: string): Promise<EmployeeListItem | null> {
    const { data, error } = await supabase
      .from("employees")
      .select(
        `
        *,
        job_title:job_titles!job_title_id(*),
        grade:grades!grade_id(*),
        allocations:employee_project_allocations!employee_id(
          *,
          project:projects!project_id(*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    const employee = rowToEmployee(row);
    const allocs = (row.allocations as Record<string, unknown>[]) ?? [];
    const activeAllocs = allocs
      .filter((a) => !a.end_date)
      .sort(
        (a, b) =>
          (b.allocation_pct as number) - (a.allocation_pct as number)
      );

    return {
      employee,
      job_title: row.job_title as EmployeeListItem["job_title"],
      grade: (row.grade as EmployeeListItem["grade"]) ?? null,
      project:
        activeAllocs.length > 0
          ? (activeAllocs[0].project as Project)
          : null,
      documents: await this.getDocumentSummary(employee),
    };
  }

  async getDocuments(
    employeeId: string
  ): Promise<EmployeeDocumentWithType[]> {
    const { data, error } = await supabase
      .from("employee_documents")
      .select(
        `
        *,
        document_type:document_types!document_type_id(*)
      `
      )
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return (data as unknown as EmployeeDocumentWithType[]).sort(
      (a, b) => a.document_type.sort_order - b.document_type.sort_order
    );
  }

  async getEvents(employeeId: string): Promise<EmployeeEvent[]> {
    const { data, error } = await supabase
      .from("employee_events")
      .select("*")
      .eq("employee_id", employeeId)
      .order("effective_date", { ascending: false });
    if (error || !data) return [];
    return data as unknown as EmployeeEvent[];
  }

  async getAllocations(
    employeeId: string
  ): Promise<AllocationWithProject[]> {
    const { data, error } = await supabase
      .from("employee_project_allocations")
      .select(
        `
        *,
        project:projects!project_id(*),
        work_location:work_locations!work_location_id(*)
      `
      )
      .eq("employee_id", employeeId)
      .is("end_date", null)
      .order("allocation_pct", { ascending: false });

    if (error || !data) return [];
    return data as unknown as AllocationWithProject[];
  }

  async getCompensation(
    employeeId: string
  ): Promise<EmployeeCompensation | null> {
    const { data, error } = await supabase
      .from("employee_compensation")
      .select("*")
      .eq("employee_id", employeeId)
      .single();
    if (error || !data) return null;
    return data as unknown as EmployeeCompensation;
  }

  async getHseRecords(employeeId: string): Promise<HseRecord[]> {
    const { data, error } = await supabase
      .from("hse_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("issued_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as HseRecord[];
  }

  private async getDocumentSummary(
    employee: Employee
  ): Promise<DocumentSummary> {
    const docs = await this.getDocuments(employee.id);
    const received = docs.filter(
      (d) => d.status === "received" || d.status === "verified"
    );
    let expiring: DocumentSummary["expiring_soon"] = null;
    const now = today();
    for (const doc of received) {
      if (!doc.expiry_date) continue;
      const days = daysBetween(now, doc.expiry_date);
      if (
        days <= EXPIRY_WARNING_DAYS &&
        days > 0 &&
        (!expiring || days < expiring.days_left)
      ) {
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
}

export class SupabaseProjectRepository implements ProjectRepository {
  async list(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "active")
      .is("archived_at", null)
      .order("code", { ascending: true });
    if (error || !data) return [];
    return data as unknown as Project[];
  }
}
