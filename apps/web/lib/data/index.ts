import type { DocumentType } from "./types";
import type { EmployeeRepository, ProjectRepository } from "./repository";
import {
  SupabaseEmployeeRepository,
  SupabaseProjectRepository,
} from "./supabase/repositories";
import { supabase } from "@/lib/supabase/client";

export const employeeRepository: EmployeeRepository =
  new SupabaseEmployeeRepository();

export const projectRepository: ProjectRepository =
  new SupabaseProjectRepository();

export async function listDocumentTypes(): Promise<DocumentType[]> {
  const { data, error } = await supabase
    .from("document_types")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as unknown as DocumentType[];
}
