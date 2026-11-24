"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export async function setRequestStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = await createClient();
  const {
    data: { user },
  } = sb ? await sb.auth.getUser() : { data: { user: null } };
  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, error: "Not authorized." };
  }
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Server key (SUPABASE_SECRET_KEY) is missing." };
  }
  const { error } = await admin
    .from("cafe_requests")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}
