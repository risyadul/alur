# PRD — Alur

**Peta proses interaktif: menggambarkan sebuah alur dari awal hingga tujuannya.**

Versi dokumen: 1.0 · Status: Siap implementasi · Bahasa produk: Indonesia

---

## 1. Ringkasan Produk

**Alur** adalah aplikasi untuk menggambarkan sebuah proses sebagai peta interaktif yang mengalir. Pengguna menyusun sebuah proses menjadi rangkaian **tahap** berurutan (mis. `Perkenalan → Khitbah → Menikah`), mengisi tiap tahap dengan **poin isi**, dan menambahkan **deskripsi detail** pada tiap isi. Hasilnya divisualisasikan sebagai peta bergaya *mindmap/flowchart* yang bisa digeser, di-zoom, dan dibuka-tutup per tahap.

Prinsip pembeda inti: **input dan hasil dipisahkan.** Pengguna memasukkan data di satu tempat (tab **Susun**), lalu melihat hasilnya sebagai kanvas interaktif tersendiri (tab **Peta**).

Implementasi rujukan saat ini berupa satu berkas HTML mandiri (vanilla JS). PRD ini dapat dipakai untuk membangun ulang sebagai proyek yang lebih terstruktur (mis. React) atau untuk mengembangkan berkas yang ada.

---

## 2. Masalah & Tujuan

**Masalah.** Menjelaskan sebuah proses bertahap (dan rincian di dalamnya) sulit dilakukan hanya dengan teks linear atau daftar. Diagram alur statis juga tidak nyaman diedit dan tidak enak dibaca di layar kecil.

**Tujuan produk.**

- Memungkinkan siapa pun menyusun sebuah proses menjadi peta bertingkat tanpa alat diagram yang rumit.
- Menjaga proses input tetap sederhana, sementara hasil visualnya kaya dan interaktif.
- Bekerja mulus di perangkat mobile (target utama), tetap baik di desktop.
- Menyimpan pekerjaan secara otomatis sehingga tidak hilang.

**Non-tujuan (untuk v1).** Kolaborasi real-time, akun/login, percabangan non-linear, dan ekspor gambar (lihat bagian 13).

---

## 3. Pengguna Sasaran

Individu yang ingin memetakan target/proses pribadi secara terstruktur namun tetap hangat dan mudah dibaca — misalnya perencanaan tahap kehidupan, alur belajar, atau tahapan proyek personal. Pengguna nyaman berpikir dalam kerangka bertingkat, mengutamakan pengalaman mobile, dan menghargai tampilan yang rapi dan tidak kaku.

---

## 4. Konsep Inti & Hierarki

Empat tingkat, dari luar ke dalam:

1. **Alur** — satu proses utuh. Punya *nama* dan *tujuan akhir* (opsional). Contoh: "Menuju Pernikahan".
2. **Tahap** — simpul berurutan yang membentuk alur. Contoh: `Perkenalan`, `Khitbah`, `Menikah`. Urutan bermakna (kiri → kanan / awal → akhir).
3. **Isi** — poin di dalam sebuah tahap. Contoh pada `Perkenalan`: "Membahas Visi Misi", "Mengenal satu sama lain".
4. **Deskripsi** — penjelasan rinci sebuah isi. Bersifat opsional. Di peta, deskripsi tampil sebagai **node tersendiri** yang bercabang dari node isinya (bukan menyatu).

Relasi:
- Antar-**tahap**: berurutan (rantai berarah, ada panah).
- **Isi** terhadap tahap: himpunan (cabang, tanpa urutan bermakna).
- **Deskripsi** terhadap isi: satu deskripsi opsional per isi, sebagai anak node.

---

## 5. Model Data

Struktur data disimpan sebagai satu objek berisi larik `flows`. Skema (mengikuti implementasi rujukan):

```json
{
  "flows": [
    {
      "id": "string (unik)",
      "name": "string (wajib)",
      "tujuan": "string (opsional)",
      "createdAt": 0,
      "stages": [
        {
          "id": "string (unik)",
          "name": "string (wajib)",
          "items": [
            {
              "id": "string (unik)",
              "text": "string (judul isi, wajib)",
              "desc": "string (deskripsi detail, opsional)"
            }
          ]
        }
      ]
    }
  ]
}
```

Catatan:
- `id` cukup string alfanumerik acak yang unik.
- Urutan `stages` dan `items` dalam larik = urutan tampil. Reorder = menukar posisi elemen larik.
- `desc` kosong berarti isi tersebut tidak memiliki node deskripsi di peta.

---

## 6. Fitur & Kebutuhan Fungsional

