import Anthropic from "@anthropic-ai/sdk";
import type { CafeFilters } from "./workscore";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const MAX_TOKENS = 256;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface AiParseResult {
  filters: CafeFilters;
  explanation: string;
}

function sanitizeFilters(raw: unknown): CafeFilters {
  const f: CafeFilters = {};
  if (typeof raw !== "object" || raw === null) return f;
  const r = raw as Record<string, unknown>;
  if (r.wifi === true) f.wifi = true;
  if (r.outlets === true) f.outlets = true;
  if (
    typeof r.maxNoise === "number" &&
    [1, 2, 3, 4, 5].includes(r.maxNoise)
  ) {
    f.maxNoise = r.maxNoise as 1 | 2 | 3 | 4 | 5;
  }
  if (r.laptopOk === true) f.laptopOk = true;
  if (typeof r.neighborhood === "string" && r.neighborhood.length <= 60) {
    f.neighborhood = r.neighborhood;
  }
  return f;
}

/**
 * Parse a plain-language cafe query into filters using Muse.
 * Strictly validated; throws on any failure so callers can fall back.
 */
export async function parseQueryAi(query: string): Promise<AiParseResult> {
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system:
      "You turn cafe search requests into JSON filters. " +
      'Reply with exactly one JSON object: {"filters": {"wifi"?: true, "outlets"?: true, "maxNoise"?: 1|2|3|4|5, "laptopOk"?: true, "neighborhood"?: string}, "explanation": string}. ' +
      "Only include a filter when the request clearly asks for it. " +
      'maxNoise: quiet=2, moderate=3. explanation: one short sentence, no quotes, e.g. "Quiet Mission spots with outlets."',
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
    filters: sanitizeFilters(p.filters),
    explanation:
      typeof p.explanation === "string" && p.explanation.length <= 200
        ? p.explanation
        : "AI-matched spots.",
  };
}
