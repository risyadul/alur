# Alur

**Peta proses interaktif: menggambarkan sebuah alur dari awal hingga tujuannya.**

Susun sebuah proses jadi rangkaian **tahap** berurutan, isi tiap tahap dengan **poin isi**,
lalu lihat hasilnya sebagai peta bergaya mindmap/flowchart yang bisa digeser, di-zoom, dan
dibuka-tutup per tahap.

Prinsip pembedanya: **input dan hasil dipisahkan.** Data dimasukkan di tab **Susun**;
hasilnya dilihat sebagai kanvas interaktif di tab **Peta**.

Spesifikasi lengkap ada di [PRD-Alur.md](./PRD-Alur.md).
Desainnya di [Figma](https://www.figma.com/design/9zb17sKU46eFwhE4V4O5GR/Alur).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi
npx tsc --noEmit # typecheck
npx eslint .     # lint
```

## Stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 (App Router) | native di Vercel; `next/font` menyajikan Fraunces & Instrument Sans tanpa layout shift |
| Bahasa | TypeScript | — |
| Styling | Tailwind CSS v4 | konfigurasi CSS-first (`@theme`) menerima token PRD apa adanya |
| Kanvas peta | dibangun sendiri | PRD §14 — pustaka graf generik akan menghapus identitas visualnya |
| Persistensi | `localStorage` | v1 tidak butuh backend (PRD §9) |
| Ekspor PNG | `html-to-image` | merender DOM yang sesungguhnya, jadi gambar tidak bisa menyimpang dari layar |

Aplikasi ini sepenuhnya berjalan di klien; `/` ter-prerender statis dan tidak ada kode server.

## Struktur

```
app/          layout (font + metadata), globals.css (token & type ramp), page
components/
  AlurApp     satu-satunya batas "use client"; memegang state view/tab/modal
  peta/       kanvas baca-saja: node, penghubung SVG, kamera
  susun/      editor roadmap vertikal — semua penyuntingan ada di sini
  dashboard/  daftar alur, kartu, empty state
  ui/         primitif: Button, IconButton, Chip, Field, Sheet, ikon
hooks/        use-flows (store), use-camera (pan/zoom), use-reduced-motion
lib/          types, flow-ops (immutable), map-layout (algoritma), storage, flow-store
```

### Dua bagian yang perlu diketahui sebelum menyunting

**`lib/map-layout.ts`** — seluruh geometri peta. Tinggi node tidak ditebak: `PetaCanvas`
mengukur node nyata di DOM (`offsetHeight`, yang mengabaikan transform skala kamera), lalu
`computeMapLayout` menata baris dengan `tinggi baris = max(isi, deskripsi)` dan memusatkan
keduanya pada baseline yang sama — itulah sebabnya garis tautan selalu horizontal dan baris
tidak pernah bertumpuk. Pengukuran diulang setelah `document.fonts.ready` karena tinggi
bergantung pada metrik font.

**`hooks/use-camera.ts`** — pan/zoom via Pointer Events. Dua hal yang mudah dirusak:
pointer **tidak** ditangkap saat `pointerdown` (menangkapnya mengalihkan `click` ke viewport
dan mematikan ketuk-untuk-melipat); dan pan/pinch/wheel sengaja tanpa easing, animasi hanya
untuk aksi diskret (tombol zoom & fit) — PRD §7.4.

## Catatan implementasi

- **Token.** Warna di `app/globals.css` cocok 1:1 dengan variable di file Figma. Nama CSS
  memakai namespace `--color-*` karena Tailwind v4 mewajibkannya untuk meng-generate utility
  (`bg-paper`, `text-ink`, …); code syntax di Figma sudah disesuaikan.
- **Kamera awal ≠ pas ke layar.** `COLW = 520` (PRD §7.1) membuat alur beberapa tahap jauh
  lebih lebar dari layar ponsel; "pas ke layar" untuk 3 tahap jatuh ke skala ~0,34 dan tak
  ada yang terbaca. Karena itu peta dibuka pada tahap pertama dengan skala terbaca, dan
  tombol ⤢ tetap melakukan fit sebenarnya. Lihat `frameInitial` di `use-camera.ts`.
- **`danger-soft`** ditambahkan ke palet PRD §8 (yang hanya punya `green-soft`/`amber-soft`)
  untuk lencana konfirmasi hapus.
- **Hapus isi** ada di dalam modal "Ubah isi", bukan tombol terpisah per baris.
- **Ekspor selalu utuh.** PNG digambar dari pohon tersembunyi (`isExporting` di
  `PetaCanvas`), bukan dari kanvas hidup: kanvas hidup punya transform kamera, dan tahap
  yang sedang dilipat akan jadi lubang kosong. Keadaan terlipat & posisi kamera bersifat
  sementara (PRD §9) — yang dibagikan adalah petanya, jadi ekspor selalu skala 1 dengan
  semua tahap terbuka.
- **Garis peta memakai presentation attribute, bukan kelas Tailwind.** html-to-image
  meng-clone subtree SVG apa adanya dan tidak pernah meng-inline computed style anak-anaknya,
  jadi `stroke-green` dkk. akan hilang di gambar hasil ekspor. Warnanya dibaca dari CSS
  variable saat runtime — lihat `lib/map-colors.ts`. **Jangan** ganti kembali ke kelas CSS.

## Belum ada

Test otomatis. Alur utama sudah diverifikasi end-to-end dengan Playwright (buat alur →
tambah tahap & isi → tambah deskripsi → peta → zoom/pan/lipat → reload), tapi skripnya belum
dijadikan test suite di repo ini.
