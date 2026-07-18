import type { AlurData, Flow, Item, Stage } from "./types";
import { createId } from "./id";

/** PRD §9 — satu kunci berisi seluruh larik flows sebagai JSON. */
const STORAGE_KEY = "alurflow:data";

/**
 * `persisted` = perubahan tersimpan permanen.
 * `memory`    = penyimpanan tidak tersedia (mis. mode privat / storage diblokir);
 *               aplikasi tetap berjalan penuh dalam sesi — PRD §9.
 */
export type StorageStatus = "persisted" | "memory";

export const EMPTY_DATA: AlurData = { flows: [] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/**
 * Data dari penyimpanan adalah input tak tepercaya — bisa korup, hasil versi lama,
 * atau disunting manual. Normalisasi memperbaiki, bukan menolak, agar pekerjaan
 * pengguna tidak hilang gara-gara satu field rusak.
 */
function normalizeItem(raw: unknown): Item | null {
  if (!isRecord(raw)) return null;
  const text = asString(raw.text).trim();
  if (!text) return null;
  return {
    id: asString(raw.id) || createId(),
    text,
    desc: asString(raw.desc),
    // Data lama tak punya field ini; anggap belum selesai.
    done: raw.done === true,
  };
}

function normalizeStage(raw: unknown): Stage | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name).trim();
  if (!name) return null;
  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeItem).filter((i): i is Item => i !== null)
    : [];
  return { id: asString(raw.id) || createId(), name, items };
}

function normalizeFlow(raw: unknown): Flow | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name).trim();
  if (!name) return null;
  const stages = Array.isArray(raw.stages)
    ? raw.stages.map(normalizeStage).filter((s): s is Stage => s !== null)
    : [];
  return {
    id: asString(raw.id) || createId(),
    name,
    tujuan: asString(raw.tujuan),
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    stages,
  };
}

export function normalizeData(raw: unknown): AlurData {
  if (!isRecord(raw) || !Array.isArray(raw.flows)) return EMPTY_DATA;
  return {
    flows: raw.flows.map(normalizeFlow).filter((f): f is Flow => f !== null),
  };
}

export function loadData(): { data: AlurData; status: StorageStatus } {
  if (typeof window === "undefined") {
    return { data: EMPTY_DATA, status: "memory" };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: EMPTY_DATA, status: "persisted" };
    return { data: normalizeData(JSON.parse(raw)), status: "persisted" };
  } catch {
    // JSON rusak atau localStorage diblokir — jangan kosongkan layar, jalan terus di memori.
    return { data: EMPTY_DATA, status: "memory" };
  }
}

export function saveData(data: AlurData): StorageStatus {
  if (typeof window === "undefined") return "memory";
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return "persisted";
  } catch {
    return "memory";
  }
}
