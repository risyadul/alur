import type { Stage } from "./types";

/** Konstanta layout kanvas peta — PRD §7.1 & §7.4. */
export const MAP = {
  /** Lebar × tinggi-minimum node tahap. */
  SW: 168,
  SH: 58,
  /** Lebar node isi. */
  ITW: 150,
  /** Lebar node deskripsi. */
  DW: 210,
  /** Tinggi isi fallback bila belum terukur. */
  ITH: 40,
  /** Jarak vertikal antar baris isi. */
  IGAP: 14,
  /** Jarak dari bawah tahap ke baris isi pertama. */
  ITOP: 44,
  /** Offset batang → isi. */
  TRUNK: 16,
  /** Posisi batang diukur dari tepi kiri node tahap. */
  TRUNK_X: 20,
  /** Jarak isi → deskripsi. */
  GAP2: 24,
  /** Padding sekeliling konten saat "pas ke layar". */
  PAD: 46,
  /** Jarak antar pusat tahap — adaptif, lihat `computeMapLayout`. */
  COLW_DESC: 520,
  COLW_PLAIN: 300,
  /** Batas skala kamera. */
  MIN_SCALE: 0.25,
  MAX_SCALE: 2.6,
} as const;

/** Tinggi node hasil pengukuran DOM, dikunci per id — PRD §7.2. */
export type HeightMap = Readonly<Record<string, number>>;

export const itemKey = (itemId: string): string => `i:${itemId}`;
export const descKey = (itemId: string): string => `d:${itemId}`;

export const hasDescription = (desc: string): boolean => desc.trim().length > 0;

export interface RowLayout {
  itemId: string;
  itemY: number;
  itemH: number;
  descY: number;
  descH: number;
  hasDesc: boolean;
  /** Pusat baris — isi & deskripsi disejajarkan di sini agar penghubungnya horizontal. */
  centerY: number;
}

export interface StageLayout {
  stageId: string;
  index: number;
  x: number;
  trunkX: number;
  itemX: number;
  descX: number;
  trunkTop: number;
  trunkBottom: number;
  rows: RowLayout[];
}

export interface MapLayout {
  stages: StageLayout[];
  colw: number;
  width: number;
  height: number;
  /** Lebar satu kolom tahap (batang → isi → deskripsi) — dipakai untuk membingkai kamera awal. */
  columnWidth: number;
}

/**
 * Menata peta dari tinggi node yang sudah diukur.
 *
 * Tinggi baris = max(tinggi isi, tinggi deskripsi), dan keduanya dipusatkan pada
 * baseline baris yang sama — itulah yang membuat garis tautan selalu horizontal
 * dan baris tidak pernah bertumpuk meski deskripsinya panjang (PRD §7.1).
 */
export function computeMapLayout(
  stages: readonly Stage[],
  heights: HeightMap,
): MapLayout {
  // COLW adaptif: rapatkan bila alur ini tidak punya deskripsi sama sekali (PRD §7.1).
  const anyDesc = stages.some((s) => s.items.some((i) => hasDescription(i.desc)));
  const colw = anyDesc ? MAP.COLW_DESC : MAP.COLW_PLAIN;

  // Anotasi eksplisit: MAP `as const` membuat MAP.SH bertipe literal 58, bukan number.
  let maxBottom: number = MAP.SH;

  const laid: StageLayout[] = stages.map((stage, index) => {
    const x = index * colw;
    const trunkX = x + MAP.TRUNK_X;
    const itemX = trunkX + MAP.TRUNK;
    const descX = itemX + MAP.ITW + MAP.GAP2;

    let rowTop = MAP.SH + MAP.ITOP;

    const rows: RowLayout[] = stage.items.map((item) => {
      const itemH = heights[itemKey(item.id)] ?? MAP.ITH;
      const hasDesc = hasDescription(item.desc);
      const descH = hasDesc ? (heights[descKey(item.id)] ?? MAP.ITH) : 0;

      const rowH = Math.max(itemH, descH);
      const centerY = rowTop + rowH / 2;

      const row: RowLayout = {
        itemId: item.id,
        itemY: centerY - itemH / 2,
        itemH,
        descY: centerY - descH / 2,
        descH,
        hasDesc,
        centerY,
      };

      rowTop += rowH + MAP.IGAP;
      return row;
    });

    const lastRow = rows.at(-1);
    const bottom = lastRow ? rowTop - MAP.IGAP : MAP.SH;
    maxBottom = Math.max(maxBottom, bottom);

    return {
      stageId: stage.id,
      index,
      x,
      trunkX,
      itemX,
      descX,
      trunkTop: MAP.SH,
      // Batang berhenti di pusat baris terakhir, bukan di bawahnya (PRD §7.3).
      trunkBottom: lastRow ? lastRow.centerY : MAP.SH,
      rows,
    };
  });

  const lastStage = laid.at(-1);
  const columnWidth =
    MAP.TRUNK_X + MAP.TRUNK + MAP.ITW + (anyDesc ? MAP.GAP2 + MAP.DW : 0);

  return {
    stages: laid,
    colw,
    width: (lastStage?.x ?? 0) + Math.max(MAP.SW, columnWidth),
    height: maxBottom,
    columnWidth: Math.max(MAP.SW, columnWidth),
  };
}

/** Peran tahap menentukan warna aksen kiri — PRD §7.3. */
export type StageRole = "awal" | "tengah" | "tujuan";

export function stageRole(index: number, total: number): StageRole {
  if (index === 0) return "awal";
  if (index === total - 1 && total > 1) return "tujuan";
  return "tengah";
}
