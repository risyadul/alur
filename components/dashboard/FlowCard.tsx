import { Fragment } from "react";
import type { Flow } from "@/lib/types";
import { stageRole } from "@/lib/map-layout";
import { Chip } from "@/components/ui/Chip";
import { ArrowRight } from "@/components/ui/icons";

type Props = {
  flow: Flow;
  onOpen: () => void;
};

/** Pita dipotong setelah 4 chip, sisanya diringkas jadi +N — PRD §6.1. */
const RIBBON_LIMIT = 4;

export function FlowCard({ flow, onOpen }: Props) {
  const shown = flow.stages.slice(0, RIBBON_LIMIT);
  const hiddenCount = flow.stages.length - shown.length;

  const totalItems = flow.stages.reduce((n, s) => n + s.items.length, 0);
  const doneItems = flow.stages.reduce(
    (n, s) => n + s.items.filter((i) => i.done).length,
    0,
  );
  const percent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-3 rounded-[14px] border border-line bg-surface p-4 text-left shadow-node transition-colors hover:bg-paper"
    >
      <div className="flex flex-col gap-[3px]">
        <h3 className="t-kartu text-ink">{flow.name}</h3>
        {flow.tujuan && <p className="t-meta text-muted">Tujuan: {flow.tujuan}</p>}
      </div>

      {shown.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {shown.map((stage, i) => (
            <Fragment key={stage.id}>
              {i > 0 && (
                <ArrowRight width={14} height={14} className="shrink-0 text-muted" />
              )}
              <Chip tone={stageRole(i, flow.stages.length)}>{stage.name}</Chip>
            </Fragment>
          ))}
          {hiddenCount > 0 && <span className="t-label-sm text-muted">+{hiddenCount}</span>}
        </div>
      )}

      {totalItems > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="t-meta text-muted">Progres</span>
            <span className="t-meta text-muted">
              {doneItems}/{totalItems} selesai
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-2">
            <div
              className="h-full rounded-full bg-green transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="h-px w-full bg-line-2" aria-hidden="true" />

      <div className="flex items-center justify-between">
        <span className="t-meta text-muted">{flow.stages.length} tahap</span>
        <ArrowRight className="text-muted" />
      </div>
    </button>
  );
}
