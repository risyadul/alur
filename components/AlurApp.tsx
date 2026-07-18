"use client";

import { useCallback, useMemo, useState } from "react";
import type { FlowTab, Item } from "@/lib/types";
import { useFlows } from "@/hooks/use-flows";
import {
  addFlow,
  addItem,
  addStage,
  createFlow,
  moveStage,
  removeFlow,
  removeItem,
  removeStage,
  renameStage,
  toggleItemDone,
  updateFlow,
  updateItem,
} from "@/lib/flow-ops";
import { Dashboard } from "./dashboard/Dashboard";
import { FlowView } from "./flow/FlowView";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Sheet } from "./ui/Sheet";
import { StorageNote } from "./ui/StorageNote";
import { Trash } from "./ui/icons";

type Dialog =
  | { kind: "none" }
  | { kind: "buat" }
  | { kind: "ubah-alur" }
  | { kind: "hapus-alur" }
  | { kind: "ubah-isi"; stageId: string; item: Item };

const CLOSED: Dialog = { kind: "none" };

/**
 * Batas client untuk seluruh aplikasi. State inti mengikuti PRD §14:
 * flows, view (dash/flow), currentId, tab, dan status modal.
 */
export function AlurApp() {
  const { data, isLoaded, storageStatus, update } = useFlows();

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [tab, setTab] = useState<FlowTab>("peta");
  const [dialog, setDialog] = useState<Dialog>(CLOSED);
  const [flowDraft, setFlowDraft] = useState({ name: "", tujuan: "" });
  const [itemDraft, setItemDraft] = useState({ text: "", desc: "" });

  // Alur yang dihapus otomatis mengembalikan tampilan ke dashboard.
  const current = useMemo(
    () => data.flows.find((f) => f.id === currentId) ?? null,
    [data.flows, currentId],
  );

  const closeDialog = useCallback(() => setDialog(CLOSED), []);

  const handleCreate = () => {
    const name = flowDraft.name.trim();
    if (!name) return;
    const flow = createFlow(name, flowDraft.tujuan);
    update((d) => addFlow(d, flow));
    setCurrentId(flow.id);
    // PRD §6.1 — setelah dibuat, langsung buka di tab Susun.
    setTab("susun");
    closeDialog();
  };

  const handleUpdateFlow = () => {
    if (!current || !flowDraft.name.trim()) return;
    update((d) => updateFlow(d, current.id, flowDraft));
    closeDialog();
  };

  const handleDeleteFlow = () => {
    if (!current) return;
    update((d) => removeFlow(d, current.id));
    setCurrentId(null);
    closeDialog();
  };

  const handleSaveItem = () => {
    if (dialog.kind !== "ubah-isi" || !current || !itemDraft.text.trim()) return;
    update((d) => updateItem(d, current.id, dialog.stageId, dialog.item.id, itemDraft));
    closeDialog();
  };

  const handleRemoveItem = () => {
    if (dialog.kind !== "ubah-isi" || !current) return;
    update((d) => removeItem(d, current.id, dialog.stageId, dialog.item.id));
    closeDialog();
  };

  // Tahan render sampai localStorage terbaca — cegah kedip dashboard kosong.
  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="t-meta text-muted">Memuat…</p>
      </div>
    );
  }

  return (
    <>
      {current ? (
        <FlowView
          flow={current}
          tab={tab}
          onTabChange={setTab}
          onBack={() => setCurrentId(null)}
          onEditFlow={() => {
            setFlowDraft({ name: current.name, tujuan: current.tujuan });
            setDialog({ kind: "ubah-alur" });
          }}
          onDeleteFlow={() => setDialog({ kind: "hapus-alur" })}
          onAddStage={(name) => update((d) => addStage(d, current.id, name))}
          onRenameStage={(stageId, name) =>
            update((d) => renameStage(d, current.id, stageId, name))
          }
          onRemoveStage={(stageId) => update((d) => removeStage(d, current.id, stageId))}
          onMoveStage={(stageId, direction) =>
            update((d) => moveStage(d, current.id, stageId, direction))
          }
          onAddItem={(stageId, text) => update((d) => addItem(d, current.id, stageId, text))}
          onToggleItemDone={(stageId, itemId) =>
            update((d) => toggleItemDone(d, current.id, stageId, itemId))
          }
          onEditItem={(stageId, item) => {
            setItemDraft({ text: item.text, desc: item.desc });
            setDialog({ kind: "ubah-isi", stageId, item });
          }}
        />
      ) : (
        <Dashboard
          flows={data.flows}
          onOpenFlow={(id) => {
            setCurrentId(id);
            // PRD §6.1 — mengetuk kartu membuka alur, default ke tab Peta.
            setTab("peta");
          }}
          onCreate={() => {
            setFlowDraft({ name: "", tujuan: "" });
            setDialog({ kind: "buat" });
          }}
        />
      )}

      {storageStatus === "memory" && <StorageNote />}

      <Sheet isOpen={dialog.kind === "buat"} onClose={closeDialog} title="Buat alur">
        <Field
          label="Nama alur"
          value={flowDraft.name}
          onChange={(name) => setFlowDraft((d) => ({ ...d, name }))}
          placeholder="Mis. Menuju Pernikahan"
          hasAutoFocus
        />
        <Field
          label="Tujuan akhir (opsional)"
          value={flowDraft.tujuan}
          onChange={(tujuan) => setFlowDraft((d) => ({ ...d, tujuan }))}
          placeholder="Mis. Menikah"
        />
        <div className="flex gap-2.5 pt-1">
          <Button variant="sekunder" className="flex-1" onClick={closeDialog}>
            Batal
          </Button>
          <Button className="flex-1" onClick={handleCreate} disabled={!flowDraft.name.trim()}>
            Buat alur
          </Button>
        </div>
      </Sheet>

      <Sheet isOpen={dialog.kind === "ubah-alur"} onClose={closeDialog} title="Ubah alur">
        <Field
          label="Nama alur"
          value={flowDraft.name}
          onChange={(name) => setFlowDraft((d) => ({ ...d, name }))}
          hasAutoFocus
        />
        <Field
          label="Tujuan akhir (opsional)"
          value={flowDraft.tujuan}
          onChange={(tujuan) => setFlowDraft((d) => ({ ...d, tujuan }))}
          placeholder="Mis. Menikah"
        />
        <div className="flex gap-2.5 pt-1">
          <Button variant="sekunder" className="flex-1" onClick={closeDialog}>
            Batal
          </Button>
          <Button
            className="flex-1"
            onClick={handleUpdateFlow}
            disabled={!flowDraft.name.trim()}
          >
            Simpan
          </Button>
        </div>
      </Sheet>

      <Sheet isOpen={dialog.kind === "hapus-alur"} onClose={closeDialog} title="Hapus alur ini?">
        <div className="-mt-2 flex flex-col gap-4">
          <span className="grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
            <Trash />
          </span>
          <p className="t-body text-muted">
            Seluruh tahap dan isi di dalam “{current?.name}” ikut terhapus. Tindakan ini
            tidak bisa dibatalkan.
          </p>
          <div className="flex gap-2.5 pt-1">
            <Button variant="sekunder" className="flex-1" onClick={closeDialog}>
              Batal
            </Button>
            <Button variant="bahaya" className="flex-1" onClick={handleDeleteFlow}>
              Hapus alur
            </Button>
          </div>
        </div>
      </Sheet>

      <Sheet isOpen={dialog.kind === "ubah-isi"} onClose={closeDialog} title="Ubah isi">
        <Field
          label="Judul"
          value={itemDraft.text}
          onChange={(text) => setItemDraft((d) => ({ ...d, text }))}
          hasAutoFocus
        />
        <Field
          label="Deskripsi (opsional)"
          value={itemDraft.desc}
          onChange={(desc) => setItemDraft((d) => ({ ...d, desc }))}
          placeholder="Jelaskan isi ini lebih rinci…"
          isMultiline
        />
        <p className="t-meta text-muted">
          Deskripsi yang diisi akan tampil sebagai node tersendiri di peta.
        </p>
        <div className="flex gap-2.5 pt-1">
          <Button variant="teks" className="flex-1 text-danger" onClick={handleRemoveItem}>
            Hapus isi
          </Button>
          <Button className="flex-1" onClick={handleSaveItem} disabled={!itemDraft.text.trim()}>
            Simpan
          </Button>
        </div>
      </Sheet>
    </>
  );
}
