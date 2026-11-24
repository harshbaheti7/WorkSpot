import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function AuthButtons() {
  const sb = await createClient();
  const user = sb ? (await sb.auth.getUser()).data.user : null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-medium text-canvas transition-colors hover:bg-brand-hover"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-44 truncate text-[13px] text-faint sm:inline">
        {user.email}
      </span>
      <SignOutButton />
    </div>
  );
}
