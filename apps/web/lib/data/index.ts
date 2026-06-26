import type { DocumentType } from "./types";
import type { EmployeeRepository, ProjectRepository } from "./repository";
import {
  SupabaseEmployeeRepository,
  SupabaseProjectRepository,
} from "./supabase/repositories";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const employeeRepository: EmployeeRepository =
  new SupabaseEmployeeRepository();

export const projectRepository: ProjectRepository =
  new SupabaseProjectRepository();

export async function listDocumentTypes(): Promise<DocumentType[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("document_types")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as unknown as DocumentType[];
}
