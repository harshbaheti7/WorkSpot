"use client";

import * as Slider from "@radix-ui/react-slider";
import { fmtTime } from "@/lib/workscore";

export const DAY_START = 6 * 60; // 6AM
export const DAY_END = 24 * 60; // 12AM

interface Props {
  from: number | null;
  to: number | null;
  onChange: (from: number | null, to: number | null) => void;
}

export default function TimeRangeSlider({ from, to, onChange }: Props) {
  const display: [number, number] = [
    from ?? DAY_START,
    to ?? DAY_END,
  ];
  const fromSet = from !== null;
  const toSet = to !== null;
  const label = !fromSet && !toSet
    ? "Any time"
    : fromSet && toSet
      ? `${fmtTime(from)}–${fmtTime(to)}`
      : fromSet
        ? `Opens by ${fmtTime(from)}`
        : `Till ${fmtTime(to as number)}`;

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/15 px-4 py-1.5">
      <span className="font-mono text-xs tracking-widest text-faint uppercase">
        Hours
      </span>
      <Slider.Root
        value={display}
        onValueChange={([a, b]) => {
          onChange(
            a === DAY_START ? null : a,
            b === DAY_END ? null : b
          );
        }}
        min={DAY_START}
        max={DAY_END}
        step={30}
        minStepsBetweenThumbs={1}
        className="relative flex h-5 w-36 touch-none items-center sm:w-44"
        aria-label="Work hours range"
      >
        <Slider.Track className="relative h-1 grow rounded-full bg-white/15">
          {(fromSet || toSet) && (
            <Slider.Range className="absolute h-full rounded-full bg-brand" />
          )}
        </Slider.Track>
        <Slider.Thumb
          aria-label="Opens by"
          className={`block h-4 w-4 cursor-grab rounded-full bg-white shadow focus:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-brand ${
            fromSet ? "" : "opacity-40"
          }`}
        />
        <Slider.Thumb
          aria-label="Closes after"
          className={`block h-4 w-4 cursor-grab rounded-full bg-white shadow focus:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-brand ${
            toSet ? "" : "opacity-40"
          }`}
        />
      </Slider.Root>
      <span className="min-w-24 text-[13px] whitespace-nowrap text-muted">
        {label}
      </span>
      {fromSet || toSet ? (
        <button
          type="button"
          onClick={() => onChange(null, null)}
          aria-label="Clear hours filter"
          className="text-sm leading-none text-faint hover:text-ink"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
