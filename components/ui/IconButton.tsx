import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "hantu" | "papan";

type Props = {
  /** Wajib — ikon tanpa teks butuh label ARIA (PRD §10). */
  label: string;
  variant?: IconButtonVariant;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANTS: Record<IconButtonVariant, string> = {
  hantu: "hover:bg-line-2",
  papan: "bg-surface border border-line shadow-node hover:bg-paper",
};

/** 34×34 — target sentuh ikon PRD §10. */
export function IconButton({
  label,
  variant = "hantu",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-[34px] shrink-0 place-items-center rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
