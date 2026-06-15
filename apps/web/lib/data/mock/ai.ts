import type {
  DocClassification,
  IdExtraction,
  MatchResult,
  ParsedCv,
  SearchHit,
} from "../types";

/**
 * Deterministic mock inference for the AI layer — used when
 * `ANTHROPIC_API_KEY` is unset so the demo runs without a key. The real
 * Claude Opus 4.8 calls (lib/ai/*) return the same shapes.
 */

export const MOCK_ID_EXTRACTION: IdExtraction = {
  name_ar: "سيد عبد العاطي حسن",
  name_en: "Sayed Abdel Aty Hassan",
  national_id: "28906152233445",
  birth_date: "1989-06-15",
  gender: "male",
  address: "Benban, Aswan Governorate",
  issue_date: "2021-03-10",
  expiry_date: "2028-03-09",
  confidence: 96,
};

export const MOCK_DOC_CLASSIFICATION: DocClassification = {
  doc_class: "national_id",
  confidence: 97,
  rationale_ar:
    "بطاقة رقم قومي مصرية — تحتوي على 14 رقماً قومياً وصورة وبيانات الميلاد.",
  rationale_en:
    "Egyptian National ID card — carries a 14-digit national number, photo, and birth data.",
};

export const MOCK_PARSED_CV: ParsedCv = {
  name_en: "Mahmoud Sayed El-Naggar",
  name_ar: "محمود سيد النجار",
  title_en: "Senior Argon Welder",
  years_experience: 9,
  skills: [
    "Argon (TIG) welding",
    "Pipe welding",
    "Blueprint reading",
    "ASME standards",
    "Working at heights",
  ],
  certifications: ["AWS D1.1", "Fire-fighting course", "Working-at-heights"],
  education: "Industrial Technical Diploma — Welding (2014)",
  summary_en:
    "Nine years on EPC and substation projects across Upper Egypt; strong on argon pipe welding and HSE-compliant site work.",
};

export const MOCK_MATCH_RESULT: MatchResult = {
  match_pct: 88,
  strengths: [
    "9 years' welding vs 5 required",
    "Holds AWS D1.1 + safety certs",
    "Available within notice period",
  ],
  gaps: ["No offshore experience", "Expected salary slightly above midpoint"],
  rationale_en:
    "Strong technical and HSE fit for an Argon Welder opening; experience and certifications exceed the requirement, with only minor salary and niche-experience gaps.",
  rationale_ar:
    "توافق فني وأمان قوي لوظيفة لحّام أرجون؛ الخبرة والشهادات تفوق المطلوب، مع فجوات بسيطة في الراتب المتوقع وخبرة بعينها.",
};

export const MOCK_SEARCH_HITS: SearchHit[] = [
  {
    id: "emp-002",
    label: "Mahmoud Sayed El-Naggar — Argon Welder",
    score: 94,
    reason: "Certified argon welder with working-at-heights clearance.",
  },
  {
    id: "emp-006",
    label: "Karim Fawzy El-Shenawy — Electrical Installer",
    score: 71,
    reason: "Safety-sensitive site technician; adjacent welding exposure.",
  },
  {
    id: "tp-003",
    label: "Talent pool — Structural welder (Benban)",
    score: 86,
    reason: "Welding skill match; available in the talent pool.",
  },
];
