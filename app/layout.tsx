import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

// PRD §8 — Fraunces (serif lembut, opsz variabel) untuk judul; Instrument Sans untuk teks & UI.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alur — Peta proses interaktif",
  description:
    "Gambarkan sebuah proses sebagai peta interaktif yang mengalir: dari awal hingga tujuannya.",
};

export const viewport: Viewport = {
  themeColor: "#f4f2ec",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${instrumentSans.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
