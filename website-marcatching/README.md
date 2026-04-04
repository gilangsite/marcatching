# Marcatching Website

Website berbasis Next.js (App Router) untuk landing page platform Marcatching, dilengkapi dengan admin dashboard (headless CMS sederhana) yang terhubung ke Supabase.

## Fitur Utama

1. **Landing Page Publik**: Menampilkan link CTA (ButtonCard) dan email kontak secara dinamis dari database.
2. **Admin Dashboard (`/admin`)**: Sistem CMS simpel untuk melakukan operasi CRUD (Create, Read, Update, Delete) pada list link dan informasi kontak.
3. **Authentication**: Halaman login (`/admin/login`) sederhana dengan proteksi server-side cookie (via Middleware).
4. **Desain Sistem**: UI clean & minimalis berbasis warna Navy (`#0d3369`) dan Putih, font DM Sans, lengkap dengan efek glassmorphism.

## Persiapan Environment

1. Buat project baru di [Supabase (Free Tier)](https://database.new)
2. Jalankan script SQL yang ada di `supabase/schema.sql` pada menu **SQL Editor** di Supabase untuk membuat tabel (`links` & `contact`) beserta data awalnya.
3. Duplikat file `.env.example` menjadi `.env.local`
4. Isi variabel di `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=marcatching2024
   ```

## Menjalankan secara Lokal

1. Install dependensi:
   ```bash
   npm install
   ```

2. Jalankan server development:
   ```bash
   npm run dev
   ```

3. Akses melalui browser:
   * **Landing Page**: http://localhost:3000
   * **Admin Login**: http://localhost:3000/admin/login
   * **Admin Dashboard**: http://localhost:3000/admin

## Deployment (Vercel)

Proyek ini sudah dikonfigurasi dan siap di-deploy langsung ke Vercel:

1. Push repository ke GitHub.
2. Buat proyek baru di Vercel dan hubungkan ke repository.
3. Tambahkan 4 Environment Variables di dashboard Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Deploy! Next.js App Router API Routes dan Middleware akan di-handle secara otomatis oleh Vercel.

## Tumpukan Teknologi
* Framework: Next.js 15 (App Router, Server Components, API Routes)
* Database & API: Supabase (PostgreSQL + PostgREST)
* Styling: Vanilla CSS (CSS Modules & Globals)
* Ikon: Lucide React
* Animasi: Framer Motion
* Font: DM Sans (Google Fonts)
