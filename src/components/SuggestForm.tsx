"use client";

import { useState } from "react";

const input =
  "w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-white/40 focus:outline-none";

export default function SuggestForm() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, neighborhood, notes }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Couldn't submit.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-6 max-w-xl">
        <p className="text-[15px] text-ink">
          Thanks — your suggestion is in. We&apos;ll review it and add the café
          if it fits.
        </p>
        <button
          type="button"
          onClick={() => {
            setName("");
            setAddress("");
            setNeighborhood("");
            setNotes("");
            setDone(false);
          }}
          className="mt-4 rounded-full border border-white/15 px-6 py-2.5 text-[15px] text-ink transition-colors hover:border-white/40"
        >
          Suggest another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4">
      <div>
        <label htmlFor="sg-name" className="mb-1.5 block text-sm text-muted">
          Café name
        </label>
        <input
          id="sg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ritual Coffee"
          required
          maxLength={200}
          className={input}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sg-address"
            className="mb-1.5 block text-sm text-muted"
          >
            Address <span className="text-faint">(optional)</span>
          </label>
          <input
            id="sg-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="1026 Valencia St"
            maxLength={300}
            className={input}
          />
        </div>
        <div>
          <label
            htmlFor="sg-neighborhood"
            className="mb-1.5 block text-sm text-muted"
          >
            Neighborhood <span className="text-faint">(optional)</span>
          </label>
          <input
            id="sg-neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Mission"
            maxLength={100}
            className={input}
          />
        </div>
      </div>
      <div>
        <label htmlFor="sg-notes" className="mb-1.5 block text-sm text-muted">
          Why this spot? <span className="text-faint">(optional)</span>
        </label>
        <textarea
          id="sg-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Good wifi, plenty of outlets, quiet on weekdays…"
          rows={4}
          maxLength={2000}
          className={input}
        />
      </div>
      {error ? <p className="text-sm text-brand">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit suggestion"}
      </button>
    </form>
  );
}
