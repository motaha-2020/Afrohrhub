"use server";

import {
  classifyDocument,
  extractIdFields,
} from "@/lib/ai/document-intelligence";
import { matchCandidateToJob, parseCv } from "@/lib/ai/recruitment-ai";
import { semanticSearch, type SearchDoc } from "@/lib/ai/semantic-search";
import { aiEnabled } from "@/lib/ai/client";
import type {
  DocClassification,
  IdExtraction,
  MatchResult,
  ParsedCv,
  SearchHit,
} from "@/lib/data/types";
import { EMPLOYEES, JOB_TITLES } from "@/lib/data/mock/seed";
import { TALENT_POOL } from "@/lib/data/mock/recruitment";

export async function isAiLive(): Promise<boolean> {
  return aiEnabled();
}

export async function extractIdAction(): Promise<IdExtraction> {
  // The demo passes no image, so this returns the mock extraction; with a
  // key + an uploaded ID image it runs Claude vision OCR.
  return extractIdFields({});
}

export async function classifyAction(text: string): Promise<DocClassification> {
  return classifyDocument({ text });
}

export async function parseCvAction(cvText: string): Promise<ParsedCv> {
  return parseCv(cvText);
}

export async function matchAction(input: {
  jobTitle: string;
  requirements: string;
  salaryRange: string;
  candidate: {
    title: string;
    years_experience: number;
    skills: string[];
    certifications: string[];
    expected_salary: number;
  };
}): Promise<MatchResult> {
  return matchCandidateToJob(input);
}

/** Builds the search corpus from active employees + the talent pool. */
function buildCorpus(): SearchDoc[] {
  const jobName = (id: string) =>
    JOB_TITLES.find((j) => j.id === id)?.name_en ?? "";
  const employees: SearchDoc[] = EMPLOYEES.map((e) => ({
    id: e.id,
    label: `${e.name_en} — ${jobName(e.job_title_id)}`,
    text: [
      jobName(e.job_title_id),
      e.collar === "blue" ? "blue-collar site worker" : "white-collar staff",
      e.safety_sensitive_role ? "safety-sensitive role" : "",
      e.requires_medical_exam ? "medical exam required" : "",
      `status ${e.status}`,
    ]
      .filter(Boolean)
      .join("; "),
  }));
  const pool: SearchDoc[] = TALENT_POOL.map((t) => ({
    id: t.id,
    label: `Talent pool — ${t.title_en} (${t.name_en})`,
    text: `${t.title_en}; skills: ${t.skills.join(", ")}; ${t.years_experience} years`,
  }));
  return [...employees, ...pool];
}

export async function searchAction(query: string): Promise<SearchHit[]> {
  return semanticSearch(query, buildCorpus());
}
