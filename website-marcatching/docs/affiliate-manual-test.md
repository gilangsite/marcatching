# Affiliate rollout and manual test

Dokumen ini adalah checklist staging untuk sistem affiliate produk Marcatching. Jangan langsung melakukan rollout pertama di production.

## Status verifikasi otomatis

- `npm run build`: lulus.
- ESLint pada file affiliate yang berubah: lulus.
- `node --check google-apps-script.js`: lulus.
- Migrasi `supabase/affiliate_migration.sql`: lulus pada PostgreSQL lokal yang bersih dan saat dijalankan ulang.
- Skenario SQL payout, refund sebelum payout, refund setelah payout, dan carry-forward: lulus.

Integrasi nyata Supabase, Midtrans, Google Apps Script, email, Google Sheets, dan browser tetap harus diuji di staging dengan checklist berikut.

## 1. Persiapan aman

1. Buat project/deployment staging dan gunakan Midtrans Sandbox.
2. Backup database sebelum menjalankan migrasi.
3. Gunakan Node.js 22 untuk build dan deployment.
4. Commit hanya file yang berhubungan dengan affiliate. Jangan gunakan `git add -A` karena worktree dapat berisi file lokal atau rahasia yang tidak terkait.
5. Jangan deploy aplikasi baru sebelum migrasi database selesai. Checkout baru menulis ke tabel `order_items` yang dibuat oleh migrasi.

## 2. Jalankan migrasi Supabase

1. Buka **Supabase Dashboard > SQL Editor** pada project staging.
2. Salin seluruh isi `supabase/affiliate_migration.sql`.
3. Jalankan sebagai satu script dan pastikan tidak ada error merah.
4. Verifikasi RLS:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and (tablename = 'order_items' or tablename like 'affiliate_%')
order by tablename;
```

Semua tabel yang ditampilkan harus memiliki `rowsecurity = true`.

5. Verifikasi fungsi inti:

```sql
select p.proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'publish_affiliate_program_version',
    'publish_affiliate_terms',
    'promote_mature_affiliate_commissions',
    'generate_affiliate_settlement',
    'mark_affiliate_payout_paid',
    'reverse_affiliate_commissions_for_order'
  )
