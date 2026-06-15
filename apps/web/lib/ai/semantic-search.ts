import "server-only";
import type { SearchHit } from "@/lib/data/types";
import { MOCK_SEARCH_HITS } from "@/lib/data/mock/ai";
import { aiEnabled, structured } from "./client";

/**
 * Semantic search across employee records and documents — Claude Opus 4.8
 * ranks a candidate corpus against a natural-language query and explains
 * each hit. (Production swaps the in-prompt corpus for vector retrieval;
 * the ranking + rationale step stays.)
 */

export interface SearchDoc {
  id: string;
  label: string;
  text: string;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    hits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          score: { type: "integer", description: "0–100 relevance" },
          reason: { type: "string" },
        },
        required: ["id", "label", "score", "reason"],
      },
    },
  },
  required: ["hits"],
} as const;

const SYSTEM =
  "You are a semantic search engine over an HR system's employee records and " +
  "documents. Given a natural-language query and a candidate corpus, return the " +
  "most relevant entries ranked by a 0–100 relevance score, each with a short " +
  "reason. Match on meaning, not just keywords (e.g. 'welder' should surface " +
  "'argon TIG fabrication'). Omit entries that are not genuinely relevant.";

export async function semanticSearch(
  query: string,
  corpus: SearchDoc[]
): Promise<SearchHit[]> {
  if (!aiEnabled() || !query.trim()) return MOCK_SEARCH_HITS;
  const corpusText = corpus
    .map((d) => `[${d.id}] ${d.label}: ${d.text}`)
    .join("\n");
  const { hits } = await structured<{ hits: SearchHit[] }>({
    system: SYSTEM,
    content: `Query: ${query}\n\nCorpus:\n${corpusText}`,
    schema: SCHEMA,
    maxTokens: 1024,
  });
  return hits;
}
