import { useState } from "react";
import type { Item, Stage } from "@/lib/types";
import { stageRole } from "@/lib/map-layout";
import { IconButton } from "@/components/ui/IconButton";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash } from "@/components/ui/icons";
import { STAGE_ACCENT, STAGE_TINT } from "@/components/ui/stage-tone";

type Props = {
  stage: Stage;
  index: number;
  total: number;
  onRename: (name: string) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
  onAddItem: (text: string) => void;
  onToggleDone: (itemId: string) => void;
  onEditItem: (item: Item) => void;
};

const INLINE_INPUT =
  "w-full rounded-md border border-green bg-paper px-2 py-1 text-ink outline-none placeholder:text-muted";

export function StageCard({
  stage,
  index,
  total,
  onRename,
  onRemove,
  onMove,
  onAddItem,
  onToggleDone,
  onEditItem,
}: Props) {
  const role = stageRole(index, total);
  // null = tidak sedang menyunting; string = draft aktif.
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftItem, setDraftItem] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const submitName = () => {
    if (draftName?.trim()) onRename(draftName);
    setDraftName(null);
  };

  const submitItem = () => {
    if (draftItem?.trim()) {
      onAddItem(draftItem);
      // Biarkan terbuka — "tambah cepat" berarti bisa beruntun (PRD §6.3).
      setDraftItem("");
    } else {
      setDraftItem(null);
    }
  };

  return (
    <div className="flex overflow-hidden rounded-[14px] border border-line bg-surface shadow-node">
      <div className={`w-1 shrink-0 ${STAGE_ACCENT[role]}`} aria-hidden="true" />

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 py-3 pr-2 pl-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className={`t-label-sm grid size-[22px] shrink-0 place-items-center rounded-full ${STAGE_TINT[role]}`}
              aria-hidden="true"
            >
              {index + 1}
            </span>

            {draftName === null ? (
              <h3 className="t-tahap truncate text-ink">{stage.name}</h3>
            ) : (
              <form
                className="min-w-0 flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitName();
                }}
              >
                <input
                  autoFocus
                  aria-label="Nama tahap"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={submitName}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setDraftName(null);
                  }}
                  className={`t-tahap ${INLINE_INPUT}`}
                />
              </form>
            )}
          </div>

          <div className="flex shrink-0 items-center">
            <IconButton
              label="Naikkan tahap"
              disabled={index === 0}
              onClick={() => onMove(-1)}
            >
              <ChevronUp />
            </IconButton>
            <IconButton
              label="Turunkan tahap"
              disabled={index === total - 1}
              onClick={() => onMove(1)}
            >
              <ChevronDown />
            </IconButton>
            <IconButton label="Ubah nama tahap" onClick={() => setDraftName(stage.name)}>
              <Pencil />
            </IconButton>
            <IconButton
              label="Hapus tahap"
              className="text-danger"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash />
            </IconButton>
          </div>
        </div>

        {/* Konfirmasi inline dua langkah — PRD §6.3. */}
        {isConfirmingDelete && (
          <div className="flex items-center justify-between gap-3 rounded-[10px] bg-danger-soft px-3 py-2">
            <p className="t-body-sm text-ink">Hapus tahap ini beserta isinya?</p>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="t-label rounded-md px-2 py-1 text-muted hover:bg-surface"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="t-label rounded-md px-2 py-1 text-danger hover:bg-surface"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        {stage.items.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {stage.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggleDone(item.id)}
                  aria-pressed={item.done}
                  aria-label={
                    item.done
                      ? `Batalkan tanda selesai: ${item.text}`
                      : `Tandai selesai: ${item.text}`
                  }
                  className={`mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-md border transition-colors ${
                    item.done
                      ? "border-green bg-green text-surface"
                      : "border-line bg-surface text-transparent hover:border-green"
                  }`}
                >
                  <Check width={14} height={14} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`t-body ${item.done ? "text-muted line-through" : "text-ink"}`}>
                    {item.text}
                  </p>
                  {/* Deskripsi tampil abu-abu di bawah judul isi — PRD §6.3. */}
                  {item.desc && <p className="t-body-sm text-muted">{item.desc}</p>}
                </div>
                <IconButton label={`Ubah isi: ${item.text}`} onClick={() => onEditItem(item)}>
                  <Pencil />
                </IconButton>
              </li>
            ))}
          </ul>
        )}

        {draftItem === null ? (
          <button
            type="button"
            onClick={() => setDraftItem("")}
            className="t-body flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-dashed border-line text-muted transition-colors hover:bg-paper"
          >
            <Plus />
            Tambah isi
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitItem();
            }}
          >
            <input
              autoFocus
              aria-label="Isi baru"
              value={draftItem}
              onChange={(e) => setDraftItem(e.target.value)}
              onBlur={submitItem}
              onKeyDown={(e) => {
                if (e.key === "Escape") setDraftItem(null);
              }}
              placeholder="Tulis isi, lalu tekan Enter"
              className={`t-body h-[38px] ${INLINE_INPUT}`}
            />
          </form>
        )}
      </div>
    </div>
  );
}
