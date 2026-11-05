import { NextResponse } from "next/server";
import { getCafes } from "@/lib/db";
import {
  applyFilters,
  parseQueryLocal,
  workScore,
  type CafeFilters,
} from "@/lib/workscore";
import { aiEnabled, parseQueryAi } from "@/lib/anthropic";
import { llamaEnabled, parseQueryLlama } from "@/lib/llama";

interface SearchBody {
  query?: unknown;
}

function sanitizeFilters(raw: unknown): CafeFilters {
  // Query comes from our own client, but validate anyway.
  if (typeof raw !== "object" || raw === null) return {};
  const r = raw as Record<string, unknown>;
  const f: CafeFilters = {};
  if (r.wifi === true) f.wifi = true;
  if (r.outlets === true) f.outlets = true;
  if (typeof r.maxNoise === "number" && [1, 2, 3, 4, 5].includes(r.maxNoise)) {
    f.maxNoise = r.maxNoise as 1 | 2 | 3 | 4 | 5;
  }
  if (r.laptopOk === true) f.laptopOk = true;
  if (typeof r.neighborhood === "string" && r.neighborhood.length <= 60) {
    f.neighborhood = r.neighborhood;
  }
  if (
    typeof r.day === "number" &&
    Number.isInteger(r.day) &&
    r.day >= 0 &&
    r.day <= 6
  ) {
    f.day = r.day;
  }
  if (
    typeof r.timeFrom === "number" &&
    Number.isInteger(r.timeFrom) &&
    r.timeFrom >= 0 &&
    r.timeFrom < 1440
  ) {
    f.timeFrom = r.timeFrom;
  }
  if (
    typeof r.timeTo === "number" &&
    Number.isInteger(r.timeTo) &&
    r.timeTo >= 0 &&
    r.timeTo <= 1440
  ) {
    f.timeTo = r.timeTo;
  }
  return f;
}

export async function POST(req: Request) {
  let query = "";
  try {
    const body = (await req.json()) as SearchBody;
    if (typeof body.query === "string") query = body.query.slice(0, 500);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let filters: CafeFilters = {};
  let explanation = "Showing all spots.";
  let mode: "llama" | "Muse" | "local" = "local";

  if (query.trim()) {
    let done = false;
    if (llamaEnabled()) {
      try {
        const ai = await parseQueryLlama(query);
        filters = ai.filters;
        explanation = ai.explanation;
        mode = "llama";
        done = true;
      } catch {
        // fall through to the next engine
      }
    }
    if (!done && aiEnabled()) {
      try {
        const ai = await parseQueryAi(query);
        filters = ai.filters;
        explanation = ai.explanation;
        mode = "Muse";
        done = true;
      } catch {
        // fall through to local rules
      }
    }
    if (!done) {
      const local = parseQueryLocal(query);
      filters = sanitizeFilters(local.filters);
      explanation = local.explanation;
    }
  }

  const cafes = await getCafes();
  const results = applyFilters(cafes, filters)
    .map((c) => ({ ...c, score: workScore(c) }))
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ mode, explanation, filters, results });
}
