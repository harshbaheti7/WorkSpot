import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCafes } from "@/lib/db";
import { workScore } from "@/lib/workscore";
import { isMissingTable } from "@/lib/dbErrors";
import CafeCard from "@/components/CafeCard";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const sb = await createClient();
  if (!sb) {
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Saved spots
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Saving isn&apos;t configured yet — the Supabase env vars are missing.
        </p>
      </div>
    );
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return (
      <div>
        <p className="font-mono text-xs tracking-widest text-brand uppercase">
          Saved spots
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Your favourites live here
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Log in to star cafés and build your shortlist.
        </p>
        <Link
          href="/login?next=/saved"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover"
        >
          Log in →
        </Link>
      </div>
    );
  }

  const { data, error } = await sb
    .from("favorites")
    .select("cafe_id")
    .order("created_at", { ascending: false });

  if (error) {
    const missing = isMissingTable(error.message, "favorites");
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Saved spots
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          {missing
            ? "The favorites table doesn't exist yet — run migration 0007_favorites.sql in the Supabase SQL editor."
            : `Couldn't load your saved spots: ${error.message}`}
        </p>
      </div>
    );
  }

  const ids = (data as Array<{ cafe_id: string }>).map((r) => r.cafe_id);
  const cafes = await getCafes();
  const byId = new Map(cafes.map((c) => [c.id, c]));
  const saved = ids
    .map((id) => byId.get(id))
    .filter((c) => c !== undefined)
    .map((c) => ({ ...c, score: workScore(c) }));

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        Saved spots · {saved.length}
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Your favourites
      </h1>
      {saved.length === 0 ? (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Nothing saved yet. Tap the ☆ on any café to add it here.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {saved.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      )}
    </div>
  );
}
