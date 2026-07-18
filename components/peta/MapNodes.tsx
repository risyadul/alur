import type { StageRole } from "@/lib/map-layout";
import { readMapEdgeColors } from "@/lib/map-colors";
import { STAGE_ACCENT } from "@/components/ui/stage-tone";

type StageNodeProps = {
  name: string;
  itemCount: number;
  doneCount: number;
  role: StageRole;
  isCollapsed: boolean;
  onToggle: () => void;
};

/** 168 × min 58 — PRD §7.1. Ketuk untuk buka-tutup isinya (§7.5). */
export function StageNode({
  name,
  itemCount,
  doneCount,
  role,
  isCollapsed,
  onToggle,
}: StageNodeProps) {
  // Meta dijaga pendek: bila node melebihi SH=58 tinggi, awal batang (yang diasumsikan
  // di y=58) meleset. Jadi tanpa suffix "terlipat" — fade + aria-expanded sudah cukup.
  const hasProgress = itemCount > 0 && doneCount > 0;
  const meta = hasProgress ? `${doneCount}/${itemCount} selesai` : `${itemCount} isi`;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!isCollapsed}
      className="flex min-h-[58px] w-[168px] overflow-hidden rounded-xl border border-line bg-surface text-left shadow-node transition-colors hover:bg-paper"
    >
      <span className={`w-1 shrink-0 ${STAGE_ACCENT[role]}`} aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] px-3 py-[10px]">
        <span className="t-tahap text-ink">{name}</span>
        <span className={`t-meta ${hasProgress ? "text-green-deep" : "text-muted"}`}>
          {meta}
        </span>
      </span>
    </button>
  );
}

type ItemNodeProps = {
  text: string;
  isDone: boolean;
  /** Dibaca PetaCanvas lewat querySelector saat mengukur tinggi (PRD §7.2). */
  measureKey: string;
};

/**
 * Lebar tetap 150 (ITW); tinggi menyesuaikan konten dan diukur — PRD §7.1–7.2.
 *
 * Centang selesai memakai stroke hex eksplisit, bukan `currentColor`/kelas Tailwind:
 * html-to-image meng-clone subtree SVG apa adanya tanpa meng-inline computed style, jadi
 * warna berbasis kelas hilang di ekspor PNG (alasan sama dengan garis peta di MapEdges).
 */
export function ItemNode({ text, isDone, measureKey }: ItemNodeProps) {
  const green = readMapEdgeColors().flow;

  return (
    <div
      data-measure-key={measureKey}
      className="flex min-h-[40px] w-[150px] items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 py-[9px] shadow-node"
    >
      {isDone && (
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={green}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-px shrink-0 self-start"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      <span className={`t-isi ${isDone ? "text-muted line-through" : "text-ink"}`}>{text}</span>
    </div>
  );
}

type DescNodeProps = {
  text: string;
  measureKey: string;
};

/** Lebar tetap 210 (DW); node tersendiri, bukan menyatu dengan isinya — PRD §4. */
export function DescNode({ text, measureKey }: DescNodeProps) {
  return (
    <div
      data-measure-key={measureKey}
      className="flex min-h-[40px] w-[210px] items-center rounded-[10px] border border-line-2 bg-surface px-3 py-[9px] shadow-node"
    >
      <span className="t-desk text-muted">{text}</span>
    </div>
  );
}
