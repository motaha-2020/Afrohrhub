import type { DocumentType } from "./types";
import type {
  ApprovalRepository,
  EmployeeRepository,
  ProjectRepository,
} from "./repository";
import {
  MockApprovalRepository,
  MockEmployeeRepository,
  MockProjectRepository,
} from "./mock/repositories";
import {
  SupabaseApprovalRepository,
  SupabaseEmployeeRepository,
  SupabaseProjectRepository,
  listDocumentTypesFromDb,
} from "./supabase/repositories";
import { DOCUMENT_TYPES } from "./mock/seed";
import { isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Data-layer entry point. When Supabase server access is configured
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) the Core-HR screens
 * read the real `afrohr` database; otherwise they fall back to the mock seed
 * so the app still runs with no secrets. Reads (employees, projects, document
 * types, approvals inbox) come from the DB; approval decisions are not yet
 * written back (Approval Engine write path is a later step).
 */
export const employeeRepository: EmployeeRepository = isSupabaseConfigured
  ? new SupabaseEmployeeRepository()
  : new MockEmployeeRepository();

export const projectRepository: ProjectRepository = isSupabaseConfigured
  ? new SupabaseProjectRepository()
  : new MockProjectRepository();

export const approvalRepository: ApprovalRepository = isSupabaseConfigured
  ? new SupabaseApprovalRepository()
  : new MockApprovalRepository();

/** Tenant document checklist (DB when configured, else seed). */
export async function listDocumentTypes(): Promise<DocumentType[]> {
  if (isSupabaseConfigured) return listDocumentTypesFromDb();
  return [...DOCUMENT_TYPES].sort((a, b) => a.sort_order - b.sort_order);
}
