# Marcatching — Developer Guidelines

> Dokumen ini wajib dibaca SEBELUM mengerjakan setiap task pada website Marcatching.
> Semua update harus sesuai dengan standar di bawah ini tanpa pengecualian.
>
> Referensi teknis lebih detail (token warna lengkap, code pattern, postmortem bug):
> lihat `docs/frontend-implementation-guidelines.md`.

---

## 1. Upload / Insert Foto

- **Wajib drag & drop** support pada setiap input gambar.
- **Wajib ada popup crop/preview** sebelum gambar di-set (fit-to-screen crop modal).
- Format file yang didukung: JPEG, PNG, WebP.
- Gunakan fungsi `uploadImage` atau `uploadSurveyThumbnail` via Google Apps Script sesuai konteks.

---

## 2. Konfigurasi Text / Rich Text Editor

- Setiap field **deskripsi** wajib menggunakan **Rich Text Editor** standar yang sudah dibuat (lihat `RichTextEditor` component).
- Fitur wajib yang harus tersedia pada setiap editor deskripsi/artikel:
  - Bold, Italic
  - Font size
  - Text color
  - Text alignment (left, center, right, justify)
- Untuk field plain text (label, judul pendek) cukup `<input>` biasa.

---

## 3. Color Theme (Dark / Light)

> **Update 2026-08-11**: rule ini sebelumnya salah (bilang admin & semua halaman publik = Light). Sudah dikoreksi sesuai rebrand "MARCATCHING OS" yang berjalan sekarang. Lihat rule #6 untuk tabel per-route yang benar sebelum mengerjakan styling apa pun.

