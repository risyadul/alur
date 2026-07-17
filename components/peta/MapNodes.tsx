import type { StageRole } from "@/lib/map-layout";
import { STAGE_ACCENT } from "@/components/ui/stage-tone";

type StageNodeProps = {
  name: string;
  itemCount: number;
  role: StageRole;
  isCollapsed: boolean;
  onToggle: () => void;
};

/** 168 × min 58 — PRD §7.1. Ketuk untuk buka-tutup isinya (§7.5). */
export function StageNode({ name, itemCount, role, isCollapsed, onToggle }: StageNodeProps) {
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
        <span className="t-meta text-muted">
          {itemCount} isi{isCollapsed && itemCount > 0 ? " · terlipat" : ""}
        </span>
      </span>
    </button>
  );
}

type MeasuredNodeProps = {
  text: string;
  /** Dibaca PetaCanvas lewat querySelector saat mengukur tinggi (PRD §7.2). */
  measureKey: string;
};

/** Lebar tetap 150 (ITW); tinggi menyesuaikan konten dan diukur — PRD §7.1–7.2. */
export function ItemNode({ text, measureKey }: MeasuredNodeProps) {
  return (
    <div
      data-measure-key={measureKey}
      className="flex min-h-[40px] w-[150px] items-center rounded-[10px] border border-line bg-surface px-3 py-[9px] shadow-node"
    >
      <span className="t-isi text-ink">{text}</span>
    </div>
  );
}

/** Lebar tetap 210 (DW); node tersendiri, bukan menyatu dengan isinya — PRD §4. */
export function DescNode({ text, measureKey }: MeasuredNodeProps) {
  return (
    <div
      data-measure-key={measureKey}
      className="flex min-h-[40px] w-[210px] items-center rounded-[10px] border border-line-2 bg-surface px-3 py-[9px] shadow-node"
    >
      <span className="t-desk text-muted">{text}</span>
    </div>
  );
}
