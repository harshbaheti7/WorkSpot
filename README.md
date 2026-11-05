# WorkSpot

Find a café to get work done. WorkSpot scores San Francisco cafés on the four things that matter when you work from one — **WiFi, outlets, noise level, and laptop policy** — and lets you search in plain language.

## Features

- **Plain-language search** — "quiet spot with outlets in the Mission", "open Sunday 9 to 5", "open till 10pm"
- **Work scores (0–100)** for every café, with the facts behind each score
- **Filters** — WiFi, outlets, quiet, laptop-friendly, neighborhood, day, and an hours range slider ("Opens by" / "Closes after"), plus an "Open now" toggle
- **44 SF cafés** with map pins, weekly hours tables, and Google Maps links
- **AI search** (optional) — Llama (via Groq) parses queries when `GROQ_API_KEY` is set, falling back to Muse then keyword rules

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres) · Leaflet + OpenStreetMap · Llama via Groq + Anthropic Muse (optional AI) · Radix UI

## Getting started

Prerequisites: Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment

| Variable | Required | What it does |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key (read-only access) |
| `SUPABASE_SECRET_KEY` | No | Server-side key; only needed for admin scripts |
| `GROQ_API_KEY` | No | Enables Llama AI search (first choice) |
| `GROQ_MODEL` | No | Override (default `llama-3.3-70b-versatile`) |
| `ANTHROPIC_API_KEY` | No | Enables Muse AI search (second choice); app works without either (local match) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Inbox for the feedback + contact forms |

### Database

Run the migrations in order in the Supabase dashboard → SQL Editor:

1. `supabase/migrations/0001_cafes.sql` — `cafes` table + seed import
2. `supabase/migrations/0002_cafe_hours.sql` — `cafe_hours` table (structured weekly hours)
3. `supabase/migrations/0003_maps_url.sql` — Google Maps link per café
4. `supabase/migrations/0004_sanaa.sql` — Sana'a Cafe branches

The app reads Supabase-first with a bundled seed fallback (`src/data/`), so it builds and runs even before migrations are applied. Table edits in the dashboard appear on the site within ~60 seconds.

## Project layout

- `app/` — pages (`/`, `/cafes/[id]`, `/about`, `/feedback`, `/contact`, `/references`) + `/api/search`, `/api/status`
- `src/data/` — seed cafés + structured hours map (also the DB fallback)
- `src/lib/` — Supabase client, scoring/filter logic, Anthropic layer
- `src/components/` — search panel, map, cards, filters
- `supabase/migrations/` — SQL migrations, run in order

## Data sources

Work scores are distilled from public sources (facts only; summaries are our own):

- [Waves in the Kitchen — Best Cafes in SF for Getting Shit Done (2026 Guide)](https://wavesinthekitchen.com/best-coffee-shops-san-francisco-digital-nomads/)
- [The Infatuation — 30 SF Coffee Shops For Getting Work Done](https://www.theinfatuation.com/san-francisco/guides/the-best-sf-coffee-shops-for-getting-work-done)
- [OpenStreetMap](https://www.openstreetmap.org) (map data + geocoding) and [Leaflet](https://leafletjs.com) (map library)

See `/references` in the app for the full list.

## Status

V1. Scores are editorial estimates. On the roadmap: review analysis, photo-based scoring, more cities.
