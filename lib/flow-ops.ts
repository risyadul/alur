import type { AlurData, Flow, Item, Stage } from "./types";
import { createId } from "./id";

/**
 * Seluruh operasi mengembalikan salinan baru — tidak pernah memutasi masukan.
 * Ini yang membuat autosave (PRD §9) cukup memantau identitas objek data.
 */

function mapFlow(
  data: AlurData,
  flowId: string,
  fn: (flow: Flow) => Flow,
): AlurData {
  return {
    ...data,
    flows: data.flows.map((f) => (f.id === flowId ? fn(f) : f)),
  };
}

function mapStage(
  data: AlurData,
  flowId: string,
  stageId: string,
  fn: (stage: Stage) => Stage,
): AlurData {
  return mapFlow(data, flowId, (flow) => ({
    ...flow,
    stages: flow.stages.map((s) => (s.id === stageId ? fn(s) : s)),
  }));
}

// ————— Alur —————

export function createFlow(name: string, tujuan: string): Flow {
  return {
    id: createId(),
    name: name.trim(),
    tujuan: tujuan.trim(),
    createdAt: Date.now(),
    stages: [],
  };
}

export function addFlow(data: AlurData, flow: Flow): AlurData {
  return { ...data, flows: [flow, ...data.flows] };
}

export function updateFlow(
  data: AlurData,
  flowId: string,
  patch: { name: string; tujuan: string },
): AlurData {
  return mapFlow(data, flowId, (flow) => ({
    ...flow,
    name: patch.name.trim(),
    tujuan: patch.tujuan.trim(),
  }));
}

export function removeFlow(data: AlurData, flowId: string): AlurData {
  return { ...data, flows: data.flows.filter((f) => f.id !== flowId) };
}

// ————— Tahap —————

export function addStage(data: AlurData, flowId: string, name: string): AlurData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const stage: Stage = { id: createId(), name: trimmed, items: [] };
  return mapFlow(data, flowId, (flow) => ({
    ...flow,
    stages: [...flow.stages, stage],
  }));
}

export function renameStage(
  data: AlurData,
  flowId: string,
  stageId: string,
  name: string,
): AlurData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  return mapStage(data, flowId, stageId, (stage) => ({ ...stage, name: trimmed }));
}

export function removeStage(
  data: AlurData,
  flowId: string,
  stageId: string,
): AlurData {
  return mapFlow(data, flowId, (flow) => ({
    ...flow,
    stages: flow.stages.filter((s) => s.id !== stageId),
  }));
}

/** Reorder = menukar posisi elemen larik — PRD §5. */
export function moveStage(
  data: AlurData,
  flowId: string,
  stageId: string,
  direction: -1 | 1,
): AlurData {
  return mapFlow(data, flowId, (flow) => {
    const from = flow.stages.findIndex((s) => s.id === stageId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= flow.stages.length) return flow;
    const stages = [...flow.stages];
    [stages[from], stages[to]] = [stages[to], stages[from]];
    return { ...flow, stages };
  });
}

// ————— Isi —————

export function addItem(
  data: AlurData,
  flowId: string,
  stageId: string,
  text: string,
): AlurData {
  const trimmed = text.trim();
  if (!trimmed) return data;
  const item: Item = { id: createId(), text: trimmed, desc: "", done: false };
  return mapStage(data, flowId, stageId, (stage) => ({
    ...stage,
    items: [...stage.items, item],
  }));
}

export function toggleItemDone(
  data: AlurData,
  flowId: string,
  stageId: string,
  itemId: string,
): AlurData {
  return mapStage(data, flowId, stageId, (stage) => ({
    ...stage,
    items: stage.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
  }));
}

export function updateItem(
  data: AlurData,
  flowId: string,
  stageId: string,
  itemId: string,
  patch: { text: string; desc: string },
): AlurData {
  const trimmed = patch.text.trim();
  if (!trimmed) return data;
  return mapStage(data, flowId, stageId, (stage) => ({
    ...stage,
    items: stage.items.map((i) =>
      i.id === itemId ? { ...i, text: trimmed, desc: patch.desc.trim() } : i,
    ),
  }));
}

export function removeItem(
  data: AlurData,
  flowId: string,
  stageId: string,
  itemId: string,
): AlurData {
  return mapStage(data, flowId, stageId, (stage) => ({
    ...stage,
    items: stage.items.filter((i) => i.id !== itemId),
  }));
}
