"use client";

import { useState } from "react";
import { setRequestStatus } from "@/lib/adminActions";

export default function AdminRequestButtons({ id }: { id: string }) {
  const [busy, setBusy] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(status: "approved" | "rejected") {
    setBusy(status);
    setError(null);
    const res = await setRequestStatus(id, status);
    setBusy(null);
    if (!res.ok) setError(res.error);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("approved")}
        className="rounded-full border border-white/15 px-4 py-1 text-[13px] text-ink transition-colors hover:border-white/40 disabled:opacity-60"
      >
        {busy === "approved" ? "…" : "Approve"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => run("rejected")}
        className="rounded-full border border-white/15 px-4 py-1 text-[13px] text-muted transition-colors hover:border-white/40 hover:text-ink disabled:opacity-60"
      >
        {busy === "rejected" ? "…" : "Reject"}
      </button>
      {error ? <span className="text-[13px] text-brand">{error}</span> : null}
    </div>
  );
}
