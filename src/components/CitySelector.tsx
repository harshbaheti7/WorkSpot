export default function CitySelector() {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-muted transition-colors hover:border-white/40 hover:text-ink [&::-webkit-details-marker]:hidden">
        San Francisco
        <span className="text-[10px] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-raised shadow-xl">
        <a
          href="/"
          className="flex items-center justify-between px-4 py-2.5 text-[14px] text-ink hover:bg-white/5"
        >
          San Francisco <span className="text-brand">✓</span>
        </a>
        <p className="border-t border-white/10 px-4 py-2.5 text-[13px] text-faint">
          More cities coming soon
        </p>
      </div>
    </details>
  );
}
