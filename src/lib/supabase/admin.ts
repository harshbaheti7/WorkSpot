import { createClient as createJsClient } from "@supabase/supabase-js";

/**
 * Service-role client for admin-only server reads/writes (bypasses RLS).
 * Server-only: never import from client components. Null when unconfigured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  return createJsClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