### 6.1 Dashboard (daftar alur)

- Menampilkan seluruh alur sebagai kartu: nama, tujuan (jika ada), **pita ringkas** (chip tahap dengan panah, mis. `Perkenalan → Khitbah → Menikah`, dipotong `+N` bila lebih dari 4), dan jumlah tahap.
- Tombol **Buat alur** membuka modal (nama + tujuan opsional). Setelah dibuat, langsung membuka alur di tab **Susun**.
- **Empty state**: ajakan membuat alur pertama, disertai contoh pita `Perkenalan → Khitbah → Menikah`.
- Mengetuk kartu membuka alur (default ke tab **Peta**).

### 6.2 Tampilan Alur — Header & Tab

- Header: tombol kembali, ubah alur (nama + tujuan), hapus alur (modal konfirmasi).
- Judul alur + baris "Tujuan: …" bila diisi.
- Dua tab: **Peta** (hasil, default) dan **Susun** (input).

### 6.3 Tab Susun (editor / input)

Editor bergaya *roadmap* vertikal:

- **Tahap**: tambah (input nama), ubah nama (inline), hapus (konfirmasi inline dua langkah), pindah urutan naik/turun (▲▼, dinonaktifkan di ujung).
- **Isi**: tambah cepat (input teks → langsung jadi isi tanpa deskripsi), ubah (modal berisi *Judul* + *Deskripsi*), hapus.
- Deskripsi tampil sebagai teks abu-abu di bawah judul isi.
- Petunjuk singkat bahwa deskripsi yang diisi akan tampil sebagai node di peta.

### 6.4 Tab Peta (kanvas interaktif)

- Merender hierarki sebagai peta: **rantai tahap horizontal** (flowchart) dengan cabang **isi** dan **deskripsi** (mindmap). Spesifikasi rinci di bagian 7.
- Kontrol kamera: perbesar (+), perkecil (−), **pas ke layar** (⤢).
- Tombol **Lipat semua / Buka semua** (kiri atas).
- Baris petunjuk: geser untuk memindahkan · cubit/gulir untuk zoom · ketuk tahap untuk buka-tutup.
- **Empty state**: bila belum ada tahap, arahkan ke tab Susun.
- Peta bersifat **baca-saja**; semua penyuntingan dilakukan di tab Susun (tidak ada popup penyuntingan yang terpicu dari peta).

### 6.5 CRUD Alur

- Buat, ubah (nama + tujuan), hapus (dengan modal konfirmasi yang menyatakan bahwa seluruh tahap & isi ikut terhapus).

---

## 7. Spesifikasi Kanvas Peta

Bagian ini adalah inti produk dan paling detail.

### 7.1 Susunan (layout)

Tiga tingkat visual:

- **Tahap** diletakkan berjajar horizontal di pita tengah (baseline `y = 0`), berjarak `COLW` antar pusat tahap.
- Dari tiap tahap turun sebuah **batang (trunk)** vertikal.
- **Isi** bercabang ke kanan dari batang, tersusun menurun.
- **Deskripsi** (bila ada) bercabang ke kanan dari node isinya.

Tinggi node deskripsi dan isi **menyesuaikan konten** (diukur, bukan tetap). Karena itu tinggi baris tiap isi = `max(tinggi isi, tinggi deskripsi)`, dan node isi & deskripsi disejajarkan pada pusat baris yang sama agar garis penghubungnya horizontal.

**Konstanta layout (nilai rujukan, boleh disesuaikan):**

| Konstanta | Nilai | Keterangan |
|---|---|---|
| `SW` × `SH` | 168 × 58 | ukuran node tahap (SH = min-height) |
| `ITW` | 150 | lebar node isi (judul saja) |
| `DW` | 210 | lebar node deskripsi |
| `ITH` | 40 | tinggi isi fallback bila belum terukur |
| `IGAP` | 14 | jarak vertikal antar baris isi |
| `ITOP` | 44 | jarak dari bawah tahap ke baris isi pertama |
| `TRUNK` | 16 | offset batang → isi |
| `GAP2` | 24 | jarak isi → deskripsi |
| `PAD` | 46 | padding sekeliling konten |
| `COLW` | 520 bila ada deskripsi, selain itu 300 | jarak antar pusat tahap (adaptif) |

`COLW` adaptif: bila ada minimal satu isi berdeskripsi di alur, gunakan jarak lebar (agar node deskripsi muat sebelum tahap berikutnya); bila tidak ada deskripsi sama sekali, rapatkan.

### 7.2 Pengukuran tinggi node

