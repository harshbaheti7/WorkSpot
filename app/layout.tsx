import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import CitySelector from "@/components/CitySelector";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "WorkSpot — Laptop-friendly cafés in San Francisco",
  description:
    "Find SF cafés to get work done: WiFi, outlets, noise level, and laptop policies, searchable in plain language.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${jetbrains.variable}`}
    >
      <body className="bg-canvas font-sans text-ink antialiased">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <div>
              <a href="/" className="font-display text-5xl font-semibold leading-none tracking-tight">
                WorkSpot<span className="text-brand">.</span>
              </a>
              <p className="mt-1 font-display text-lg text-muted">
                Find a café to get work done.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CitySelector />
              <p className="font-mono text-xs tracking-widest text-faint uppercase">
                v1
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
        <footer className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">
                WorkSpot<span className="text-brand">.</span>
              </p>
              <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
                Find a café to get work done. Work scores for San
                Francisco&apos;s most laptop-friendly spots.
              </p>
            </div>
            <nav className="grid grid-cols-2 content-start gap-x-6 gap-y-3 sm:justify-items-end">
              <Link href="/about" className="text-[14px] text-muted hover:text-ink">
                About us
              </Link>
              <Link href="/feedback" className="text-[14px] text-muted hover:text-ink">
                Feedback
              </Link>
              <Link href="/contact" className="text-[14px] text-muted hover:text-ink">
                Contact us
              </Link>
              <Link href="/references" className="text-[14px] text-muted hover:text-ink">
                References
              </Link>
            </nav>
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto max-w-6xl px-5 py-5 text-[13px] text-faint">
              © 2026 WorkSpot · Scores combine public SF cafe guides with the
              owner&apos;s saved list. Map © OpenStreetMap contributors.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
