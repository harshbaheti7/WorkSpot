import Link from "next/link";
import type { Cafe } from "@/data/cafes";
import { scoreLabel } from "@/lib/workscore";

export interface CafeWithScore extends Cafe {
  score: number;
}

export function factLine(c: Cafe): string[] {
  const facts: string[] = [];
  facts.push(
    c.wifi === "yes"
      ? "WiFi"
      : c.wifi === "weekdays"
        ? "WiFi weekdays"
        : c.wifi === "no"
          ? "No WiFi"
          : "WiFi unknown"
  );
  facts.push(
    c.outlets === "many"
      ? "Many outlets"
      : c.outlets === "some"
        ? "Outlets"
        : c.outlets === "few"
          ? "Few outlets"
          : c.outlets === "none"
            ? "No outlets"
            : "Outlets unknown"
  );
  facts.push(
    c.noise === 1
      ? "Very quiet"
      : c.noise === 2
        ? "Quiet"
        : c.noise === 3
          ? "Moderate buzz"
          : c.noise === 4
            ? "Lively"
            : c.noise === 5
              ? "Loud"
              : "Noise unknown"
  );
  facts.push(
    c.laptop === "welcome"
      ? "Laptops welcome"
      : c.laptop === "limited"
        ? "Laptop limits"
        : c.laptop === "banned"
          ? "No laptops"
          : "Policy unknown"
  );
  return facts;
}

export default function CafeCard({ cafe }: { cafe: CafeWithScore }) {
  return (
    <Link
      href={`/cafes/${cafe.id}`}
      className="block rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-white/25"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-medium tracking-tight">
            {cafe.name}
          </h3>
          <p className="mt-1 font-mono text-xs tracking-wide text-faint uppercase">
            {cafe.neighborhood}
            {cafe.rating ? ` · ★ ${cafe.rating.toFixed(1)}` : ""}
            {cafe.price ? ` · ${cafe.price}` : ""}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="font-display text-2xl font-semibold text-brand">
            {cafe.score}
          </span>
          <span className="block text-xs text-faint">
            {scoreLabel(cafe.score)}
          </span>
        </p>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        {cafe.summary}
      </p>
      <p className="mt-3 border-t border-white/10 pt-3 text-[13px] text-faint">
        {factLine(cafe).join("  ·  ")}
      </p>
    </Link>
  );
}
