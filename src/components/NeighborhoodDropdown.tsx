"use client";

import { useRef } from "react";

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function NeighborhoodDropdown({
  options,
  value,
  onChange,
  placeholder = "All neighborhoods",
}: Props) {
  const ref = useRef<HTMLDetailsElement>(null);

  function pick(v: string) {
    onChange(v);
    if (ref.current) ref.current.open = false;
  }

  const item =
    "flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] text-ink hover:bg-white/5";

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-muted transition-colors hover:border-white/40 hover:text-ink [&::-webkit-details-marker]:hidden">
        {value || placeholder}
        <span className="text-[10px] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="absolute left-0 z-20 mt-2 max-h-64 w-60 overflow-auto rounded-xl border border-white/10 bg-raised shadow-xl">
        <button type="button" onClick={() => pick("")} className={item}>
          {placeholder}{" "}
          {value === "" ? <span className="text-brand">✓</span> : null}
        </button>
        {options.map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => pick(n)}
            className={item}
          >
            {n} {value === n ? <span className="text-brand">✓</span> : null}
          </button>
        ))}
      </div>
    </details>
  );
}
