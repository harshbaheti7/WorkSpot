const SOURCES = [
  {
    title: "Best Cafes in San Francisco for Getting Shit Done: The 2026 Guide",
    publisher: "Waves in the Kitchen",
    url: "https://wavesinthekitchen.com/best-coffee-shops-san-francisco-digital-nomads/",
    used: "WiFi, outlet, seating, and vibe facts for 14 cafés.",
  },
  {
    title: "30 SF Coffee Shops For Getting Work Done",
    publisher: "The Infatuation",
    url: "https://www.theinfatuation.com/san-francisco/guides/the-best-sf-coffee-shops-for-getting-work-done",
    used: "Addresses, WiFi status, outlet notes, and hours for 30 cafés.",
  },
  {
    title: "OpenStreetMap + Nominatim",
    publisher: "OpenStreetMap contributors",
    url: "https://www.openstreetmap.org",
    used: "Map data and address geocoding.",
  },
  {
    title: "Leaflet",
    publisher: "Leaflet contributors",
    url: "https://leafletjs.com",
    used: "Interactive map library.",
  },
];

export default function ReferencesPage() {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-widest text-brand uppercase">
        References
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Where our data comes from.
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        We distill facts (WiFi, outlets, hours, addresses) from public
        sources and write our own summaries and scores. No review text is
        copied. Support the originals:
      </p>
      <div className="mt-6 space-y-4">
        {SOURCES.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-white/25"
          >
            <p className="font-display text-lg font-medium tracking-tight">
              {s.title}
            </p>
            <p className="mt-1 font-mono text-xs tracking-wide text-faint uppercase">
              {s.publisher}
            </p>
            <p className="mt-2 text-[14px] text-muted">{s.used}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
