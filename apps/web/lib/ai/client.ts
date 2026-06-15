import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * AI layer (Session 11) — Claude API integration.
 *
 * Always uses Claude Opus 4.8 (`claude-opus-4-8`), the most capable model,
 * with structured outputs (`output_config.format`) so every feature returns
 * a typed, parseable object. When `ANTHROPIC_API_KEY` is absent the layer
 * falls back to deterministic mock inference so the app still builds and
 * runs in the demo — the real call path is identical and goes live the
 * moment the key is set (same pattern as the Supabase Auth scaffold).
 */

export const AI_MODEL = "claude-opus-4-8";

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

/** A single content block — text and/or a base64 image (for vision OCR). */
export type AiContent = string | Anthropic.ContentBlockParam[];

/**
 * One structured-output request against Claude. The JSON schema constrains
 * the response so the first text block is always valid JSON for `T`.
 */
export async function structured<T>(opts: {
  system: string;
  content: AiContent;
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<T> {
  const params: Anthropic.MessageCreateParamsNonStreaming & {
    output_config?: { format: { type: "json_schema"; schema: Record<string, unknown> } };
  } = {
    model: AI_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [
      {
        role: "user",
        content: opts.content as Anthropic.MessageParam["content"],
      },
    ],
    output_config: { format: { type: "json_schema", schema: opts.schema } },
  };

  const response = await anthropic().messages.create(params);
  const text =
    response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    )?.text ?? "{}";
  return JSON.parse(text) as T;
}

/** Builds a base64 image content block for vision (OCR / classification). */
export function imageBlock(
  base64: string,
  mediaType: "image/png" | "image/jpeg" | "image/webp" = "image/jpeg"
): Anthropic.ContentBlockParam {
  return {
    type: "image",
    source: { type: "base64", media_type: mediaType, data: base64 },
  };
}
