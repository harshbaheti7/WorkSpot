import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  return env() !== null;
}

/** Auth-aware server client (reads session from cookies). Null when unconfigured. */
export async function createClient() {
  const e = env();
  if (!e) return null;
  const cookieStore = await cookies();
  return createServerClient(e.url, e.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component (read-only); middleware refreshes the session.
        }
      },
    },
  });
}
