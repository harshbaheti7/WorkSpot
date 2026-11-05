import { WEEKDAY_NAMES, type CafeFilters } from "./workscore";

/** Strict allowlist: both AI engines share this so they can't drift. */
export function sanitizeAiFilters(raw: unknown): CafeFilters {
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

/** Identical filter prompt for every AI engine. */
export function aiSystemPrompt(now: { day: number; timeMin: number }): string {
  return (
    "You turn cafe search requests into JSON filters. " +
    'Reply with exactly one JSON object: {"filters": {"wifi"?: true, "outlets"?: true, "maxNoise"?: 1|2|3|4|5, "laptopOk"?: true, "neighborhood"?: string, "day"?: 0-6, "timeFrom"?: 0-1439, "timeTo"?: 0-1440}, "explanation": string}. ' +
    "Only include a filter when the request clearly asks for it. " +
    `Today is ${WEEKDAY_NAMES[now.day]} (SF time). day: 0=Sunday..6=Saturday; omit it unless the request names a day or says now/today/tonight. timeFrom/timeTo: minutes since midnight (9AM=540, 2PM=840, 7PM=1140, 10PM=1320). Cafe must open by timeFrom and close after timeTo; either may be omitted. ` +
    '"open now" -> today + from=to=current minutes ' +
    `${now.timeMin}. "9 to 5" -> from=540, to=1020. "open late" -> from=to=1320. "open till 10PM" -> to=1320 only. "opens by 9" -> from=540 only. ` +
    'maxNoise: quiet=2, moderate=3. explanation: one short sentence, no quotes, e.g. "Quiet Mission spots with outlets."'
  );
}
