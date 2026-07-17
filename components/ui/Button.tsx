import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primer" | "sekunder" | "teks" | "bahaya";

type Props = {
  variant?: ButtonVariant;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANTS: Record<ButtonVariant, string> = {
  primer: "bg-green text-surface hover:bg-green-deep",
  sekunder: "bg-surface text-ink border border-line hover:bg-paper",
  teks: "text-green-deep hover:bg-green-soft",
  bahaya: "bg-danger text-surface hover:brightness-95",
};

/** Tinggi 40px — target sentuh PRD §10. */
export function Button({ variant = "primer", className = "", children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`t-label inline-flex h-10 min-w-[88px] items-center justify-center gap-2 rounded-[10px] px-4 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
