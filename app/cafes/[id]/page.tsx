import Link from "next/link";
import { notFound } from "next/navigation";
import { getCafeById, getCafes } from "@/lib/db";
import {
  fmtTime,
  scoreLabel,
  WEEKDAY_NAMES,
  workScore,
} from "@/lib/workscore";
import DetailMap from "@/components/DetailMap";

export const revalidate = 60;

export async function generateStaticParams() {
  const cafes = await getCafes();
  return cafes.map((c) => ({ id: c.id }));
}

function row(label: string, value: string, note: string | null) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/10 py-3 last:border-0 sm:flex-row sm:items-baseline">
      <dt className="w-36 shrink-0 font-mono text-xs tracking-widest text-faint uppercase">
        {label}
      </dt>
      <dd className="text-[15px] text-ink">
        {value}
        {note ? <span className="text-muted"> · {note}</span> : null}
      </dd>
    </div>
  );
}

export default async function CafePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cafe = await getCafeById(id);
  if (!cafe) notFound();
  const score = workScore(cafe);

  const wifi =
    cafe.wifi === "yes"
      ? "Yes"
      : cafe.wifi === "weekdays"
        ? "Weekdays only"
        : cafe.wifi === "no"
          ? "No"
          : "Unknown";
  const outlets =
    cafe.outlets === "many"
      ? "Many"
      : cafe.outlets === "some"
        ? "Yes"
        : cafe.outlets === "few"
          ? "Few"
          : cafe.outlets === "none"
            ? "None"
            : "Unknown";
  const noise =
    cafe.noise === 1
      ? "Very quiet"
      : cafe.noise === 2
        ? "Quiet"
        : cafe.noise === 3
          ? "Moderate"
          : cafe.noise === 4
            ? "Lively"
            : cafe.noise === 5
              ? "Loud"
              : "Unknown";
  const laptop =
    cafe.laptop === "welcome"
      ? "Welcome"
      : cafe.laptop === "limited"
        ? "Limited"
        : cafe.laptop === "banned"
          ? "Not allowed"
          : "Unknown";

  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← All spots
      </Link>
      <p className="mt-4 font-mono text-xs tracking-widest text-faint uppercase">
        {cafe.neighborhood}
        {cafe.address ? ` · ${cafe.address}` : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-4xl font-medium tracking-tight">
          {cafe.name}
        </h1>
        <p className="text-sm text-muted">
          <span className="font-display text-3xl font-semibold text-brand">
            {score}
          </span>{" "}
          {scoreLabel(score)}
        </p>
      </div>
      {cafe.rating || cafe.price ? (
        <p className="mt-2 text-[15px] text-muted">
          {cafe.rating ? `★ ${cafe.rating.toFixed(1)}` : ""}
          {cafe.rating && cafe.price ? " · " : ""}
          {cafe.price ?? ""}
        </p>
      ) : null}
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        {cafe.summary}
      </p>
      {cafe.userNote ? (
        <p className="mt-3 max-w-2xl text-[15px] text-ink">
          <span className="text-faint">Owner note: </span>
          {cafe.userNote}
        </p>
      ) : null}
      {cafe.mapsUrl ? (
        <a
          href={cafe.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-medium text-canvas transition-colors hover:bg-brand-hover"
        >
          Open in Google Maps →
        </a>
      ) : null}

      <dl className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-surface px-5 py-2">
        {row("WiFi", wifi, cafe.wifiNote)}
        {row("Outlets", outlets, cafe.outletsNote)}
        {row("Noise", noise, cafe.noiseNote)}
        {row("Laptops", laptop, cafe.laptopNote)}
        {row("Hours", cafe.hoursNote ?? "Unknown", null)}
      </dl>

      {cafe.hours && cafe.hours.length > 0 ? (
        <div className="mt-6 max-w-2xl">
          <h2 className="font-mono text-xs tracking-widest text-faint uppercase">
            Weekly hours
          </h2>
          <dl className="mt-2 rounded-2xl border border-white/10 bg-surface px-5 py-2">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const rows = (cafe.hours ?? []).filter(
                (h) => h.weekday === d
              );
              return (
                <div
                  key={d}
                  className="flex items-baseline justify-between border-b border-white/10 py-2 last:border-0"
                >
                  <dt className="text-sm text-muted">{WEEKDAY_NAMES[d]}</dt>
                  <dd className="text-[15px] text-ink">
                    {rows.length === 0
                      ? "Closed"
                      : rows
                          .map(
                            (r) =>
                              `${fmtTime(r.opensMin)}–${fmtTime(r.closesMin)}`
                          )
                          .join(", ")}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}

      {cafe.lat !== null && cafe.lng !== null ? (
        <div className="mt-6 h-[320px] max-w-2xl overflow-hidden rounded-2xl border border-white/10">
          <DetailMap
            points={[
              {
                id: cafe.id,
                name: cafe.name,
                lat: cafe.lat,
                lng: cafe.lng,
                score,
              },
            ]}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-faint">
          Map pin coming soon — location not verified yet.
        </p>
      )}

      <p className="mt-6 text-[13px] text-faint">
        Source: {cafe.source === "guide" ? "public SF cafe guide" : "owner's saved list"} · Scores are editorial estimates for v1.
      </p>
    </div>
  );
}
