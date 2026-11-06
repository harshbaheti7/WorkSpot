import { workScore } from "@/lib/workscore";
import { getCafes } from "@/lib/db";
import SearchPanel from "@/components/SearchPanel";

export const revalidate = 60;

export default async function Home() {
  const cafes = await getCafes();
  const initial = cafes.map((c) => ({ ...c, score: workScore(c) })).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        San Francisco · {cafes.length} spots
      </p>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        WiFi, outlets, noise, and laptop policies — search in plain language
        and stop wasting time hunting for a place to work.
      </p>
      <div className="mt-8">
        <SearchPanel initial={initial} />
      </div>
    </div>
  );
}
