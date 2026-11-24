import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMissingTable } from "@/lib/dbErrors";

export async function POST(request: Request) {
  const sb = await createClient();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body?.name);
  if (!name) {
    return NextResponse.json(
      { error: "Café name is required." },
      { status: 400 }
    );
  }
  const row = {
    user_id: user.id,
    name: name.slice(0, 200),
    address: str(body?.address).slice(0, 300) || null,
    neighborhood: str(body?.neighborhood).slice(0, 100) || null,
    notes: str(body?.notes).slice(0, 2000) || null,
  };
  const { error } = await sb.from("cafe_requests").insert(row);
  if (error) {
    const missing = isMissingTable(error.message, "cafe_requests");
    return NextResponse.json(
      {
        error: missing
          ? "Requests table is missing — run migration 0008_cafe_requests.sql in Supabase."
          : error.message,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
