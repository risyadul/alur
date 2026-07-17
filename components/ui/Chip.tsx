import type { StageRole } from "@/lib/map-layout";
import { STAGE_TINT } from "./stage-tone";

type Props = {
  tone: StageRole;
  children: string;
};

/** Chip pita ringkas di kartu dashboard — PRD §6.1. */
export function Chip({ tone, children }: Props) {
  return (
    <span
      className={`t-label-sm inline-flex h-6 shrink-0 items-center rounded-full px-[9px] ${STAGE_TINT[tone]}`}
    >
      {children}
    </span>
  );
}
