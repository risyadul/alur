/**
 * PRD §9 — bila penyimpanan tidak tersedia, aplikasi tetap berjalan penuh dalam
 * sesi; catatan halus ini memberi tahu bahwa perubahan belum tersimpan permanen.
 */
export function StorageNote() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-40 flex justify-center px-4">
      <p
        role="status"
        className="t-petunjuk rounded-full border border-amber bg-amber-soft px-3 py-1.5 text-ink"
      >
        Penyimpanan tidak tersedia — perubahan hanya bertahan selama sesi ini.
      </p>
    </div>
  );
}
