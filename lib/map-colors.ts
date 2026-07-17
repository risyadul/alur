export interface MapEdgeColors {
  flow: string;
  branch: string;
  link: string;
}

/** Dipakai saat SSR (peta tidak pernah dirender di server) dan bila variable hilang. */
const FALLBACK: MapEdgeColors = {
  flow: "#2a6a55",
  branch: "#a9cbbb",
  link: "#cbd9d1",
};

let cached: MapEdgeColors | null = null;

/**
 * Warna penghubung peta, dibaca dari CSS variable saat runtime.
 *
 * Kenapa tidak memakai kelas Tailwind (`stroke-green`) seperti elemen lain:
 * html-to-image meng-clone subtree SVG apa adanya — `cloneNode(isSVGElement(node))`,
 * lalu `cloneChildren` berhenti begitu bertemu elemen SVG — sehingga anak-anak SVG
 * tidak pernah mendapat computed style yang di-inline. Di dalam gambar hasil ekspor
 * stylesheet halaman tidak ada, jadi kelas CSS tak berarti dan seluruh garis hilang.
 * Presentation attribute (`stroke="..."`) ikut tersalin apa adanya.
 *
 * Nilainya tetap dibaca dari `@theme` di globals.css, bukan ditulis ulang di sini,
 * supaya token warna tetap punya satu sumber.
 */
export function readMapEdgeColors(): MapEdgeColors {
  if (cached) return cached;
  if (typeof window === "undefined") return FALLBACK;

  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string): string =>
    style.getPropertyValue(name).trim() || fallback;

  cached = {
    flow: read("--color-green", FALLBACK.flow),
    branch: read("--color-branch", FALLBACK.branch),
    link: read("--color-link", FALLBACK.link),
  };
  return cached;
}
