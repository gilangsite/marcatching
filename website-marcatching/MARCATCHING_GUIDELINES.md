# Marcatching — Developer Guidelines

> Dokumen ini wajib dibaca SEBELUM mengerjakan setiap task pada website Marcatching.
> Semua update harus sesuai dengan standar di bawah ini tanpa pengecualian.

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

- Setiap halaman atau tab baru **harus mendukung pemilihan tema**: Dark atau Light.
- Referensi implementasi tema: Tab **Champagne** di admin dashboard.
- Default tema untuk halaman publik: **Light** (putih-hitam).
- Default tema untuk dashboard admin: **Light** (putih-biru, lihat rule #6).

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

| Konteks | Tema |
|---|---|
| Dashboard Admin (`inside.marcatching.com`) | **Putih + Biru** (`#0d3369`, `#1e40af`) |
| Semua halaman publik (`marcatching.com`) | **Putih + Hitam** (`#111111`) |
| Survey, landing pages, artikel publik | **Putih + Hitam** (`#111111`) |

- Tidak boleh ada aksen biru pada halaman publik.
- Tidak boleh ada aksen hitam pada dashboard admin (kecuali teks body).

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

---

## Referensi Teknis

| Item | Nilai |
|---|---|
| Font utama | `DM Sans` via `--font` CSS variable |
| Warna admin | `#0d3369` (navy), `#1e40af` (blue) |
| Warna publik | `#111111` (black), `#ffffff` (white) |
| Apps Script URL | Lihat `.env.local` → `NEXT_PUBLIC_APPS_SCRIPT_URL` |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` |
| Drive Folder (umum) | `FOLDER_ID` di `google-apps-script.js` |
| Drive Folder (survey thumb) | `SURVEY_THUMBNAIL_FOLDER_ID` di `google-apps-script.js` |
| Icon library | Lucide React |
| Rich Text Editor | `RichTextEditor` component (sudah ada di project) |
