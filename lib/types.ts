/** Model data — PRD §5. Urutan larik = urutan tampil. */

export interface Item {
  id: string;
  /** Judul isi (wajib). */
  text: string;
  /** Deskripsi detail (opsional). Kosong = tidak ada node deskripsi di peta. */
  desc: string;
}

export interface Stage {
  id: string;
  name: string;
  items: Item[];
}

export interface Flow {
  id: string;
  name: string;
  /** Tujuan akhir (opsional). */
  tujuan: string;
  createdAt: number;
  stages: Stage[];
}

export interface AlurData {
  flows: Flow[];
}

/** Tab pada tampilan alur — PRD §6.2. Peta adalah default. */
export type FlowTab = "peta" | "susun";
