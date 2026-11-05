import { NextResponse } from "next/server";
import { aiEnabled } from "@/lib/anthropic";
import { llamaEnabled } from "@/lib/llama";

export async function GET() {
  const engine = llamaEnabled() ? "llama" : aiEnabled() ? "Muse" : "local";
  return NextResponse.json({ ai: engine !== "local", engine });
}
