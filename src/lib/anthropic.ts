import Anthropic from "@anthropic-ai/sdk";
import { sfNow, type CafeFilters } from "./workscore";
import { aiSystemPrompt, sanitizeAiFilters } from "./ai-common";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const MAX_TOKENS = 256;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface AiParseResult {
  filters: CafeFilters;
  explanation: string;
}

/**
 * Parse a plain-language cafe query into filters using Muse.
 * Strictly validated; throws on any failure so callers can fall back.
 */
export async function parseQueryAi(query: string): Promise<AiParseResult> {
  const client = new Anthropic();
  const now = sfNow();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: aiSystemPrompt(now),
    messages: [{ role: "user", content: query.slice(0, 500) }],
  });

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("bad shape");
  }
  const p = parsed as { filters?: unknown; explanation?: unknown };
  return {
    filters: sanitizeAiFilters(p.filters),
    explanation:
      typeof p.explanation === "string" && p.explanation.length <= 200
        ? p.explanation
        : "AI-matched spots.",
  };
}
