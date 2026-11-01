"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { NEIGHBORHOODS } from "@/data/cafes";
import { applyFilters, type CafeFilters } from "@/lib/workscore";
import CafeCard, { type CafeWithScore } from "./CafeCard";
import NeighborhoodDropdown from "./NeighborhoodDropdown";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-sunken text-sm text-faint">
      Loading map…
    </div>
  ),
});

interface SearchResponse {
  mode: "ai" | "local";
  explanation: string;
  filters: CafeFilters;
  results: CafeWithScore[];
}

export default function SearchPanel({ initial }: { initial: CafeWithScore[] }) {
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<CafeFilters>({});
  const [results, setResults] = useState<CafeWithScore[]>(initial);
  const [explanation, setExplanation] = useState(
    `${initial.length} spots in San Francisco, best first.`
  );
  const [mode, setMode] = useState<"ai" | "local">("local");
  const [searching, setSearching] = useState(false);
  const [aiOn, setAiOn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((j: { ai?: unknown }) => setAiOn(j.ai === true))
      .catch(() => setAiOn(false));
  }, []);

  const visible = useMemo(
    () => applyFilters(results, chips),
    [results, chips]
  );
  const points = useMemo(
    () =>
      visible
        .filter((c) => c.lat !== null && c.lng !== null)
        .map((c) => ({
          id: c.id,
          name: c.name,
          lat: c.lat as number,
          lng: c.lng as number,
          score: c.score,
        })),
    [visible]
  );

  function toggleChip(key: "wifi" | "outlets" | "laptopOk") {
    setChips((c) => ({ ...c, [key]: c[key] ? undefined : true }));
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = (await res.json()) as SearchResponse;
      setResults(data.results);
      setExplanation(data.explanation);
      setMode(data.mode);
    } catch {
      setExplanation("Search failed — showing all spots.");
      setResults(initial);
    } finally {
      setSearching(false);
    }
  }

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
      active
        ? "border-brand bg-brand text-canvas font-medium"
        : "border-white/15 text-muted hover:border-white/40 hover:text-ink"
    }`;

  return (
    <div>
      <form
        onSubmit={onSearch}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-surface p-2 pl-5 focus-within:border-white/40"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "quiet spot with outlets in the Mission"'
          className="w-full bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching}
          className="shrink-0 rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {searching ? "…" : "Search →"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toggleChip("wifi")}
          className={chip(chips.wifi === true)}
        >
          WiFi
        </button>
        <button
          type="button"
          onClick={() => toggleChip("outlets")}
          className={chip(chips.outlets === true)}
        >
          Outlets
        </button>
        <button
          type="button"
          onClick={() =>
            setChips((c) => ({
              ...c,
              maxNoise: c.maxNoise === 2 ? undefined : 2,
            }))
          }
          className={chip(chips.maxNoise === 2)}
        >
          Quiet
        </button>
        <button
          type="button"
          onClick={() => toggleChip("laptopOk")}
          className={chip(chips.laptopOk === true)}
        >
          Laptop-friendly
        </button>
        <NeighborhoodDropdown
          options={NEIGHBORHOODS}
          value={chips.neighborhood ?? ""}
          onChange={(v) =>
            setChips((c) => ({ ...c, neighborhood: v || undefined }))
          }
        />
        {aiOn !== null && (
          <span
            className={`ml-auto font-mono text-xs tracking-widest uppercase ${
              aiOn ? "text-accent2" : "text-faint"
            }`}
          >
            {aiOn ? "● AI search" : "○ Local search"}
          </span>
        )}
      </div>

      <p className="mt-4 text-sm text-muted">
        {explanation}{" "}
        <span className="text-faint">
          {mode === "ai" ? "· matched by AI" : "· matched locally"}
        </span>
      </p>

      <div className="mt-4 flex flex-col-reverse gap-6 lg:flex-row">
        <div className="grid min-w-0 flex-1 content-start gap-4 sm:grid-cols-2">
          {visible.length === 0 ? (
            <p className="py-10 text-muted sm:col-span-2">
              No spots match. Loosen a filter or two.
            </p>
          ) : (
            visible.map((c) => <CafeCard key={c.id} cafe={c} />)
          )}
        </div>
        <div className="lg:w-[360px] lg:shrink-0">
          <div className="overflow-hidden rounded-2xl border border-white/10 lg:sticky lg:top-4 lg:h-[70vh]">
            <MapView points={points} />
          </div>
        </div>
      </div>
    </div>
  );
}
