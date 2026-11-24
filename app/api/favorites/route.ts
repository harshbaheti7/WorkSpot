import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMissingTable } from "@/lib/dbErrors";

function friendly(message: string): string {
  if (isMissingTable(message, "favorites")) {
    return "Favorites table is missing — run migration 0007_favorites.sql in Supabase.";
  }
  return message;
}

export async function GET() {
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
  const { data, error } = await sb.from("favorites").select("cafe_id");
  if (error) {
    return NextResponse.json({ error: friendly(error.message) }, { status: 500 });
  }
  return NextResponse.json({
    ids: (data as Array<{ cafe_id: string }>).map((r) => r.cafe_id),
  });
}

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
  const body = (await request.json().catch(() => null)) as {
    cafe_id?: unknown;
  } | null;
  const cafeId = typeof body?.cafe_id === "string" ? body.cafe_id.trim() : "";
  if (!cafeId) {
    return NextResponse.json({ error: "Missing cafe_id." }, { status: 400 });
  }
  const { error } = await sb
    .from("favorites")
    .upsert({ user_id: user.id, cafe_id: cafeId }, { onConflict: "user_id,cafe_id" });
  if (error) {
    const status = error.message.includes("violates foreign key") ? 400 : 500;
    return NextResponse.json({ error: friendly(error.message) }, { status });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
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
  const cafeId = new URL(request.url).searchParams.get("cafe_id")?.trim() ?? "";
  if (!cafeId) {
    return NextResponse.json({ error: "Missing cafe_id." }, { status: 400 });
  }
  const { error } = await sb
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("cafe_id", cafeId);
  if (error) {
    return NextResponse.json({ error: friendly(error.message) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
