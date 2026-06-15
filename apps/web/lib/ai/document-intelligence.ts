import "server-only";
import type { DocClassification, IdExtraction } from "@/lib/data/types";
import {
  MOCK_DOC_CLASSIFICATION,
  MOCK_ID_EXTRACTION,
} from "@/lib/data/mock/ai";
import { aiEnabled, imageBlock, structured, type AiContent } from "./client";

/**
 * Document intelligence — national-ID / passport OCR and document
 * classification, powered by Claude Opus 4.8 vision + structured outputs.
 */

const ID_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name_ar: { type: "string" },
    name_en: { type: "string" },
    national_id: { type: "string" },
    birth_date: { type: "string", description: "YYYY-MM-DD" },
    gender: { type: "string", enum: ["male", "female", ""] },
    address: { type: "string" },
    issue_date: { type: ["string", "null"] },
    expiry_date: { type: ["string", "null"] },
    confidence: { type: "integer", description: "0–100" },
  },
  required: [
    "name_ar",
    "name_en",
    "national_id",
    "birth_date",
    "gender",
    "address",
    "issue_date",
    "expiry_date",
    "confidence",
  ],
} as const;

const ID_SYSTEM =
  "You are an OCR and data-extraction engine for Egyptian HR onboarding. " +
  "Extract the holder's fields from the supplied national ID or passport image. " +
  "Derive birth_date and gender from the 14-digit national number when present " +
  "(century digit, YYMMDD, governorate, and the gender digit). Romanize the Arabic " +
  "name for name_en. Report a calibrated confidence (0–100); never invent a value " +
  "you cannot read — leave it blank and lower the confidence instead.";

export async function extractIdFields(input: {
  imageBase64?: string;
  mediaType?: "image/png" | "image/jpeg" | "image/webp";
}): Promise<IdExtraction> {
  if (!aiEnabled() || !input.imageBase64) return MOCK_ID_EXTRACTION;
  const content: AiContent = [
    imageBlock(input.imageBase64, input.mediaType),
    { type: "text", text: "Extract the ID holder's fields." },
  ];
  return structured<IdExtraction>({
    system: ID_SYSTEM,
    content,
    schema: ID_SCHEMA,
  });
}

const CLASS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    doc_class: {
      type: "string",
      enum: [
        "national_id",
        "passport",
        "qualification",
        "contract",
        "criminal_record",
        "medical_report",
        "syndicate_card",
        "driving_license",
        "other",
      ],
    },
    confidence: { type: "integer" },
    rationale_ar: { type: "string" },
    rationale_en: { type: "string" },
  },
  required: ["doc_class", "confidence", "rationale_ar", "rationale_en"],
} as const;

const CLASS_SYSTEM =
  "You classify a scanned HR document into one of the known document types so " +
  "it can be auto-filed against the employee's 13-document checklist. Return the " +
  "single best class with a confidence and a one-sentence rationale in both Arabic " +
  "and English.";

export async function classifyDocument(input: {
  imageBase64?: string;
  mediaType?: "image/png" | "image/jpeg" | "image/webp";
  text?: string;
}): Promise<DocClassification> {
  if (!aiEnabled() || (!input.imageBase64 && !input.text)) {
    return MOCK_DOC_CLASSIFICATION;
  }
  const content: AiContent = input.imageBase64
    ? [
        imageBlock(input.imageBase64, input.mediaType),
        { type: "text", text: "Classify this document." },
      ]
    : `Classify this document from its extracted text:\n\n${input.text}`;
  return structured<DocClassification>({
    system: CLASS_SYSTEM,
    content,
    schema: CLASS_SCHEMA,
    maxTokens: 512,
  });
}
