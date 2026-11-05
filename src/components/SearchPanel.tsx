"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { NEIGHBORHOODS } from "@/data/cafes";
import {
  applyFilters,
  fmtTime,
  sfNow,
  WEEKDAY_NAMES,
  type CafeFilters,
} from "@/lib/workscore";
import CafeCard, { type CafeWithScore } from "./CafeCard";
import NeighborhoodDropdown from "./NeighborhoodDropdown";
import TimeRangeSlider from "./TimeRangeSlider";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-sunken text-sm text-faint">
      Loading map…
    </div>
  ),
});

interface SearchResponse {
  mode: "llama" | "Muse" | "local";
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
  const [mode, setMode] = useState<"llama" | "Muse" | "local">("local");
  const [searching, setSearching] = useState(false);
  const [engine, setEngine] = useState<string | null>(null);
  const [openNow, setOpenNow] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((j: { engine?: unknown }) =>
        setEngine(typeof j.engine === "string" ? j.engine : "local")
      )
      .catch(() => setEngine("local"));
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

  function toggleOpenNow() {
    if (openNow) {
      setOpenNow(false);
      setChips((c) => ({
        ...c,
        day: undefined,
        timeFrom: undefined,
        timeTo: undefined,
      }));
    } else {
      const now = sfNow();
      setOpenNow(true);
      setChips((c) => ({
        ...c,
        day: now.day,
        timeFrom: now.timeMin,
        timeTo: now.timeMin,
      }));
    }
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

  const timeSuffix =
    chips.timeFrom !== undefined && chips.timeTo !== undefined
      ? chips.timeFrom === chips.timeTo
        ? ` ${fmtTime(chips.timeFrom)}`
        : ` ${fmtTime(chips.timeFrom)}–${fmtTime(chips.timeTo)}`
      : chips.timeFrom !== undefined
        ? ` opens by ${fmtTime(chips.timeFrom)}`
        : chips.timeTo !== undefined
          ? ` till ${fmtTime(chips.timeTo)}`
          : "";

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
        <button
          type="button"
          onClick={toggleOpenNow}
          className={chip(openNow)}
        >
          Open now
        </button>
        <NeighborhoodDropdown
          options={WEEKDAY_NAMES}
          value={chips.day !== undefined ? WEEKDAY_NAMES[chips.day] : ""}
          placeholder="Any day"
          onChange={(v) => {
            setOpenNow(false);
            setChips((c) => ({
              ...c,
              day: v ? WEEKDAY_NAMES.indexOf(v) : undefined,
            }));
          }}
        />
        <TimeRangeSlider
          from={chips.timeFrom ?? null}
          to={chips.timeTo ?? null}
          onChange={(from, to) => {
            setOpenNow(false);
            setChips((c) => ({
              ...c,
              timeFrom: from ?? undefined,
              timeTo: to ?? undefined,
            }));
          }}
        />
        {engine !== null && (
          <span
            className={`ml-auto font-mono text-xs tracking-widest uppercase ${
              engine !== "local" ? "text-accent2" : "text-faint"
            }`}
          >
            {engine === "llama"
              ? "● AI · Llama"
              : engine === "Muse"
                ? "● AI · Muse"
                : "○ Local search"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted">
          {explanation}{" "}
          <span className="text-faint">
            {mode === "llama"
            ? "· matched by Llama"
            : mode === "Muse"
              ? "· matched by Muse"
              : "· matched locally"}
            {chips.day !== undefined
              ? ` · ${WEEKDAY_NAMES[chips.day]}`
              : ""}
            {timeSuffix ? ` ·${timeSuffix}` : ""}
          </span>
        </p>
        {visible.length < initial.length ? (
          <p className="shrink-0 font-mono text-xs tracking-widest text-brand uppercase">
            {visible.length} of {initial.length} spots
          </p>
        ) : null}
      </div>

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
