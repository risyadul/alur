import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Stage } from "@/lib/types";
import { MAP, computeMapLayout, type HeightMap } from "@/lib/map-layout";
import { exportNodeToPng } from "@/lib/export-image";
import { useCamera } from "@/hooks/use-camera";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Download, Fit, Fold, Minus, Plus, Unfold } from "@/components/ui/icons";
import { MapContent } from "./MapContent";

type Props = {
  stages: Stage[];
  flowName: string;
  onGoToSusun: () => void;
};

/** Ekspor selalu menggambar peta utuh — lihat catatan di `handleExport`. */
const NONE: ReadonlySet<string> = new Set();

const PILL =
  "t-label inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-[7px] pr-3 pl-2.5 text-ink shadow-node transition-colors hover:bg-paper";

function sameHeights(a: HeightMap, b: HeightMap): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

/** Kanvas peta — baca-saja (PRD §6.4). Seluruh penyuntingan ada di tab Susun. */
export function PetaCanvas({ stages, flowName, onGoToSusun }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const hasFittedRef = useRef(false);

  const [heights, setHeights] = useState<HeightMap>({});
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const isReducedMotion = useReducedMotion();

  const layout = useMemo(() => computeMapLayout(stages, heights), [stages, heights]);
  const content = useMemo(
    () => ({ width: layout.width, height: layout.height }),
    [layout.width, layout.height],
  );

  const { cam, hasPannedRef, zoomIn, zoomOut, fit, frameInitial } = useCamera(
    viewportRef,
    content,
    isReducedMotion,
  );

  /**
   * Ukur tinggi node nyata di DOM lalu tata ulang — PRD §7.2.
   * `offsetHeight` dipakai (bukan getBoundingClientRect) karena ia mengabaikan
   * transform skala kamera, jadi angkanya tetap dalam koordinat peta.
   * Query dibatasi ke contentRef agar pohon ekspor tidak ikut terukur.
   */
  const measure = useCallback(() => {
    const root = contentRef.current;
    if (!root) return;
    const next: Record<string, number> = {};
    for (const el of root.querySelectorAll<HTMLElement>("[data-measure-key]")) {
      const key = el.dataset.measureKey;
      if (key) next[key] = el.offsetHeight;
    }
    setHeights((prev) => (sameHeights(prev, next) ? prev : next));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [stages, measure]);

  // Tinggi bergantung metrik font — ukur ulang setelah font selesai dimuat (PRD §7.2).
  useEffect(() => {
    let isCancelled = false;
    document.fonts?.ready.then(() => {
      if (!isCancelled) measure();
    });
    return () => {
      isCancelled = true;
    };
  }, [measure]);

  // Bingkai kamera sekali saat peta pertama tergambar. rAF dijadwal ulang selama
  // ukuran konten masih berubah (tinggi node belum stabil), jadi hasilnya akurat.
  useEffect(() => {
    if (hasFittedRef.current || content.width <= 0) return;
    const id = requestAnimationFrame(() => {
      hasFittedRef.current = true;
      frameInitial(layout.columnWidth);
    });
    return () => cancelAnimationFrame(id);
  }, [content.width, content.height, frameInitial, layout.columnWidth]);

  const handleToggleStage = useCallback(
    (stageId: string) => {
      // Seret ≠ ketuk — PRD §7.5.
      if (hasPannedRef.current) return;
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        if (next.has(stageId)) next.delete(stageId);
        else next.add(stageId);
        return next;
      });
    },
    [hasPannedRef],
  );

  const isAnyOpen = stages.some((s) => !collapsedIds.has(s.id));

  const handleToggleAll = useCallback(() => {
    setCollapsedIds(isAnyOpen ? new Set(stages.map((s) => s.id)) : new Set());
  }, [isAnyOpen, stages]);

  /**
   * Ekspor PNG — PRD §13 butir 3.
   *
   * Digambar dari pohon tersembunyi, bukan dari kanvas hidup, karena dua alasan:
   * kanvas hidup punya transform kamera (gambar akan ikut ter-zoom/tergeser), dan
   * tahap yang sedang dilipat akan tampil sebagai lubang kosong. Keadaan terlipat
   * & posisi kamera bersifat sementara (PRD §9) — yang dibagikan adalah petanya,
   * jadi ekspor selalu utuh, skala 1, semua tahap terbuka.
   */
  const handleExport = async () => {
    if (isExporting) return;
    setExportError(null);
    // flushSync: pohon ekspor harus sudah ada di DOM sebelum baris berikutnya membacanya.
    flushSync(() => setIsExporting(true));
    try {
      const node = exportRef.current;
      if (!node) throw new Error("Pohon ekspor gagal ter-mount");
      await exportNodeToPng(node, flowName);
    } catch {
      setExportError("Ekspor gagal. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  // PRD §6.4 — empty state mengarahkan ke tab Susun.
  if (stages.length === 0) {
    return (
      <div className="dot-canvas flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="t-seksi text-ink">Belum ada tahap</p>
        <p className="t-body max-w-[300px] text-muted">
          Tambahkan tahap pertama di tab Susun — petanya akan tergambar di sini.
        </p>
        <Button variant="sekunder" onClick={onGoToSusun}>
          Buka tab Susun
        </Button>
      </div>
    );
  }

  return (
    <div ref={viewportRef} className="map-viewport dot-canvas relative flex-1 overflow-hidden">
      <div
        ref={contentRef}
        className="absolute top-0 left-0 origin-top-left"
        style={{
          transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.scale})`,
          width: layout.width,
          height: layout.height,
        }}
      >
        <MapContent
          stages={stages}
          layout={layout}
          collapsedIds={collapsedIds}
          onToggleStage={handleToggleStage}
        />
      </div>

      {/* Lipat semua / Buka semua — PRD §6.4 */}
      <div data-camera-ignore className="absolute top-4 left-4">
        <button type="button" onClick={handleToggleAll} className={PILL}>
          {isAnyOpen ? <Fold /> : <Unfold />}
          {isAnyOpen ? "Lipat semua" : "Buka semua"}
        </button>
      </div>

      <div data-camera-ignore className="absolute top-4 right-4">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={`${PILL} disabled:opacity-60`}
        >
          <Download />
          {isExporting ? "Menyiapkan…" : "Ekspor PNG"}
        </button>
      </div>

      {exportError && (
        <p
          role="alert"
          className="t-petunjuk absolute top-[60px] right-4 rounded-full border border-danger bg-danger-soft px-3 py-1.5 text-ink"
        >
          {exportError}
        </p>
      )}

      {/* Kontrol kamera — PRD §6.4 */}
      <div data-camera-ignore className="absolute right-5 bottom-[76px] flex flex-col gap-2">
        <IconButton variant="papan" label="Perbesar" onClick={zoomIn}>
          <Plus />
        </IconButton>
        <IconButton variant="papan" label="Perkecil" onClick={zoomOut}>
          <Minus />
        </IconButton>
        <IconButton variant="papan" label="Pas ke layar" onClick={() => fit()}>
          <Fit />
        </IconButton>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
        <p className="t-petunjuk rounded-full border border-line bg-surface px-3 py-[7px] text-muted">
          Geser peta · cubit/gulir zoom · ketuk tahap buka-tutup
        </p>
      </div>

      {/* Pohon ekspor: di luar layar, hanya ada selama proses ekspor berjalan. */}
      {isExporting && (
        <div className="pointer-events-none fixed top-0 left-[-99999px]" aria-hidden="true">
          <div
            ref={exportRef}
            className="dot-canvas relative"
            style={{
              width: layout.width + MAP.PAD * 2,
              height: layout.height + MAP.PAD * 2,
            }}
          >
            <div
              className="absolute"
              style={{
                left: MAP.PAD,
                top: MAP.PAD,
                width: layout.width,
                height: layout.height,
              }}
            >
              <MapContent stages={stages} layout={layout} collapsedIds={NONE} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
