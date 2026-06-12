import type { DocumentType } from "./types";
import type { EmployeeRepository, ProjectRepository } from "./repository";
import {
  MockEmployeeRepository,
  MockProjectRepository,
} from "./mock/repositories";
import { DOCUMENT_TYPES } from "./mock/seed";

/**
 * Data-layer entry point. Screens import the singletons below; when the
 * Supabase backend lands, only these bindings change.
 */
export const employeeRepository: EmployeeRepository =
  new MockEmployeeRepository();

export const projectRepository: ProjectRepository = new MockProjectRepository();

/** Tenant document checklist (seeded — docs/02 §document_types). */
export async function listDocumentTypes(): Promise<DocumentType[]> {
  return [...DOCUMENT_TYPES].sort((a, b) => a.sort_order - b.sort_order);
}
