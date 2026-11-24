import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SuggestForm from "@/components/SuggestForm";

export const dynamic = "force-dynamic";

export default async function SuggestPage() {
  const sb = await createClient();
  if (!sb) {
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Suggest a café
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Suggestions aren&apos;t configured yet — the Supabase env vars are
          missing.
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
          Suggest a café
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Know a great work spot?
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Log in to suggest it — we review every submission before adding it.
        </p>
        <Link
          href="/login?next=/suggest"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover"
        >
          Log in →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        Suggest a café
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Know a great work spot?
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        Tell us about it and we&apos;ll check it out.
      </p>
      <SuggestForm />
    </div>
  );
}
