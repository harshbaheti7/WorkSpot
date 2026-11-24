"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const input =
  "w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-white/40 focus:outline-none";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/saved";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"in" | "up" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <p className="mt-6 max-w-md text-[15px] text-muted">
        Login isn&apos;t configured yet — the Supabase env vars are missing.
      </p>
    );
  }

  async function run(mode: "in" | "up") {
    setBusy(mode);
    setError(null);
    setNotice(null);
    try {
      const sb = createClient();
      if (mode === "in") {
        const { error } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Account created — check your email to confirm it, then log in.");
          setBusy(null);
          return;
        }
      }
      router.refresh();
      router.push(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <form
      className="mt-6 max-w-md space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run("in");
      }}
    >
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm text-muted">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={input}
        />
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-sm text-muted"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete={busy === "up" ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={input}
        />
      </div>
      {error ? <p className="text-sm text-brand">{error}</p> : null}
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy !== null}
          className="rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {busy === "in" ? "Logging in…" : "Log in"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("up")}
          className="rounded-full border border-white/15 px-6 py-2.5 text-[15px] text-ink transition-colors hover:border-white/40 disabled:opacity-60"
        >
          {busy === "up" ? "Creating…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
