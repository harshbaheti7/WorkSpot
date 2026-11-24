import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        Account
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Log in
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        Save your favourite spots and suggest new cafés. New here? Enter your
        details and hit “Create account” instead.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
