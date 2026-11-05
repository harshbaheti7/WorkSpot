import type { Cafe, HourRow } from "@/data/cafes";

/** Search filters the UI and the AI layer share. All fields optional. */
export interface CafeFilters {
  wifi?: boolean;
  outlets?: boolean;
  maxNoise?: 1 | 2 | 3 | 4 | 5;
  laptopOk?: boolean;
  neighborhood?: string;
  /** 0=Sunday..6=Saturday. Alone = open that day; with time = open then. */
  day?: number;
  /** Must open by this minute. Without day = matches any day. */
  timeFrom?: number;
  /** Must close after this minute. Without day = matches any day. */
  timeTo?: number;
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

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 540 -> "9AM", 990 -> "4:30PM". */
export function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = ((min % 60) + 60) % 60;
  const suffix = h24 < 12 ? "AM" : "PM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h}${suffix}` : `${h}:${String(m).padStart(2, "0")}${suffix}`;
}

/** Current SF day + time, regardless of server timezone. */
export function sfNow(): { day: number; timeMin: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    day: dayMap[get("weekday")] ?? 0,
    timeMin:
      (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10),
  };
}

/** True when open at all on day. Empty hours (unknown) counts as open. */
export function isOpenDay(hours: HourRow[] | undefined, day: number): boolean {
  if (!hours || hours.length === 0) return true;
  return hours.some((h) => h.weekday === day);
}

/**
 * True when open on `day` within the given bounds: opens at/before `from`
 * and closes at/after `to` (either may be undefined = unconstrained).
 * from === to is a point in time. Empty hours (unknown) counts as open.
 */
export function matchesTimeBounds(
  hours: HourRow[] | undefined,
  day: number,
  from?: number,
  to?: number
): boolean {
  if (!hours || hours.length === 0) return true;
  const prev = (day + 6) % 7;
  const rows = hours.filter((h) => h.weekday === day);
  const prevOvernight = hours.filter(
    (h) => h.weekday === prev && h.closesMin <= h.opensMin
  );
  if (rows.length === 0 && prevOvernight.length === 0) return false;
  if (
    from !== undefined &&
    !(
      rows.some((r) => r.opensMin <= from) ||
      prevOvernight.some((r) => r.closesMin > from)
    )
  ) {
    return false;
  }
  if (to !== undefined) {
    const ok =
      rows.some((r) =>
        r.closesMin > r.opensMin ? r.closesMin >= to : true
      ) || prevOvernight.some((r) => r.closesMin >= to);
    if (!ok) return false;
  }
  return true;
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
    if (f.day !== undefined) {
      if (f.timeFrom !== undefined || f.timeTo !== undefined) {
        if (!matchesTimeBounds(c.hours, f.day, f.timeFrom, f.timeTo))
          return false;
      } else if (!isOpenDay(c.hours, f.day)) return false;
    } else if (f.timeFrom !== undefined || f.timeTo !== undefined) {
      let anyDay = false;
      for (let d = 0; d < 7; d++) {
        if (matchesTimeBounds(c.hours, d, f.timeFrom, f.timeTo)) {
          anyDay = true;
          break;
        }
      }
      if (!anyDay) return false;
    }
    return true;
  });
}

/** Hour + meridiem to minutes since midnight. */
function hmToMin(h: number, mnt: number, mer: string): number {
  return ((h % 12) + (mer === "pm" ? 12 : 0)) * 60 + mnt;
}

/** Parse "till 10pm" / "open until 9" (evening context, defaults PM). */
function parseTillPhrase(q: string): number | null {
  const m = q.match(
    /\b(?:open\s+)?(?:till|until|til)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/
  );
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mnt = m[2] ? parseInt(m[2], 10) : 0;
  if (h > 12 || mnt > 59) return null;
  return hmToMin(h, mnt, m[3] ?? "pm");
}

/** Parse "opens by 9" / "open by 9am" (morning context, defaults AM). */
function parseOpensByPhrase(q: string): number | null {
  const m = q.match(/\bopens?\s+by\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mnt = m[2] ? parseInt(m[2], 10) : 0;
  if (h > 12 || mnt > 59) return null;
  return hmToMin(h, mnt, m[3] ?? "am");
}

/**
 * Parse "9 to 5", "9am-5pm", "from 2pm until 6pm" into minutes.
 * Bare numbers assume AM->PM across noon ("9 to 5" = 9AM-5PM).
 */
function parseRangePhrase(q: string): { from: number; to: number } | null {
  const m = q.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|–|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/
  );
  if (!m) return null;
  const h1 = parseInt(m[1], 10);
  const m1 = m[2] ? parseInt(m[2], 10) : 0;
  const h2 = parseInt(m[4], 10);
  const m2 = m[5] ? parseInt(m[5], 10) : 0;
  if (h1 > 12 || h2 > 12 || m1 > 59 || m2 > 59) return null;
  let mer1 = m[3] ?? null;
  let mer2 = m[6] ?? null;
  if (!mer1 && !mer2) {
    mer1 = "am";
    mer2 = h2 === 12 || h2 < h1 ? "pm" : "am";
  } else if (mer1 && !mer2) {
    mer2 = mer1 === "am" && (h2 === 12 || h2 < h1) ? "pm" : mer1;
  } else if (!mer1 && mer2) {
    mer1 = h1 === 12 ? mer2 : "am";
  }
  const from = hmToMin(h1, m1, mer1 as string);
  const to = hmToMin(h2, m2, mer2 as string);
  if (from === to) return null;
  return { from, to };
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
  const now = sfNow();
  if (/(open now|open right now)/.test(q)) {
    filters.day = now.day;
    filters.timeFrom = now.timeMin;
    filters.timeTo = now.timeMin;
    bits.push("open now");
  } else {
    for (let i = 0; i < WEEKDAY_NAMES.length; i++) {
      if (new RegExp(`\\b${WEEKDAY_NAMES[i].toLowerCase()}s?\\b`).test(q)) {
        filters.day = i;
        bits.push(WEEKDAY_NAMES[i]);
        break;
      }
    }
    const range = parseRangePhrase(q);
    const till = range ? null : parseTillPhrase(q);
    const opensBy = range || till !== null ? null : parseOpensByPhrase(q);
    if (range) {
      filters.timeFrom = range.from;
      filters.timeTo = range.to;
      bits.push(`${fmtTime(range.from)}–${fmtTime(range.to)}`);
    } else if (till !== null) {
      filters.timeTo = till;
      bits.push(`till ${fmtTime(till)}`);
    } else if (opensBy !== null) {
      filters.timeFrom = opensBy;
      bits.push(`opens by ${fmtTime(opensBy)}`);
    } else if (/\bopen late\b|late[- ]night/.test(q)) {
      filters.timeFrom = 22 * 60;
      filters.timeTo = 22 * 60;
      bits.push("open late");
    } else if (/\bmorning\b/.test(q)) {
      filters.timeFrom = 9 * 60;
      filters.timeTo = 9 * 60;
      bits.push("mornings");
    } else if (/\bafternoon\b/.test(q)) {
      filters.timeFrom = 14 * 60;
      filters.timeTo = 14 * 60;
      bits.push("afternoons");
    } else if (/\bevening\b/.test(q)) {
      filters.timeFrom = 19 * 60;
      filters.timeTo = 19 * 60;
      bits.push("evenings");
    }
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
