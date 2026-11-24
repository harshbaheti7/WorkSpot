import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminEmails, isAdminEmail } from "@/lib/admin";
import { isMissingTable } from "@/lib/dbErrors";
import AdminRequestButtons from "@/components/AdminRequestButtons";

export const dynamic = "force-dynamic";

interface CafeRequest {
  id: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

function statusLabel(status: string): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export default async function AdminPage() {
  const sb = await createClient();
  if (!sb) {
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Admin isn&apos;t configured yet — the Supabase env vars are missing.
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
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          This area is for the site owner.
        </p>
        <Link
          href="/login?next=/admin"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover"
        >
          Log in →
        </Link>
      </div>
    );
  }

  if (adminEmails().length === 0) {
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          No admin emails are configured. Set ADMIN_EMAILS in .env.local (and
          in Vercel → Environment Variables) to your login email, then reload.
        </p>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Signed in as {user.email} — this account isn&apos;t an admin.
        </p>
      </div>
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          SUPABASE_SECRET_KEY is missing — the admin list needs the server key.
        </p>
      </div>
    );
  }

  const { data, error } = await admin
    .from("cafe_requests")
    .select("id, name, address, neighborhood, notes, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    const missing = isMissingTable(error.message, "cafe_requests");
    return (
      <div>
        <h1 className="font-display text-4xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          {missing
            ? "The requests table doesn't exist yet — run migration 0008_cafe_requests.sql in the Supabase SQL editor."
            : `Couldn't load requests: ${error.message}`}
        </p>
      </div>
    );
  }

  const requests = (data ?? []) as CafeRequest[];
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        Admin · {pending} pending
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Café suggestions
      </h1>
      {requests.length === 0 ? (
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          No suggestions yet. When users submit via /suggest, they&apos;ll show
          up here.
        </p>
      ) : (
        <div className="mt-6 grid max-w-3xl gap-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-medium tracking-tight">
                    {r.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-faint">
                    {[r.neighborhood, r.address].filter(Boolean).join(" · ") ||
                      "No location given"}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs tracking-widest uppercase text-muted">
                  {statusLabel(r.status)}
                </span>
              </div>
              {r.notes ? (
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {r.notes}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p className="text-[13px] text-faint">
                  {new Date(r.created_at).toLocaleString()}
                </p>
                {r.status === "pending" ? (
                  <AdminRequestButtons id={r.id} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
