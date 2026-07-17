import { toBlob } from "html-to-image";

/** Latar gambar hasil ekspor — token `paper`. */
const PAPER = "#f4f2ec";
const PIXEL_RATIO = 2;

/** Nama berkas dari nama alur: "Menuju Pernikahan" → "menuju-pernikahan.png". */
export function toFileName(flowName: string): string {
  const slug = flowName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "alur"}.png`;
}

function download(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Jangan revoke sinkron: sebagian browser membatalkan unduhan yang belum dimulai.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Merender sebuah node DOM jadi PNG lalu mengunduhnya — PRD §13 butir 3.
 *
 * html-to-image bekerja dengan mengkloning node, menyalin computed style, lalu
 * menyerialkannya jadi SVG di dalam canvas. Karena itu font harus benar-benar
 * termuat sebelum dipanggil: kalau belum, teks terekam dengan metrik font
 * fallback dan gambarnya tidak cocok dengan yang di layar.
 */
export async function exportNodeToPng(node: HTMLElement, flowName: string): Promise<void> {
  await document.fonts.ready;

  const blob = await toBlob(node, {
    pixelRatio: PIXEL_RATIO,
    backgroundColor: PAPER,
    cacheBust: true,
  });

  if (!blob) throw new Error("Gagal membuat gambar dari kanvas peta");
  download(blob, toFileName(flowName));
}
