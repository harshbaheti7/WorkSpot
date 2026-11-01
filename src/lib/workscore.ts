import type { Cafe } from "@/data/cafes";

/** Search filters the UI and the AI layer share. All fields optional. */
export interface CafeFilters {
  wifi?: boolean;
  outlets?: boolean;
  maxNoise?: 1 | 2 | 3 | 4 | 5;
  laptopOk?: boolean;
  neighborhood?: string;
}

export const EMPTY_FILTERS: CafeFilters = {};

/** 0–100 work-friendliness score. Unknowns count as neutral, never zero. */
export function workScore(c: Cafe): number {
  let s = 0;
  s += c.wifi === "yes" ? 30 : c.wifi === "weekdays" ? 15 : c.wifi === null ? 15 : 0;
  s +=
    c.outlets === "many"
      ? 25
      : c.outlets === "some"
        ? 18
        : c.outlets === "few"
          ? 10
          : c.outlets === null
            ? 12
            : 0;
  s +=
    c.noise === 1
      ? 20
      : c.noise === 2
        ? 17
        : c.noise === 3
          ? 12
          : c.noise === 4
            ? 5
            : c.noise === 5
              ? 0
              : 10;
  s += c.laptop === "welcome" ? 15 : c.laptop === "limited" ? 7 : c.laptop === null ? 7 : 0;
  s += 10; // seating/comfort baseline for v1
  return Math.min(100, s);
}

export function scoreLabel(s: number): string {
  if (s >= 80) return "Excellent";
  if (s >= 65) return "Good";
  if (s >= 50) return "Decent";
  return "Rough";
}

export function applyFilters<T extends Cafe>(cafes: T[], f: CafeFilters): T[] {
  return cafes.filter((c) => {
    if (f.wifi && c.wifi === "no") return false;
    if (f.outlets && c.outlets === "none") return false;
    if (f.maxNoise !== undefined && c.noise !== null && c.noise > f.maxNoise)
      return false;
    if (f.laptopOk && c.laptop === "banned") return false;
    if (
      f.neighborhood &&
      !c.neighborhood.toLowerCase().includes(f.neighborhood.toLowerCase())
    )
      return false;
    return true;
  });
}

/** Local (no-key) plain-language parser: keyword rules, no LLM. */
export function parseQueryLocal(query: string): {
  filters: CafeFilters;
  explanation: string;
} {
  const q = query.toLowerCase();
  const filters: CafeFilters = {};
  const bits: string[] = [];

  if (/(wifi|wi-fi|internet|online|zoom|call)/.test(q)) {
    filters.wifi = true;
    bits.push("WiFi");
  }
  if (/(outlet|plug|charg|power|battery)/.test(q)) {
    filters.outlets = true;
    bits.push("outlets");
  }
  if (/(quiet|silent|calm|peaceful|focus|library)/.test(q)) {
    filters.maxNoise = 2;
    bits.push("quiet");
  } else if (/(not (too )?loud|moderate)/.test(q)) {
    filters.maxNoise = 3;
    bits.push("not too loud");
  }
  if (/(laptop|work|study|remote|meeting)/.test(q)) {
    filters.laptopOk = true;
    bits.push("laptop-friendly");
  }
  const hoods = [
    "mission",
    "sunset",
    "richmond",
    "noe valley",
    "castro",
    "soma",
    "financial district",
    "pacific heights",
    "lower pacific heights",
    "haight",
    "lower haight",
    "nopa",
    "fillmore",
    "bernal",
    "russian hill",
    "union square",
    "north beach",
    "ocean",
    "dogpatch",
    "parkside",
    "mission bay",
    "west portal",
    "nob hill",
    "marina",
    "hayes valley",
    "duboce",
    "bayview",
  ];
  for (const h of hoods) {
    if (q.includes(h)) {
      filters.neighborhood = h;
      bits.push(`near ${h}`);
      break;
    }
  }

  const explanation =
    bits.length > 0
      ? `Showing spots with ${bits.join(" · ")} (local match).`
      : "Showing all spots (local match).";
  return { filters, explanation };
}
