import { useState } from "react";
import type { Flow, Item } from "@/lib/types";
import { Plus, Route } from "@/components/ui/icons";
import { StageCard } from "./StageCard";

type Props = {
  flow: Flow;
  onAddStage: (name: string) => void;
  onRenameStage: (stageId: string, name: string) => void;
  onRemoveStage: (stageId: string) => void;
  onMoveStage: (stageId: string, direction: -1 | 1) => void;
  onAddItem: (stageId: string, text: string) => void;
  onToggleItemDone: (stageId: string, itemId: string) => void;
  onEditItem: (stageId: string, item: Item) => void;
};

/** Editor bergaya roadmap vertikal — PRD §6.3. Semua penyuntingan terjadi di sini. */
export function SusunEditor({
  flow,
  onAddStage,
  onRenameStage,
  onRemoveStage,
  onMoveStage,
  onAddItem,
  onToggleItemDone,
  onEditItem,
}: Props) {
  const [draftStage, setDraftStage] = useState<string | null>(null);

  const submitStage = () => {
    if (draftStage?.trim()) {
      onAddStage(draftStage);
      setDraftStage("");
    } else {
      setDraftStage(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3.5 px-5 pb-10">
        <div className="flex items-start gap-2.5 rounded-[10px] bg-green-soft px-3 py-2.5 text-green-deep">
          <Route className="mt-px shrink-0" />
          <p className="t-body-sm">
            Isi yang diberi deskripsi akan muncul sebagai node tersendiri di peta.
          </p>
        </div>

        {flow.stages.map((stage, index) => (
          <StageCard
            key={stage.id}
            stage={stage}
            index={index}
            total={flow.stages.length}
            onRename={(name) => onRenameStage(stage.id, name)}
            onRemove={() => onRemoveStage(stage.id)}
            onMove={(direction) => onMoveStage(stage.id, direction)}
            onAddItem={(text) => onAddItem(stage.id, text)}
            onToggleDone={(itemId) => onToggleItemDone(stage.id, itemId)}
            onEditItem={(item) => onEditItem(stage.id, item)}
          />
        ))}

        {draftStage === null ? (
          <button
            type="button"
            onClick={() => setDraftStage("")}
            className="t-body flex h-[46px] items-center justify-center gap-2 rounded-xl border border-dashed border-line text-muted transition-colors hover:bg-surface"
          >
            <Plus />
            Tambah tahap
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitStage();
            }}
          >
            <input
              autoFocus
              aria-label="Nama tahap baru"
              value={draftStage}
              onChange={(e) => setDraftStage(e.target.value)}
              onBlur={submitStage}
              onKeyDown={(e) => {
                if (e.key === "Escape") setDraftStage(null);
              }}
              placeholder="Nama tahap, lalu tekan Enter"
              className="t-body h-[46px] w-full rounded-xl border border-green bg-surface px-3 text-ink outline-none placeholder:text-muted"
            />
          </form>
        )}
      </div>
    </div>
  );
}
