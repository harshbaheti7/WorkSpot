import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CAFES, type Cafe, type HourRow } from "@/data/cafes";
import HOURS_JSON from "@/data/hours.json";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

interface CafeRow {
  id: string;
  name: string;
  neighborhood: string;
  address: string | null;
  maps_url: string | null;
  lat: number | null;
  lng: number | null;
  wifi: string | null;
  wifi_note: string | null;
  outlets: string | null;
  outlets_note: string | null;
  noise: number | null;
  noise_note: string | null;
  laptop: string | null;
  laptop_note: string | null;
  hours_note: string | null;
  summary: string;
  rating: number | null;
  price: string | null;
  user_note: string | null;
  source: string;
}

interface HoursRow {
  cafe_id: string;
  weekday: number;
  opens_min: number;
  closes_min: number;
}

function toCafe(r: CafeRow): Cafe {
  return {
    id: r.id,
    name: r.name,
    neighborhood: r.neighborhood,
    address: r.address,
    mapsUrl: r.maps_url,
    lat: r.lat,
    lng: r.lng,
    wifi: (r.wifi as Cafe["wifi"]) ?? null,
    wifiNote: r.wifi_note,
    outlets: (r.outlets as Cafe["outlets"]) ?? null,
    outletsNote: r.outlets_note,
    noise: (r.noise as Cafe["noise"]) ?? null,
    noiseNote: r.noise_note,
    laptop: (r.laptop as Cafe["laptop"]) ?? null,
    laptopNote: r.laptop_note,
    hoursNote: r.hours_note,
    summary: r.summary,
    rating: r.rating,
    price: r.price,
    userNote: r.user_note,
    source: r.source === "owner" ? "owner" : "guide",
  };
}

/** Seed fallback hours from the bundled map (same source as migration 0002). */
function fallbackHours(id: string): HourRow[] {
  const rows = (HOURS_JSON as unknown as Record<string, unknown>)[id];
  if (!Array.isArray(rows)) return [];
  return (
    rows as Array<[number, number, number]>
  ).map(([weekday, opensMin, closesMin]) => ({
    weekday,
    opensMin,
    closesMin,
  }));
}

function withFallback(list: Cafe[]): Cafe[] {
  return list.map((c) => ({ ...c, hours: fallbackHours(c.id) }));
}

/**
 * All cafes, Supabase-first with seed fallback.
 * Falls back when env is missing, tables aren't migrated yet, or reads fail.
 */
export async function getCafes(): Promise<Cafe[]> {
  const sb = getClient();
  if (!sb) return withFallback(CAFES);
  const [cafesRes, hoursRes] = await Promise.all([
    sb.from("cafes").select("*"),
    sb.from("cafe_hours").select("*"),
  ]);
  if (cafesRes.error || !cafesRes.data) return withFallback(CAFES);
  const byCafe = new Map<string, HourRow[]>();
  if (!hoursRes.error && hoursRes.data) {
    for (const h of hoursRes.data as HoursRow[]) {
      const list = byCafe.get(h.cafe_id) ?? [];
      list.push({
        weekday: h.weekday,
        opensMin: h.opens_min,
        closesMin: h.closes_min,
      });
      byCafe.set(h.cafe_id, list);
    }
  }
  return (cafesRes.data as CafeRow[]).map((r) => ({
    ...toCafe(r),
    hours: byCafe.get(r.id) ?? fallbackHours(r.id),
  }));
}

export async function getCafeById(id: string): Promise<Cafe | undefined> {
  const sb = getClient();
  if (!sb) {
    const c = CAFES.find((c) => c.id === id);
    return c ? { ...c, hours: fallbackHours(id) } : undefined;
  }
  const [cafesRes, hoursRes] = await Promise.all([
    sb.from("cafes").select("*").eq("id", id).single(),
    sb.from("cafe_hours").select("*").eq("cafe_id", id),
  ]);
  if (cafesRes.error || !cafesRes.data) {
    const c = CAFES.find((c) => c.id === id);
    return c ? { ...c, hours: fallbackHours(id) } : undefined;
  }
  const cafe = toCafe(cafesRes.data as CafeRow);
  if (!hoursRes.error && hoursRes.data) {
    cafe.hours = (hoursRes.data as HoursRow[]).map((h) => ({
      weekday: h.weekday,
      opensMin: h.opens_min,
      closesMin: h.closes_min,
    }));
  } else {
    cafe.hours = fallbackHours(id);
  }
  return cafe;
}
