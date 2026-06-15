import "server-only";
import type { MatchResult, ParsedCv } from "@/lib/data/types";
import { MOCK_MATCH_RESULT, MOCK_PARSED_CV } from "@/lib/data/mock/ai";
import { aiEnabled, structured } from "./client";

/**
 * Recruitment AI — CV parsing into a structured candidate profile, and
 * explainable candidate ↔ job matching. Claude Opus 4.8 + structured outputs.
 */

const CV_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name_en: { type: "string" },
    name_ar: { type: "string" },
    title_en: { type: "string" },
    years_experience: { type: "integer" },
    skills: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
    education: { type: "string" },
    summary_en: { type: "string" },
  },
  required: [
    "name_en",
    "name_ar",
    "title_en",
    "years_experience",
    "skills",
    "certifications",
    "education",
    "summary_en",
  ],
} as const;

const CV_SYSTEM =
  "You parse a raw CV (Arabic or English) into a structured candidate profile " +
  "for a contracting-company talent pool. Normalize the job title, total " +
  "years of experience, distinct skills, and certifications. Provide name_ar in " +
  "Arabic and a romanized name_en. Keep summary_en to one or two sentences.";

export async function parseCv(cvText: string): Promise<ParsedCv> {
  if (!aiEnabled() || !cvText.trim()) return MOCK_PARSED_CV;
  return structured<ParsedCv>({
    system: CV_SYSTEM,
    content: `Parse this CV into the candidate profile schema:\n\n${cvText}`,
    schema: CV_SCHEMA,
  });
}

const MATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    match_pct: { type: "integer", description: "0–100 overall fit" },
    strengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    rationale_en: { type: "string" },
    rationale_ar: { type: "string" },
  },
  required: ["match_pct", "strengths", "gaps", "rationale_en", "rationale_ar"],
} as const;

const MATCH_SYSTEM =
  "You score how well a candidate fits an open role at an Egyptian contracting " +
  "company. Weigh required skills and experience, certifications (especially HSE " +
  "for safety-sensitive roles), and salary fit against the approved range. Return " +
  "a calibrated match_pct, concise strengths and gaps, and a one-sentence rationale " +
  "in English and Arabic. Be honest about gaps — do not inflate the score.";

export async function matchCandidateToJob(input: {
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
  if (!aiEnabled()) return MOCK_MATCH_RESULT;
  const prompt = [
    `Open role: ${input.jobTitle}`,
    `Requirements: ${input.requirements}`,
    `Approved salary range: ${input.salaryRange}`,
    "",
    "Candidate:",
    `- Title: ${input.candidate.title}`,
    `- Experience: ${input.candidate.years_experience} years`,
    `- Skills: ${input.candidate.skills.join(", ")}`,
    `- Certifications: ${input.candidate.certifications.join(", ")}`,
    `- Expected salary: ${input.candidate.expected_salary} EGP`,
  ].join("\n");
  return structured<MatchResult>({
    system: MATCH_SYSTEM,
    content: prompt,
    schema: MATCH_SCHEMA,
    maxTokens: 1024,
  });
}
