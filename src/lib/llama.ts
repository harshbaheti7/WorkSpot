import { sfNow, type CafeFilters } from "./workscore";
import { aiSystemPrompt, sanitizeAiFilters } from "./ai-common";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const BASE_URL = "https://api.groq.com/openai/v1";
const MAX_TOKENS = 256;

export function llamaEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

interface AiParseResult {
  filters: CafeFilters;
  explanation: string;
}

/** Llama often wraps JSON in fences; take the fenced block when present. */
function stripFences(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: unknown } }>;
}

/**
 * Parse a plain-language cafe query into filters using Llama (via Groq).
 * Strictly validated; throws on any failure so callers can fall back.
 */
export async function parseQueryLlama(query: string): Promise<AiParseResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("missing key");
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0,
      messages: [
        { role: "system", content: aiSystemPrompt(sfNow()) },
        { role: "user", content: query.slice(0, 500) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = (await res.json()) as ChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("bad shape");
  const parsed: unknown = JSON.parse(stripFences(content));
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
