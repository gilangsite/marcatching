# Marcatching Affiliate Rollout

Program ini hanya untuk produk first-party Marcatching. Jangan mengaktifkan UI
affiliate di production sebelum migration selesai karena checkout baru selalu
menulis normalized `order_items`.

## 1. Environment

Tambahkan ke environment server (bukan `NEXT_PUBLIC_*`):

- `AFFILIATE_ATTRIBUTION_SECRET`: random secret minimal 24 karakter untuk HMAC cookie.
- `AFFILIATE_DATA_ENCRYPTION_KEY`: 32 byte dalam format 64 karakter hex atau base64.
- `FINANCE_APPS_SCRIPT_URL`: deployment Apps Script Finance.
- Pastikan `APPS_SCRIPT_PAYMENT_SECRET` sama dengan Script Property
  `PAYMENT_WEBHOOK_SECRET` pada Google Apps Script.

## 2. Database

Jalankan [`supabase/affiliate_migration.sql`](../supabase/affiliate_migration.sql)
melalui Supabase SQL Editor pada staging, lalu production. Migration mencakup
RLS, immutable commission versions, attribution, append-only ledger, settlement,
payout, post-payout refund adjustment, dispute, audit, dan RPC transaksional.

Migration telah diuji dua kali (idempotent) pada PostgreSQL lokal. Skenario yang
divalidasi: settlement, mark-paid, refund setelah payout, carry-forward debit,
dan refund sebelum transfer.

## 3. Google Apps Script

Deploy ulang [`google-apps-script.js`](../google-apps-script.js) sebagai Web App.
Handler `affiliatePayoutPaid` mengirim email ke affiliate, BCC admin, dan
melampirkan slip PDF. Verifikasi Script Property `PAYMENT_WEBHOOK_SECRET`.

## 4. Urutan aktivasi

1. Deploy migration dan environment secrets.
2. Deploy Google Apps Script.
3. Deploy aplikasi.
4. Login `inside.marcatching.com` → Affiliate → Settings.
5. Review draft S&K bersama penasihat hukum/pajak, kemudian publish.
6. Buat satu program internal dengan rate kecil dan akun test course.
7. Uji link → checkout sandbox → Midtrans notification → hold → settlement →
   payout → slip/email → dispute.
8. Uji refund sebelum dan sesudah payout sebelum membuka program ke member.

## 5. Operasional bulanan

- Tanggal 1: generate settlement periode sebelumnya.
- Tanggal 1–3: review banding; payout disputed tidak dapat ditandai paid.
- Maksimal tanggal 5/hari kerja berikutnya: transfer bank, isi referensi/bukti,
  lalu klik **Sudah transfer**.
- Saldo di bawah Rp50.000 tetap `available` dan otomatis terbawa.
- Jangan mengedit row ledger/commission secara manual. Gunakan status dan RPC
  agar slip lama serta audit trail tetap konsisten.