order by p.proname;
```

Keenam fungsi harus tampil.

6. Verifikasi draft S&K:

```sql
select version, status, title
from affiliate_terms_versions
order by version;
```

Jangan mengubah data affiliate langsung dari Table Editor setelah live. Gunakan dashboard/RPC agar audit log, ledger, dan snapshot tetap konsisten.

## 3. Isi environment variables

Buat dua secret berbeda:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Isi environment staging:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `MIDTRANS_SERVER_KEY` — gunakan Sandbox Server Key.
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — gunakan Sandbox Client Key.
- `NEXT_PUBLIC_MIDTRANS_ENV=sandbox`
- `APPS_SCRIPT_PAYMENT_SECRET`
- `NEXT_PUBLIC_APPS_SCRIPT_URL`
- `FINANCE_APPS_SCRIPT_URL`
- `AFFILIATE_ATTRIBUTION_SECRET` — secret acak pertama.
- `AFFILIATE_DATA_ENCRYPTION_KEY` — secret acak kedua.

Simpan `AFFILIATE_DATA_ENCRYPTION_KEY` di password manager/secret manager. Mengganti atau kehilangan key ini membuat nomor rekening lama dan snapshot payout tidak dapat didekripsi. Mengganti `AFFILIATE_ATTRIBUTION_SECRET` membuat cookie affiliate aktif tidak lagi valid.

## 4. Deploy Google Apps Script

1. Buka project Google Apps Script Marcatching.
2. Ganti source dengan versi terbaru `google-apps-script.js`.
3. Buka **Project Settings > Script Properties**.
4. Tambahkan `PAYMENT_WEBHOOK_SECRET` dengan nilai yang sama persis seperti `APPS_SCRIPT_PAYMENT_SECRET`.
5. Pastikan spreadsheet target dan izin `MailApp` menggunakan akun operasional Marcatching.
6. Pilih **Deploy > New deployment > Web app**.
7. Jalankan sebagai pemilik script dan berikan akses yang diperlukan untuk endpoint webhook.
8. Selesaikan authorization prompt.
9. Salin URL berakhiran `/exec` ke `NEXT_PUBLIC_APPS_SCRIPT_URL`.
10. Jika fungsi finance berada di deployment yang sama, URL yang sama dapat dipakai untuk `FINANCE_APPS_SCRIPT_URL`. Jika terpisah, gunakan URL `/exec` deployment finance.
11. Setelah perubahan berikutnya, selalu buat deployment version baru; menyimpan source saja tidak memperbarui endpoint `/exec`.

## 5. Konfigurasi Midtrans Sandbox

1. Gunakan Client Key dan Server Key Sandbox pada staging.
2. Set Payment Notification URL ke:

```text
https://DOMAIN-STAGING/api/payments/midtrans/notification
```

3. Endpoint harus menggunakan HTTPS dan dapat diakses publik.
4. Jalankan satu transaksi Sandbox biasa sebelum pengujian affiliate untuk memastikan checkout lama tidak rusak.
5. Setelah seluruh staging test lulus, ulangi konfigurasi notification URL dan key pada environment Production.

## 6. Deploy aplikasi staging

1. Pastikan migrasi, environment variables, Google Apps Script, dan Midtrans Sandbox sudah siap.
2. Deploy branch affiliate ke staging dengan Node.js 22.
3. Buka `/course/affiliate`, halaman checkout, dan tab **Affiliate** di `inside.marcatching.com`.
4. Periksa deployment logs; tidak boleh ada missing environment variable, SQL error, atau response 500.

## 7. Data uji

Siapkan akun berikut:

- Admin Marcatching.
- KOL A yang memiliki produk/course uji.
- KOL B yang tidak memiliki produk/course uji.
- Buyer C dengan email berbeda dari KOL A dan KOL B.
- Opsional: KOL D untuk menguji last-click attribution.

Gunakan produk Sandbox yang aktif. Untuk mempercepat pengujian settlement, buat produk senilai minimal Rp500.000 dengan komisi 10% atau gunakan beberapa transaksi hingga komisi mencapai Rp50.000. Hold dapat dibuat `0 hari` khusus staging, lalu dikembalikan ke nilai operasional sebelum production.

## 8. Manual test cases

Catat hasil setiap kasus sebagai `PASS` atau `FAIL`, beserta screenshot dan ID order/payout.

### A. Akses admin dan keamanan dasar

1. Dalam kondisi logout, buka `/api/admin/affiliate`.
2. Expected: response `401`.
3. Login admin dan buka tab **Affiliate**.
4. Expected: data tampil tanpa error.
5. Login sebagai KOL A lalu coba membuka data payout KOL B melalui URL/API yang dimanipulasi.
6. Expected: ditolak; KOL hanya dapat melihat datanya sendiri.

### B. S&K dan consent

1. Sebelum S&K dipublikasikan, buka `/course/affiliate`.
2. Expected: aktivasi affiliate belum dapat diselesaikan.
3. Admin meninjau draft bersama penasihat legal/pajak, lalu publish versi 1.
4. KOL A menerima dan mengaktifkan affiliate.
5. Expected: versi consent, waktu, IP/user agent tersedia pada audit data.
6. Publish S&K versi 2.
7. Expected: KOL A diminta consent ulang dan aksi affiliate yang dilindungi tidak aktif sampai versi baru diterima.

### C. Program, kalkulator, dan eligibility

1. Admin memilih produk dari tab produk/e-commerce.
2. Buat program: komisi `10%`, cookie `30 hari`, hold `0 hari` untuk test, eligibility `owners_only`, minimum payout Rp50.000.
3. Uji kalkulator Rp100.000.
4. Expected: komisi Rp10.000.
5. Publish versi 1.
6. Expected: KOL A yang memiliki produk dapat join; KOL B tidak dapat join.

### D. Rate lock/versioning

1. Pastikan KOL A sudah join versi 1 dengan komisi 10%.
2. Admin publish versi 2 dengan komisi 5%.
3. Expected: enrollment/link KOL A tetap terkunci pada versi 1 dan 10%.
4. Affiliate eligible yang baru join setelah versi 2 menggunakan 5%.

### E. Link, cookie, dan fraud dasar

1. Salin link KOL A dan buka di Incognito.
2. Expected: diarahkan ke produk yang benar dan jumlah click bertambah satu.
3. Buka link KOL A lalu link KOL D pada browser yang sama.
4. Expected: link valid terakhir menjadi sumber atribusi.
5. Checkout tanpa pernah membuka affiliate link.
6. Expected: tidak ada komisi.
7. KOL A membeli menggunakan email affiliate-nya sendiri melalui link A.
8. Expected: self-purchase tidak menghasilkan komisi.
9. Pause program lalu buka link baru.
10. Expected: halaman produk masih dapat dibuka, tetapi tidak ada atribusi/cookie valid baru.
11. Suspend KOL A.
12. Expected: link affiliate A tidak dapat menghasilkan atribusi baru.

### F. Checkout dan pembayaran

1. Buyer C membuka link A, masuk ke checkout, lalu selesaikan pembayaran Sandbox.
2. Ulangi dengan voucher pada transaksi lain.
3. Expected:
   - order berubah menjadi paid;
   - `order_items` terisi;
   - atribusi tersimpan pada order/item;
   - komisi = harga final item setelah diskon/voucher dikali rate versi yang terkunci;
   - biaya Midtrans tidak mengurangi dasar komisi;
   - add-on tidak mendapat komisi kecuali memang merupakan produk affiliate yang tepat;
   - refresh/retry notification tidak membuat komisi ganda.

### G. Rekening payout dan snapshot

1. KOL A menyimpan rekening payout.
2. Expected: browser KOL hanya menampilkan empat digit terakhir.
3. Setelah payout dibuat, admin klik **Tampilkan rekening**.
4. Expected: nomor lengkap muncul hanya pada sesi admin dan audit log berisi `payout_account_revealed`.
5. KOL A mengganti rekening setelah payout dibuat.
6. Expected: payout lama tetap menampilkan snapshot rekening lama; payout baru memakai rekening terbaru.

### H. Hold dan minimum payout

1. Dengan hold `0 hari`, buka dashboard/admin atau generate settlement.
2. Expected: komisi matang berubah dari pending menjadi available.
3. Buat total available di bawah Rp50.000.
4. Expected: belum ada payout; saldo dibawa ke periode berikutnya.
5. Tambahkan transaksi hingga available minimal Rp50.000.
6. Expected: saldo dapat dimasukkan ke settlement.
7. Sebelum production, kembalikan hold ke kebijakan final, misalnya 14 hari.

### I. Settlement dan idempotency

1. Admin pilih periode yang mencakup `available_at`, lalu generate settlement.
2. Expected: statement berstatus issued dan payout terjadwal dibuat.
3. Jalankan generate lagi untuk periode yang sama.
4. Expected: tidak ada payout atau ledger entry ganda.
5. KOL melihat detail statement, komisi, adjustment, total transaksi, dan total diterima.

### J. Dispute

1. KOL mengajukan banding dari statement dalam 3 hari.
2. Expected: dispute tercatat dan admin menerima konteks statement.
3. Coba tandai payout sebagai paid saat dispute masih terbuka.
4. Expected: sistem menolak.
5. Admin selesaikan atau tolak dispute dengan catatan.
6. Expected: payout dapat diproses sesuai keputusan.

### K. Transfer manual, slip, email, dan finance sync

1. Admin menampilkan snapshot rekening dan melakukan simulasi transfer staging.
2. Isi reference/proof, lalu klik **Sudah transfer**.
3. Expected:
   - payout dan statement berstatus paid;
   - nilai dashboard tidak dihapus; histori dan ledger tetap tersimpan;
   - KOL menerima email dan PDF slip;
   - admin mendapat salinan/BCC sesuai konfigurasi;
   - finance sheet mendapat baris biaya/transfer;
   - PDF hanya dapat diakses oleh pemilik payout atau admin.
4. Jika email atau finance sync sengaja dibuat gagal, perbaiki konfigurasi lalu klik retry.
5. Expected: retry berhasil tanpa menciptakan payout ganda.

### L. Refund sebelum payout

1. Buat order paid baru dan generate settlement, tetapi jangan tandai paid.
2. Lakukan full refund melalui Midtrans Sandbox.
3. Expected:
   - komisi menjadi reversed;
   - payout direkalkulasi atau dibatalkan jika turun di bawah minimum;
   - transfer yang salah tidak dapat dilakukan;
   - notification retry tidak menggandakan reversal.

### M. Refund setelah payout

1. Buat order, settlement, dan tandai payout paid.
2. Lakukan full refund melalui Midtrans Sandbox.
3. Expected:
   - slip lama tetap menjadi histori paid;
   - adjustment negatif/carry-forward tercatat;
   - settlement berikutnya mengurangi adjustment tersebut dari komisi baru;
   - tidak ada data lama yang di-reset ke nol.

Aturan implementasi saat ini: event `partial_refund` membalik seluruh komisi item/order yang terdampak, bukan pro-rata. Gunakan full refund pada acceptance test. Jika bisnis ingin reversal pro-rata, itu perlu menjadi perubahan aturan dan implementasi terpisah sebelum memakai partial refund di production.

### N. Regression checkout non-affiliate

1. Checkout produk tanpa link affiliate.
2. Gunakan voucher, add-on, payment success, dan refresh success page seperti alur biasa.
3. Expected: order dan email pembelian normal; tidak ada komisi affiliate; tidak ada error baru.

## 9. Kriteria go-live

Production hanya boleh dilanjutkan jika semuanya terpenuhi:

- Build deployment sukses dengan Node.js 22.
- Tidak ada error SQL, GAS, Midtrans webhook, email, atau server 500.
- Checkout affiliate dan non-affiliate sama-sama lulus.
- Komisi mengikuti harga final dan rate version yang terkunci.
- Rate lama tidak berubah saat admin publish rate baru.
- Self-purchase, last-click, pause, dan suspend bekerja.
- Settlement idempotent dan nilai tidak pernah di-reset.
- Dispute memblokir payout yang belum selesai.
- Full refund sebelum dan sesudah payout menghasilkan ledger yang benar.
- Rekening lengkap hanya dapat dilihat admin, dengan snapshot dan audit log.
- Slip PDF, email, dan finance sync berhasil serta dapat di-retry.
- S&K telah direview manusia yang kompeten untuk legal dan pajak Indonesia.

Jika satu kasus keuangan, RLS, payout, atau refund gagal, hentikan rollout production sampai penyebabnya diperbaiki dan kasus terkait diuji ulang.
