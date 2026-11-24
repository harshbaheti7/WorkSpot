"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Loaded = { loggedIn: boolean; ids: Set<string> } | { error: string };

let cache: Promise<Loaded> | null = null;

function load(): Promise<Loaded> {
  if (!cache) {
    cache = fetch("/api/favorites")
      .then(async (r): Promise<Loaded> => {
        if (r.status === 401) {
          return { loggedIn: false, ids: new Set<string>() };
        }
        const j = (await r.json().catch(() => ({}))) as {
          ids?: string[];
          error?: string;
        };
        if (!r.ok) return { error: j.error ?? "Favorites unavailable." };
        return { loggedIn: true, ids: new Set(j.ids ?? []) };
      })
      .catch((): Loaded => ({ error: "Favorites unavailable." }));
  }
  return cache;
}

function mutateCache(cafeId: string, on: boolean) {
  cache?.then((s) => {
    if ("ids" in s) {
      if (on) s.ids.add(cafeId);
      else s.ids.delete(cafeId);
    }
  });
}

export default function FavoriteButton({ cafeId }: { cafeId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    load().then((s) => {
      if (live) setState(s);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!state) return <span className="inline-block h-6 w-6" aria-hidden />;
  if ("error" in state) return null;

  const on = state.ids.has(cafeId);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    if (!state || "error" in state) return;
    if (!state.loggedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    const nextOn = !on;
    setBusy(true);
    try {
      const res = nextOn
        ? await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cafe_id: cafeId }),
          })
        : await fetch(`/api/favorites?cafe_id=${encodeURIComponent(cafeId)}`, {
            method: "DELETE",
          });
      if (!res.ok) return;
      mutateCache(cafeId, nextOn);
      const ids = new Set(state.ids);
      if (nextOn) ids.add(cafeId);
      else ids.delete(cafeId);
      setState({ loggedIn: true, ids });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      title={
        !state.loggedIn
          ? "Log in to save this spot"
          : on
            ? "Saved — click to remove"
            : "Save this spot"
      }
      className={`text-xl leading-none transition-colors disabled:opacity-60 ${
        on ? "text-brand" : "text-faint hover:text-ink"
      }`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
