"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { MAP } from "@/lib/map-layout";

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * GestureEvent hanya ada di WebKit (Safari desktop & iOS) — tidak ada di lib DOM
 * TypeScript. `scale` bersifat kumulatif sejak gesturestart (=1): >1 = jari
 * merenggang = perbesar. Tandanya sudah benar, jadi tidak rentan terbalik seperti
 * selisih koordinat pointer di iOS.
 */
interface GestureLikeEvent extends Event {
  readonly scale: number;
  readonly clientX: number;
  readonly clientY: number;
}

/** Ambang gerak yang memisahkan ketuk (buka-tutup tahap) dari seret (pan) — PRD §7.5. */
const DRAG_THRESHOLD = 4;
const ZOOM_STEP = 1.35;
const ANIM_MS = 260;

/**
 * Di bawah skala ini teks node tidak lagi terbaca, jadi membuka peta dalam
 * keadaan "pas ke layar" justru menyajikan layar yang tak berguna. Lihat
 * `frameInitial`.
 */
const READABLE_SCALE = 0.6;
const START_MARGIN = 20;

const clampScale = (s: number): number =>
  Math.min(MAP.MAX_SCALE, Math.max(MAP.MIN_SCALE, s));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/**
 * Zoom dengan titik jangkar: titik dunia yang berada di bawah (px, py) tetap di sana.
 * world = (p - cam) / s  →  cam' = p - (p - cam) * (s' / s)
 */
function zoomAt(cam: Camera, factor: number, px: number, py: number): Camera {
  const scale = clampScale(cam.scale * factor);
  const k = scale / cam.scale;
  return { scale, x: px - (px - cam.x) * k, y: py - (py - cam.y) * k };
}

export interface UseCamera {
  cam: Camera;
  /** true bila pointer melewati ambang seret sejak pointerdown — dicek oleh handler ketuk tahap. */
  hasPannedRef: RefObject<boolean>;
  zoomIn: () => void;
  zoomOut: () => void;
  fit: (immediate?: boolean) => void;
  /** Kamera pembuka saat tab Peta dibuka. */
  frameInitial: (columnWidth: number) => void;
}

