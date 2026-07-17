import type { AlurData } from "./types";
import { EMPTY_DATA, loadData, saveData, type StorageStatus } from "./storage";

/**
 * Store eksternal kecil untuk data alur.
 *
 * Dibuat sebagai store, bukan useState + useEffect, karena penyimpanan memang
 * sistem eksternal: autosave (PRD §9) jadi bagian dari aksi tulis itu sendiri,
 * bukan efek samping yang mengejar perubahan state — sehingga tidak ada render
 * berantai dan tidak mungkin ada jendela di mana state dan localStorage berbeda.
 */
export interface FlowState {
  data: AlurData;
  storageStatus: StorageStatus;
  /** false sampai localStorage terbaca di klien. */
  isLoaded: boolean;
}

const SERVER_STATE: FlowState = {
  data: EMPTY_DATA,
  storageStatus: "persisted",
  isLoaded: false,
};

let state: FlowState = SERVER_STATE;
const listeners = new Set<() => void>();

function commit(next: FlowState): void {
  state = next;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Identitas objek hanya berubah saat ada perubahan nyata — syarat useSyncExternalStore. */
export function getSnapshot(): FlowState {
  return state;
}

export function getServerSnapshot(): FlowState {
  return SERVER_STATE;
}

/** Idempoten — aman dipanggil dari effect tiap mount. */
export function hydrate(): void {
  if (state.isLoaded) return;
  const loaded = loadData();
  commit({ data: loaded.data, storageStatus: loaded.status, isLoaded: true });
}

export function update(fn: (data: AlurData) => AlurData): void {
  const data = fn(state.data);
  if (data === state.data) return;
  commit({ ...state, data, storageStatus: saveData(data) });
}
