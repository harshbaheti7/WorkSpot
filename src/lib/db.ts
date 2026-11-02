import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CAFES, type Cafe } from "@/data/cafes";

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

function toCafe(r: CafeRow): Cafe {
  return {
    id: r.id,
    name: r.name,
    neighborhood: r.neighborhood,
    address: r.address,
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

/**
 * All cafes, Supabase-first with seed fallback.
 * Falls back when env is missing, the table isn't migrated yet, or reads fail.
 */
export async function getCafes(): Promise<Cafe[]> {
  const sb = getClient();
  if (!sb) return CAFES;
  const { data, error } = await sb.from("cafes").select("*");
  if (error || !data) return CAFES;
  try {
    return (data as CafeRow[]).map(toCafe);
  } catch {
    return CAFES;
  }
}

export async function getCafeById(id: string): Promise<Cafe | undefined> {
  const sb = getClient();
  if (!sb) return CAFES.find((c) => c.id === id);
  const { data, error } = await sb.from("cafes").select("*").eq("id", id).single();
  if (error || !data) return CAFES.find((c) => c.id === id);
  try {
    return toCafe(data as CafeRow);
  } catch {
    return undefined;
  }
}