- Sebelum menata, render node isi & deskripsi secara off-screen (tersembunyi) memakai lebar & gaya yang sama, lalu baca `offsetHeight`.
- **Ukur ulang setelah font selesai dimuat** (`document.fonts.ready`) karena tinggi bergantung pada metrik font; perbarui posisi bila perlu.

### 7.3 Penghubung (edges)

- **Antar-tahap (flow)**: garis horizontal berpanah, warna hijau (`#2A6A55`).
- **Batang (trunk)**: garis vertikal dari bawah tahap ke pusat baris isi terakhir, hijau lembut (`#A9CBBB`).
- **Cabang isi (branch)**: garis horizontal dari batang ke tepi kiri isi, hijau lembut (`#A9CBBB`).
- **Tautan deskripsi (link)**: garis horizontal dari tepi kanan isi ke tepi kiri deskripsi, lebih tipis dan lebih terang (`#CBD9D1`).
- Tahap pertama diberi aksen kiri **hijau** (start), tahap terakhir aksen kiri **amber** (goal/tujuan).

### 7.4 Interaksi kamera

- **Geser (pan)**: seret dengan mouse atau satu jari. Langsung (tanpa easing) agar responsif.
- **Zoom**: gulir (wheel), cubit dua jari (pinch, zoom di titik tengah cubitan), dan tombol +/−. Batas skala `0.25`–`2.6`.
- **Pas ke layar (fit)**: menskalakan & memusatkan seluruh konten ke dalam kanvas.
- **Animasi halus** hanya untuk aksi diskret (tombol zoom & fit); pan/pinch/wheel bersifat langsung.
- Kanvas memakai `touch-action: none` agar gestur tidak menggulung halaman; gunakan Pointer Events untuk menyatukan mouse & sentuh.

### 7.5 Buka/tutup tahap (collapse)

- **Ketuk node tahap** untuk menyembunyikan/menampilkan seluruh **isi + deskripsi + penghubung** miliknya.
- Transisi halus: memudar + sedikit mengecil (opacity & transform).
- Node lain **tidak bergeser** saat sebuah tahap dilipat (posisi tetap; ruang tetap dipesan). Ini menjaga interaksi tenang dan tak melompat.
- Tombol **Lipat semua / Buka semua** memutar antara kedua keadaan berdasarkan apakah masih ada tahap yang terbuka.
- Bedakan **ketuk** (buka/tutup) dari **seret** (pan) menggunakan ambang gerak (mis. > 4px = seret).

---

## 8. Desain Visual & Sistem Desain

Nuansa: hangat, tenang, personal — seperti jurnal, bukan aplikasi kantor.

**Palet warna:**

| Token | Hex | Pemakaian |
|---|---|---|
| paper | `#F4F2EC` | latar halaman |
| surface | `#FCFBF7` | kartu / node |
| ink | `#201E1A` | teks utama |
| muted | `#78736B` | teks sekunder |
| line | `#E4DFD5` | garis/border |
| line-2 | `#EDE9E1` | pembatas halus |
| green | `#2A6A55` | primer, progres, tahap awal |
| green-deep | `#1F5340` | hover primer, aksen |
| green-soft | `#D7E6DD` | tint, border lembut |
| amber | `#CF9A3A` | tahap tujuan, sorotan |
| amber-soft | `#F4E7CB` | tint amber |
| danger | `#B4552F` | tindakan hapus |

**Tipografi:**

- **Fraunces** (serif lembut, opsz variabel) — judul, nama alur, nama tahap, judul isi. Dipakai dengan takaran.
- **Instrument Sans** — teks, UI, deskripsi, angka.

**Prinsip:**
- Latar kanvas bertekstur titik halus untuk kesan "papan".
- Elemen tanda tangan = peta cabang itu sendiri; sisanya dijaga tenang.
- Hindari tampilan default generik (cream + serif kontras tinggi + terracotta).

---

## 9. Persistensi Data

- Simpan otomatis setiap perubahan data (nama/tujuan/tahap/isi/deskripsi/urutan).
- Implementasi rujukan memakai penyimpanan key-value (`window.storage`) dengan satu kunci (`alurflow:data`) berisi seluruh larik `flows` sebagai JSON.
- Bila penyimpanan tidak tersedia, aplikasi tetap berjalan penuh dalam sesi (in-memory) dan menampilkan catatan halus bahwa perubahan belum tersimpan permanen. **Jangan** memakai `localStorage`/`sessionStorage` jika target lingkungannya melarang (mis. artifact); pada proyek mandiri, penyimpanan lokal/DB sesuai lingkungan dapat dipakai.
- Keadaan UI (tahap yang terlipat, posisi kamera) bersifat sementara dan tidak perlu disimpan (kecuali fitur "simpan tata letak" di bagian 13 diaktifkan).