export function useCamera(
  viewportRef: RefObject<HTMLDivElement | null>,
  content: Size,
  isReducedMotion: boolean,
): UseCamera {
  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, scale: 1 });
  const camRef = useRef<Camera>(cam);
  const rafRef = useRef<number | null>(null);
  const hasPannedRef = useRef(false);

  // Ref disinkronkan di effect, bukan saat render.
  useEffect(() => {
    camRef.current = cam;
  }, [cam]);

  const stopAnim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => stopAnim, [stopAnim]);

  /** Animasi halus hanya untuk aksi diskret (tombol zoom & fit) — PRD §7.4. */
  const animateTo = useCallback(
    (target: Camera, immediate = false) => {
      stopAnim();
      if (immediate || isReducedMotion) {
        setCam(target);
        camRef.current = target;
        return;
      }
      const start = camRef.current;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / ANIM_MS);
        const e = easeOutCubic(p);
        setCam({
          x: lerp(start.x, target.x, e),
          y: lerp(start.y, target.y, e),
          scale: lerp(start.scale, target.scale, e),
        });
        rafRef.current = p < 1 ? requestAnimationFrame(tick) : null;
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [isReducedMotion, stopAnim],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      animateTo(zoomAt(camRef.current, factor, vp.clientWidth / 2, vp.clientHeight / 2));
    },
    [animateTo, viewportRef],
  );

  const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy]);

  /** Pas ke layar: menskalakan & memusatkan seluruh konten — PRD §7.4. */
  const fit = useCallback(
    (immediate = false) => {
      const vp = viewportRef.current;
      if (!vp || content.width <= 0 || content.height <= 0) return;
      const w = vp.clientWidth;
      const h = vp.clientHeight;
      if (w <= 0 || h <= 0) return;
      const scale = clampScale(
        Math.min((w - MAP.PAD * 2) / content.width, (h - MAP.PAD * 2) / content.height),
      );
      animateTo(
        {
          scale,
          x: (w - content.width * scale) / 2,
          y: (h - content.height * scale) / 2,
        },
        immediate,
      );
    },
    [animateTo, content.width, content.height, viewportRef],
  );

  /**
   * Kamera pembuka. Peta kecil dibuka utuh (pas ke layar). Tapi COLW = 520 (PRD §7.1)
   * membuat alur beberapa tahap jauh lebih lebar dari layar ponsel — fit-nya jatuh ke
   * ~0,34 dan tak ada yang terbaca. Untuk kasus itu, buka pada tahap pertama dengan
   * skala terbaca; tombol ⤢ tetap menyediakan fit sebenarnya.
   */
  const frameInitial = useCallback(
    (columnWidth: number) => {
      const vp = viewportRef.current;
      if (!vp || content.width <= 0 || content.height <= 0) return;
      const w = vp.clientWidth;
      const h = vp.clientHeight;
      if (w <= 0 || h <= 0) return;

      const fitScale = Math.min(
        (w - MAP.PAD * 2) / content.width,
        (h - MAP.PAD * 2) / content.height,
      );

      if (fitScale >= READABLE_SCALE) {
        fit(true);
        return;
      }

      const scale = clampScale(Math.min(1, (w - START_MARGIN * 2) / columnWidth));
      animateTo(
        {
          scale,
          x: START_MARGIN,
          y: Math.max(START_MARGIN, (h - content.height * scale) / 2),
        },
        true,
      );
    },
    [animateTo, content.width, content.height, fit, viewportRef],
  );

  // Pointer Events menyatukan mouse & sentuh — PRD §7.4.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    // Safari/WebKit (termasuk iOS) mengekspos GestureEvent; di sana pinch ditangani
    // gestur native (scale bertanda benar). Chrome/Firefox = false → pakai jalur pointer.
    const SUPPORTS_GESTURE = "GestureEvent" in window;

    const pointers = new Map<number, { x: number; y: number }>();
    let isPanning = false;
    let last = { x: 0, y: 0 };
    let downAt = { x: 0, y: 0 };
    let pinchDist = 0;

    const local = (e: PointerEvent) => {
      const r = vp.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const handleDown = (e: PointerEvent) => {
      // Kontrol melayang (zoom, lipat) menangani pointer-nya sendiri.
      if ((e.target as HTMLElement).closest("[data-camera-ignore]")) return;
      const p = local(e);
      pointers.set(e.pointerId, p);
      stopAnim();

      if (pointers.size === 1) {
        isPanning = true;
        hasPannedRef.current = false;
        last = p;
        downAt = p;
        // Sengaja BELUM setPointerCapture di sini: menangkap pointer sejak pointerdown
        // mengalihkan mousedown/mouseup ke viewport, sehingga event `click` tidak pernah
        // sampai ke node tahap dan ketukan untuk buka-tutup jadi mati. Tangkap nanti,
        // begitu gerakan terbukti seret (lihat handleMove).
      } else if (pointers.size === 2) {
        isPanning = false;
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };

    const handleMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const p = local(e);
      pointers.set(e.pointerId, p);

      // Cubit dua jari — zoom di titik tengah cubitan.
      if (pointers.size >= 2) {
        // Di Safari/iOS zoom ditangani GestureEvent (di bawah). Jalur pointer ini
        // memakai selisih koordinat yang di iOS bisa terbalik — lewati agar tak dobel.
        if (SUPPORTS_GESTURE) return;
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0 && dist > 0) {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          setCam((c) => zoomAt(c, dist / pinchDist, mx, my));
          hasPannedRef.current = true;
        }
        pinchDist = dist;
        return;
      }

      if (!isPanning) return;
      if (!hasPannedRef.current && Math.hypot(p.x - downAt.x, p.y - downAt.y) > DRAG_THRESHOLD) {
        hasPannedRef.current = true;
        // Sekarang jelas ini seret, bukan ketuk — aman menangkap pointer agar
        // pan tetap jalan meski kursor keluar dari viewport.
        if (vp.hasPointerCapture?.(e.pointerId) === false) {
          vp.setPointerCapture(e.pointerId);
        }
      }
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      last = p;
      // Langsung, tanpa easing, agar terasa responsif — PRD §7.4.
      setCam((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
    };

    const handleUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) {
        isPanning = false;
      } else {
        // Satu jari terangkat dari cubitan — lanjutkan pan dari jari yang tersisa.
        const [remaining] = [...pointers.values()];
        isPanning = true;
        last = remaining;
        downAt = remaining;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = vp.getBoundingClientRect();
      // deltaMode 1 = baris, bukan piksel (Firefox).
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      setCam((c) => zoomAt(c, Math.exp(-delta * 0.0015), e.clientX - r.left, e.clientY - r.top));
    };

    // Pinch native Safari/iOS. preventDefault menahan zoom-halaman bawaan Safari;
    // scale kumulatif (mulai 1) dibuat inkremental lewat rasio ke nilai sebelumnya.
    let gestureScale = 1;
    const handleGestureStart = (e: GestureLikeEvent) => {
      e.preventDefault();
      stopAnim();
      gestureScale = e.scale || 1;
      hasPannedRef.current = true; // gestur ≠ ketuk — jangan picu buka-tutup tahap
    };
    const handleGestureChange = (e: GestureLikeEvent) => {
      e.preventDefault();
      if (gestureScale <= 0) return;
      const r = vp.getBoundingClientRect();
      const factor = e.scale / gestureScale;
      gestureScale = e.scale;
      setCam((c) => zoomAt(c, factor, e.clientX - r.left, e.clientY - r.top));
    };
    const handleGestureEnd = (e: GestureLikeEvent) => {
      e.preventDefault();
      gestureScale = 1;
    };

    vp.addEventListener("pointerdown", handleDown);
    vp.addEventListener("pointermove", handleMove);
    vp.addEventListener("pointerup", handleUp);
    vp.addEventListener("pointercancel", handleUp);
    vp.addEventListener("wheel", handleWheel, { passive: false });
    if (SUPPORTS_GESTURE) {
      vp.addEventListener("gesturestart", handleGestureStart as EventListener);
      vp.addEventListener("gesturechange", handleGestureChange as EventListener);
      vp.addEventListener("gestureend", handleGestureEnd as EventListener);
    }

    return () => {
      vp.removeEventListener("pointerdown", handleDown);
      vp.removeEventListener("pointermove", handleMove);
      vp.removeEventListener("pointerup", handleUp);
      vp.removeEventListener("pointercancel", handleUp);
      vp.removeEventListener("wheel", handleWheel);
      if (SUPPORTS_GESTURE) {
        vp.removeEventListener("gesturestart", handleGestureStart as EventListener);
        vp.removeEventListener("gesturechange", handleGestureChange as EventListener);
        vp.removeEventListener("gestureend", handleGestureEnd as EventListener);
      }
    };
  }, [stopAnim, viewportRef]);

  return { cam, hasPannedRef, zoomIn, zoomOut, fit, frameInitial };
}