- Setiap halaman atau tab baru **mengikuti tema route induknya** (lihat tabel #6) — jangan asumsikan default tanpa cek dulu.
- Referensi implementasi tema dark admin: `app/admin/admin.module.css`, section `MARCATCHING OS — brand alignment layer`.
- Referensi implementasi tema light storefront: `app/store/store.module.css`, `app/product/[slug]/product.module.css`, `app/product/[slug]/checkout/checkout.module.css`.
- **Sebelum membuat elemen baru (button/badge/card), selalu cek background aktual di context tempat elemen itu dirender** — jangan asumsikan dari nama variabel atau dari kode di file lain. Pasangan background+text harus diverifikasi bersama, tidak terpisah. Kasus nyata yang pernah terjadi: teks near-white ketimpa di atas card yang backgroundnya ternyata masih putih/pucat karena tidak ke-cover oleh rule dark theme → teks invisible.
- **Raw SVG (`fill=`/`stroke=` sebagai attribute, bukan lewat CSS class/style)** — misalnya chart custom, donut chart, dsb — TIDAK otomatis ikut tema. Warna SVG harus di-set eksplisit sesuai tema route tersebut, dicek manual satu per satu.
- **Jangan bikin dua rounded-box bersarang** (card di dalam card). Kalau butuh pemisah visual dalam satu card, pakai `border-top`/`border-bottom` divider tipis, bukan card kedua dengan radius+shadow sendiri.

---

## 4. Font

- **Font wajib**: `DM Sans` — sudah di-set sebagai `--font: 'DM Sans', sans-serif` di `globals.css`.
- Dalam inline style gunakan: `fontFamily: 'DM Sans, system-ui, sans-serif'` atau `var(--font)`.
- **Jangan gunakan** font lain (Inter, Roboto, dll) kecuali ada permintaan eksplisit.
- Import Google Fonts sudah ada di `globals.css` — tidak perlu import ulang per-komponen.

---

## 5. Git — Push & Commit Rules

- **Hanya push file dalam folder `website-marcatching`**.
- Jangan pernah `git add -A` atau `git add .` dari root `Marcatching/` karena akan menyertakan file besar (PDF, video, dll) di luar folder website.
- Cara yang benar untuk add & push:
  ```bash
  # Dari dalam /website-marcatching:
  git add "path/ke/file.tsx" "path/ke/file2.ts"
  git commit -m "feat/fix: deskripsi singkat perubahan"
  git -C /Users/mac/Documents/Marcatching push origin main
  ```
- Selalu commit dengan pesan deskriptif menggunakan prefix: `feat:`, `fix:`, `style:`, `refactor:`.

---

## 6. Color Scheme

> Dikoreksi 2026-08-11 — tabel lama sudah tidak sesuai dengan rebrand dark "MARCATCHING OS". Cek route dulu sebelum styling.

| Konteks | Tema | Catatan |
|---|---|---|
| Dashboard Admin (`inside.marcatching.com`, semua tab) | **Dark** | Navy/near-black bg, accent biru muda `#8cc6ff` |
| Homepage, artikel, `/course`, `/{campaign-slug}`, `/survey/{slug}`, `/prompt-library`, legal pages | **Dark** | Sama dengan admin, bg `#030508`/`#080d13` |
| `/store`, `/product/{slug}`, `/product/{slug}/checkout` | **Light** | Sengaja dikembalikan ke light per keputusan user (2026-08-11) — bg putih, text navy/hitam untuk kontras |

**Token warna Dark theme** (admin + halaman publik dark):
| Peran | Warna |
|---|---|
| Background utama | `#030508` |
| Raised surface / card | `rgba(8, 13, 19, 0.88)` |
| Border/divider | `rgba(184, 214, 242, 0.13)` |
| Text utama | `#f3f7fb` |
| Text muted/secondary | `#8e9baa` |
| Accent / primary action bg | `#8cc6ff` (pasangkan dengan text **dark ink** `#06101a`, BUKAN putih) |
| Success | `#9de0c1` (bg tint `rgba(157,224,193,0.16)`) |
| Warning/pending | `#ffd58f` / `#e6c889` (bg tint senada, opacity ~0.1–0.18) |
| Error/danger | `#ffaaaa` (bg tint `rgba(255,170,170,0.1)`) |

**Token warna Light theme** (store/product/checkout):
| Peran | Warna |
|---|---|
| Background utama | `#ffffff` |
| Text utama / highlight | `#0d3369` (navy) |
| Text muted/secondary | `#64748b` / `#94a3b8` |
| Border | `#e2e8f0` / `#f1f5f9` |
| Badge diskon (%) | bg `#dc2626` (merah), text `#ffffff` |
| Badge hemat/savings | bg hijau muda + text hijau gelap terbaca (`#166534`), BUKAN text hijau pucat di atas bg nyaris transparan |
| Primary button | bg `#0d3369`, text `#ffffff` |

- Tidak boleh ada aksen biru terang khas admin (`#8cc6ff`) muncul di storefront light — storefront pakai navy solid.
- Kalau bikin badge/pill dengan tint warna (hijau/merah/kuning), SELALU pasangkan bg-tint dan text-nya sekaligus dalam satu keputusan desain, jangan copy salah satu dari tempat lain tanpa cek pasangannya.

---

## 7. Ikon vs Emoji

- **Emoji / emoticon DILARANG** di seluruh website Marcatching.
- Ganti semua emoji dengan ikon dari **Lucide React** (`import { IconName } from 'lucide-react'`).
- Untuk ikon yang tidak ada di Lucide, cari alternatif di library yang sama — jangan gunakan emoji sebagai fallback.

---

## 8. Push ke GitHub

- **Setiap update yang diminta user harus selalu diakhiri dengan commit + push ke GitHub**.
- Tidak perlu menunggu konfirmasi dari user — langsung push setelah perubahan selesai.
- Vercel akan auto-deploy setelah push ke branch `main`.
- Update `NEXT_PUBLIC_APPS_SCRIPT_URL` di Vercel Dashboard jika ada perubahan deployment Google Apps Script.
- Sebelum push, cek bug yang terlihat cuma karena localhost (cache/hot-reload stale, dev server restart) vs bug beneran di kode. Kalau cuma localhost artifact, boleh push langsung. Kalau bug beneran di kode, fix dulu baru push.

---

## 9. Dropdown / Select Custom

- **Jangan pakai `<select>` bawaan browser** untuk pilihan custom (background, sumber referral, kategori, dsb) — device default terlihat tidak konsisten dengan desain.
- Pakai pola dropdown custom: tombol trigger (label + chevron yang rotate saat open) + panel hasil klik, bukan native `<select>`.
- Referensi implementasi yang sudah benar: `CustomSelect` component di `app/product/[slug]/checkout/page.tsx` dan pola `addonDropdownTrigger`/`addonDropdownPanel` di file yang sama.
- **Panel dropdown WAJIB di-render lewat React Portal (`createPortal` ke `document.body`) dengan `position: fixed`**, posisi dihitung dari `getBoundingClientRect()` trigger-nya — JANGAN `position: absolute` relatif ke parent yang berada di dalam container `overflow: auto/scroll`. Kalau dropdown dekat bagian bawah container yang scrollable, `position: absolute` bisa ke-clip dan usernya tidak bisa scroll untuk melihat opsi yang terpotong (bug yang pernah kejadian). Portal + fixed positioning menghindari masalah ini sepenuhnya, dan otomatis buka ke atas kalau ruang di bawah kurang.
- Tutup dropdown saat klik di luar (`mousedown` listener + ref check), dan reposisi/tutup saat scroll/resize selagi terbuka.

## 10. CSS Specificity — Jangan Bikin Rule yang Diam-Diam Kalah

`app/admin/admin.module.css` punya rule global `.page :where(div, span, button, ...) { color: #ffffff !important }` untuk memastikan semua teks default putih di dark theme. `:where()` punya specificity 0 secara desain, tapi kalau prefix-nya (`.page`) sama, dan rule override kamu TIDAK punya prefix `.page` juga, rule override kamu akan kalah specificity-nya (pernah kejadian: 159 selector kehilangan warna aslinya dan jatuh balik ke putih polos, karena lupa prefix `.page`). 

**Aturan wajib**: setiap kali menambah rule warna baru di `admin.module.css` yang harus menang dari catch-all itu, pastikan selector-nya diawali `.page ` (atau specificity setara/lebih tinggi). Setelah menambah/ubah rule warna, cek dengan grep apakah ada selector serupa di file yang sama tanpa prefix `.page` sebelum menganggap selesai.

---

## Referensi Teknis

| Item | Nilai |
|---|---|
| Font utama | `DM Sans` via `--font` CSS variable |
| Warna dashboard admin + halaman publik dark | lihat tabel token di rule #6 |
| Warna storefront light (`/store`, `/product`, checkout) | lihat tabel token di rule #6 |
| Apps Script URL | Lihat `.env.local` → `NEXT_PUBLIC_APPS_SCRIPT_URL` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| Drive Folder (umum) | `FOLDER_ID` di `google-apps-script.js` |
| Drive Folder (survey thumb) | `SURVEY_THUMBNAIL_FOLDER_ID` di `google-apps-script.js` |
| Icon library | Lucide React |
| Rich Text Editor | `RichTextEditor` component (sudah ada di project) |
| Custom dropdown | `CustomSelect` pattern — lihat rule #9 |