---

## 10. Kebutuhan Non-Fungsional

- **Mobile-first.** Target utama layar sempit (~380px). Sasaran ketuk memadai (ikon ~34px, tombol ~40px). Modal tampil sebagai *bottom sheet* di mobile, terpusat di layar lebar.
- **Kinerja.** Mulus untuk ukuran wajar (puluhan tahap/isi). Ukur node dalam satu operasi batch untuk mengurangi reflow.
- **Aksesibilitas.** Fokus keyboard terlihat, label ARIA pada tombol ikon, hormati `prefers-reduced-motion` (matikan animasi kamera/transisi bila diminta).
- **Ketahanan.** Bungkus inisialisasi kanvas dengan penanganan galat agar kegagalan tidak mengosongkan layar.
- **Sanitasi.** Escape seluruh teks pengguna sebelum dimasukkan ke DOM.

---

## 11. Alur Pengguna Utama

1. **Buat & isi.** Dashboard → Buat alur (nama + tujuan) → tab Susun → tambah tahap berurutan → tambah isi di tiap tahap → ubah isi untuk menambah deskripsi.
2. **Lihat hasil.** Pindah ke tab Peta → geser/zoom → ketuk tahap untuk fokus pada rinciannya → baca deskripsi langsung di nodenya.
3. **Rapikan.** Reorder tahap di Susun; lipat tahap yang tak sedang ditinjau di Peta.

---

## 12. Kriteria Penerimaan

- [ ] Bisa membuat, mengubah, menghapus alur; semua tersimpan otomatis dan bertahan setelah dimuat ulang.
- [ ] Bisa menambah/mengubah/menghapus/mengurutkan tahap; menambah/mengubah/menghapus isi; menambah deskripsi via modal.
- [ ] Peta menampilkan rantai tahap horizontal berpanah dengan tahap awal (hijau) & tujuan (amber) ditandai.
- [ ] Tiap isi tampil sebagai node cabang; isi berdeskripsi memunculkan **node deskripsi terpisah** yang tersambung garis.
- [ ] Tinggi node deskripsi menyesuaikan panjang teks; baris tidak saling bertumpuk.
- [ ] Pan (seret/1 jari), zoom (gulir/cubit/tombol), dan pas-ke-layar berfungsi; zoom & fit beranimasi halus.
- [ ] Ketuk tahap membuka/menutup isi & deskripsinya dengan transisi; node lain tidak bergeser.
- [ ] "Lipat/Buka semua" berfungsi dan labelnya konsisten dengan keadaan.
- [ ] Peta bersifat baca-saja; tidak ada popup penyuntingan dari peta.
- [ ] Berfungsi baik di layar mobile sempit; kanvas tidak menggulung halaman saat digestur.

---

## 13. Di Luar Cakupan v1 / Pengembangan Berikutnya

Diurut dari yang paling berdampak:

1. **Geser posisi node bebas (drag) + simpan tata letak** — memungkinkan pengguna merapikan posisi tahap/isi secara manual dan menyimpannya.
2. **Percabangan non-linear** — satu tahap bercabang ke lebih dari satu kemungkinan lanjutan (bukan hanya satu jalur lurus).
3. **Ekspor peta jadi gambar (PNG/SVG)** untuk dibagikan.
4. **Opsi arah deskripsi** — di samping isi (default) atau di bawah isi.
5. **Warna/label/ikon** per tahap agar mudah dibedakan.
6. **Penanda tahap yang sedang berjalan** dan/atau catatan per tahap.

---

## 14. Catatan Implementasi

- **Rujukan.** Sudah ada implementasi berkas tunggal `alur.html` (vanilla HTML/CSS/JS) yang memuat seluruh perilaku di atas. Lampirkan berkas ini ke Claude Code sebagai acuan perilaku bila membangun ulang.
- **Rekomendasi stack (opsional).** Untuk proyek terstruktur: React + TypeScript. Kanvas dapat dibangun kustom (node absolut + lapisan SVG untuk garis, transform untuk pan/zoom) agar gaya visual tetap terkendali; ukur tinggi node lewat pengukuran DOM. Hindari sekadar memakai pustaka graf generik agar identitas visual tidak hilang.
- **State inti (rujukan).** `flows`, `view` (`dash`/`flow`), `currentId`, `tab` (`peta`/`susun`), `collapsed` (UI), `cam` (`x`, `y`, `scale`), serta status modal/editing.
- **Escape & keamanan.** Seluruh teks pengguna di-escape sebelum masuk DOM; jangan render HTML dari input.
