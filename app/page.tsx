import { CAFES } from "@/data/cafes";
import { workScore } from "@/lib/workscore";
import SearchPanel from "@/components/SearchPanel";

export default function Home() {
  const initial = CAFES.map((c) => ({ ...c, score: workScore(c) })).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        {CAFES.length} spots · San Francisco
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
