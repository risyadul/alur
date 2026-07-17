// Lihat catatan di Field.tsx — batas client dipegang AlurApp, bukan file ini.
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** PRD §10 — bottom sheet di mobile, terpusat di layar lebar. */
export function Sheet({ isOpen, onClose, title, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const firstInput = panelRef.current?.querySelector<HTMLElement>("input, textarea");
    (firstInput ?? panelRef.current)?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 animate-[fade-in_160ms_ease-out] bg-ink/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative w-full max-w-[420px] animate-[sheet-in_220ms_var(--ease-out-expo)] rounded-t-[22px] bg-surface p-5 pb-7 shadow-sheet outline-none sm:rounded-[18px] sm:pb-5"
      >
        <div className="mx-auto mb-4 h-1 w-[38px] rounded-full bg-line sm:hidden" />
        <h2 className="t-seksi mb-4 text-ink">{title}</h2>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
