import { NextResponse } from "next/server";
import { aiEnabled } from "@/lib/anthropic";

export async function GET() {
  return NextResponse.json({ ai: aiEnabled() });
}
