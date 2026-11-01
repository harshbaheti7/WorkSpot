import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        About us
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Work less on finding a spot, more on your work.
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          WorkSpot finds laptop-friendly cafés in San Francisco. Every spot
          gets a work score built from the four things that matter when you
          work from a café: WiFi, outlets, noise level, and laptop policy.
        </p>
        <p>
          Search in plain language — &ldquo;quiet spot with outlets in the
          Mission&rdquo; — or filter by what you need. Each café page shows
          the facts behind its score, so you can judge for yourself.
        </p>
        <p>
          This is v1: scores are editorial estimates distilled from public
          café guides and the owner&rsquo;s own saved list. See{" "}
          <Link href="/references" className="text-ink underline">
            references
          </Link>{" "}
          for sources. Review analysis and photo-based scoring are on the
          roadmap.
        </p>
      </div>
    </div>
  );
}
