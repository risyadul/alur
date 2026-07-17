import type { StageRole } from "@/lib/map-layout";

/**
 * Satu sumber untuk bahasa warna peran tahap: hijau = awal, amber = tujuan (PRD §7.3).
 * Dipakai bersama oleh node peta, kartu editor, dan chip pita dashboard — supaya
 * ketiganya terbaca sebagai peta yang sama, dan tidak bisa menyimpang sendiri-sendiri.
 */
export const STAGE_ACCENT: Record<StageRole, string> = {
  awal: "bg-green",
  tengah: "bg-line",
  tujuan: "bg-amber",
};

export const STAGE_TINT: Record<StageRole, string> = {
  awal: "bg-green-soft text-green-deep",
  tengah: "bg-paper text-muted border border-line",
  tujuan: "bg-amber-soft text-ink",
};
