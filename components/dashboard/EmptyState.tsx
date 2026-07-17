import { Chip } from "@/components/ui/Chip";
import { ArrowRight } from "@/components/ui/icons";

/** PRD §6.1 — ajakan membuat alur pertama, disertai contoh pita. */
export function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[18px] px-7">
      <div className="flex w-full max-w-[340px] flex-col items-center gap-3 rounded-[14px] border border-dashed border-line px-4 py-[18px]">
        <span className="t-overline text-muted">Contoh alur</span>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <Chip tone="awal">Perkenalan</Chip>
          <ArrowRight width={14} height={14} className="shrink-0 text-muted" />
          <Chip tone="tengah">Khitbah</Chip>
          <ArrowRight width={14} height={14} className="shrink-0 text-muted" />
          <Chip tone="tujuan">Menikah</Chip>
        </div>
      </div>

      <div className="flex flex-col items-center gap-[7px] text-center">
        <h2 className="t-seksi text-ink">Belum ada alur</h2>
        <p className="t-body max-w-[320px] text-muted">
          Susun sebuah proses jadi tahap berurutan, isi tiap tahap, lalu lihat hasilnya
          sebagai peta yang bisa digeser dan di-zoom.
        </p>
      </div>
    </div>
  );
}
