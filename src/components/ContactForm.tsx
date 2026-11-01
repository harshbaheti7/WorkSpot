"use client";

import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

export default function ContactForm({
  subjectPrefix,
}: {
  subjectPrefix: string;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`${subjectPrefix} — WorkSpot`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name.trim() || "anonymous"}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  const input =
    "w-full rounded-xl border border-white/15 bg-surface px-4 py-2.5 text-[15px] text-ink placeholder:text-faint focus:border-white/40 focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4">
      <div>
        <label htmlFor="cf-name" className="mb-1.5 block text-sm text-muted">
          Name <span className="text-faint">(optional)</span>
        </label>
        <input
          id="cf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane"
          className={input}
        />
      </div>
      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm text-muted">
          Message
        </label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you think…"
          required
          rows={5}
          className={input}
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-brand px-6 py-2.5 text-[15px] font-medium text-canvas transition-colors hover:bg-brand-hover"
        >
          Send →
        </button>
        <p className="text-[13px] text-faint">Opens your email app.</p>
      </div>
    </form>
  );
}
