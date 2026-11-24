"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.refresh();
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-muted transition-colors hover:border-white/40 hover:text-ink disabled:opacity-60"
    >
      {busy ? "…" : "Log out"}
    </button>
  );
}
