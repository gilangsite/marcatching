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
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=marcatching2024
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   NEXT_PUBLIC_MIDTRANS_ENV=sandbox
   ```

5. Untuk payment, jalankan `supabase/midtrans_payment_migration.sql` secara manual melalui Supabase SQL Editor setelah melakukan review.

## Konfigurasi Midtrans

- Gunakan `NEXT_PUBLIC_MIDTRANS_ENV=sandbox` untuk Sandbox dan `production` saat go-live.
- Server Key hanya boleh disimpan sebagai `MIDTRANS_SERVER_KEY` di environment server.
- Payment Notification URL: `https://www.marcatching.com/api/payments/midtrans/notification`
- Finish, Unfinish, dan Error URL: `https://www.marcatching.com/payment/status`
- Checkout menggunakan Snap Popup. Status paid hanya berasal dari webhook Midtrans yang signature dan nominalnya valid.
- Google Apps Script mencatat checkout pending. Setelah webhook memverifikasi pembayaran, action `paymentPaid` mengirim receipt `Pembelian Berhasil` ke pembeli dan email `Pembelian Baru` ke admin, masing-masing satu kali. Email aktivasi course tetap dikirim terpisah. Setelah mengubah `google-apps-script.js`, deploy versi baru pada Web App Apps Script yang sama.

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
3. Tambahkan Environment Variables berikut di dashboard Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `MIDTRANS_SERVER_KEY`
   - `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
   - `NEXT_PUBLIC_MIDTRANS_ENV`
4. Deploy! Next.js App Router API Routes dan Middleware akan di-handle secara otomatis oleh Vercel.

## Tumpukan Teknologi
* Framework: Next.js 15 (App Router, Server Components, API Routes)
* Database & API: Supabase (PostgreSQL + PostgREST)
* Styling: Vanilla CSS (CSS Modules & Globals)
* Ikon: Lucide React
* Animasi: Framer Motion
* Font: DM Sans (Google Fonts)
