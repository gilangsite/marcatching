# Midtrans Snap Implementation Plan — Marcatching

## 1. Goal

Integrasikan Midtrans **Snap Popup** ke checkout Marcatching dengan hasil berikut:

- Store, cart/add-on, voucher, admin dashboard, dan course tetap milik Marcatching.
- Midtrans hanya menangani pembayaran.
- Harga final selalu dihitung ulang di server Marcatching.
- Pembayaran dikonfirmasi otomatis melalui webhook Midtrans.
- Order berbayar otomatis mendapat akses course dan email akses, tanpa tombol manual `Sudah Bayar`.
- Payment Link dan Midtrans Core API tidak digunakan sebagai checkout utama.

## 2. Execution Rules

- Kerjakan setelah perubahan frontend dari Claude Code selesai.
- Pertahankan seluruh perubahan dan tampilan frontend terbaru. Jangan mengembalikan, menimpa, atau mendesain ulang pekerjaan yang sudah ada.
- Jangan menyentuh modul yang tidak berkaitan dengan commerce/payment.
- Jangan memasukkan Server Key ke client, source control, log, atau variabel `NEXT_PUBLIC_*`.
- Jangan mempercayai nama produk, harga, diskon, total, atau status pembayaran dari browser.
- Jangan menjadikan callback Snap di browser sebagai bukti pembayaran. Webhook tervalidasi adalah source of truth.
- Jangan deploy, menjalankan migration ke Supabase production, mengubah dashboard Midtrans, commit, atau push.
- Jangan menjalankan E2E, transaksi sandbox, browser testing, atau test suite tambahan. Setelah implementasi hanya jalankan `npm run build` satu kali. User akan melakukan semua testing manual.

## 3. Scope

### In scope

- Snap Popup pada checkout.
- Server-side cart and voucher calculation.
- Midtrans transaction creation.
- Midtrans webhook and payment-status mapping.
- Automatic course fulfillment after verified payment.
- Limited public order-status endpoint/page.
- Relevant Orders dashboard payment fields.
- Required commerce RLS hardening so price, voucher, order, and course access cannot be manipulated anonymously.
- Environment variable documentation and SQL migration file.

### Out of scope

- Payment Link checkout.
- Midtrans Core API/custom payment UI.
- Subscription, recurring payment, saved card, installment configuration, refund UI, or payout reconciliation.
- New voucher features such as expiry, quota, per-user limit, or minimum purchase.
- Redesign store, product detail, checkout, admin dashboard, or course UI.
- Refactor unrelated Supabase tables or admin modules.

## 4. Target Flow

1. Customer selects main product, optional add-ons, voucher, and enters customer data.
2. Browser sends only product IDs, voucher code, and customer data to `POST /api/checkout`.
3. Server loads active product rows and voucher from Supabase using the service-role client.
4. Server calculates product subtotal, add-on subtotal, eligible voucher discount, and final total.
5. Server creates a local order with immutable price snapshots and a unique Midtrans order ID.
6. For total above zero, server creates a Snap transaction and returns `snapToken`, local `orderId`, and public status token.
7. Browser opens `window.snap.pay(snapToken)`.
8. Midtrans sends status updates to `POST /api/payments/midtrans/notification`.
9. Webhook verifies signature, local order, and amount before updating payment status.
10. A verified paid order is marked confirmed, course access is upserted, and the course-access email is sent once.
11. Snap browser callbacks only navigate to the local status page; they never mark an order paid.

For a valid voucher that reduces the total to zero, skip Midtrans, confirm the order server-side, and run the same idempotent course-fulfillment function.

## 5. Environment Variables

Update `.env.example` only. Do not place real values in source files.

```env
MIDTRANS_SERVER_KEY=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
NEXT_PUBLIC_MIDTRANS_ENV=sandbox
```

Allowed values for `NEXT_PUBLIC_MIDTRANS_ENV` are `sandbox` and `production`. Use the same value on server and client to select the correct Midtrans host.

- Sandbox transaction endpoint: `https://app.sandbox.midtrans.com/snap/v1/transactions`
- Production transaction endpoint: `https://app.midtrans.com/snap/v1/transactions`
- Sandbox Snap.js: `https://app.sandbox.midtrans.com/snap/snap.js`
- Production Snap.js: `https://app.midtrans.com/snap/snap.js`

Server Key must be read only inside server-only code. Client Key is the only Midtrans key allowed in the browser.

## 6. Database Migration

Create `supabase/midtrans_payment_migration.sql`. Do not execute it.

Extend `orders` without removing existing fields:

- `midtrans_order_id text unique`
- `midtrans_transaction_id text`
- `payment_status text`
- `payment_type text`
- `fraud_status text`
- `snap_token text`
- `payment_redirect_url text`
- `paid_at timestamptz`
- `payment_updated_at timestamptz`
- `fulfillment_status text`
- `confirmation_sent_at timestamptz`
- `public_status_token uuid unique default gen_random_uuid()`

Use these payment states:

- `pending`
- `paid`
- `failed`
- `expired`
- `refunded`
- `creation_failed`
- `legacy_confirmed`

Keep the existing `orders.status` business field for compatibility:

- `pending` before verified payment.
- `confirmed` after verified paid/free order.

Backfill existing rows safely: existing `confirmed` orders become `legacy_confirmed`; other existing orders become `pending`.

Add indexes for `midtrans_order_id`, `payment_status`, and `public_status_token` where not already provided by a unique constraint.

### Required RLS changes

The migration must remove anonymous policies that currently allow reading/writing orders and vouchers or writing products and course access.

Final minimum policy behavior:

- `products`: anonymous read remains allowed; anonymous insert/update/delete is removed.
- `vouchers`: anonymous read/write is removed.
- `orders`: anonymous read/insert/update/delete is removed.
- `course_access_emails`: anonymous read/write is removed.
- Authenticated course users may select only rows whose normalized email equals the email in their JWT.
- All payment, admin-commerce, and fulfillment writes use the server-only service-role client.

Do not broaden this migration into unrelated RLS work.

## 7. Server Modules

### `lib/midtrans.ts`

Create a server-only helper using native `fetch` and `node:crypto`; do not add an SDK dependency.

Responsibilities:

- Validate required Midtrans environment variables.
- Select sandbox/production URLs.
- Create Basic Auth from `MIDTRANS_SERVER_KEY + ':'`.
- Create a Snap transaction.
- Verify webhook signature with SHA-512 over:
  `order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY`.
- Compare signatures safely.
- Normalize Midtrans payment status.
- Never log keys, Authorization headers, Snap tokens, or complete customer payloads.

### `lib/commerce.ts`

Create a server-only helper for shared commerce behavior:

- Normalize and deduplicate main/add-on product IDs.
- Load products by ID from Supabase.
- Reject missing, inactive, or coming-soon products.
- Ignore all browser-provided names and prices.
- Load and validate voucher server-side.
- Calculate immutable order snapshots.
- Fulfill a confirmed order idempotently.

Preserve current voucher semantics:

- Percentage discount applies independently to each eligible selected product.
- Fixed discount applies independently to each eligible selected product.
- Each product line is capped at zero; total can never be negative.
- `applicable_products = null` or empty means all selected products are eligible.
- Use `price_after_discount` as the payable base price.

Fulfillment must:

- Upsert `course_access_emails` for the main product and every add-on.
- Be safe when the same webhook is received more than once.
- Send the existing course-access email at most once.
- Set `fulfillment_status` and `confirmation_sent_at` only after their respective work succeeds.

### `lib/adminSession.ts`

Extract/reuse the existing admin-session validation as a server-only helper for commerce admin APIs. API authorization must read `marcatching_admin_session`, validate it against `admin_sessions`, and fail closed.

## 8. API Changes

### `POST /api/voucher/validate`

Replace the current request contract.

Accept only:

```json
{
  "code": "VOUCHER",
  "productIds": ["uuid"]
}
```

Server loads products and voucher, then returns a display preview:

- normalized code
- total discount
- per-product discount map
- eligible product count
- safe user-facing message

This preview is not authoritative for checkout; `/api/checkout` must calculate again.

### `POST /api/checkout`

Accept only:

```json
{
  "productId": "uuid",
  "addonIds": ["uuid"],
  "voucherCode": "optional",
  "fullName": "...",
  "email": "...",
  "whatsapp": "...",
  "background": "...",
  "referralSource": "..."
}
```

Requirements:

- Validate and normalize customer input.
- Recalculate everything through `lib/commerce.ts`.
- Generate a unique Midtrans order ID such as `MRC-{local-order-uuid}` and keep it under Midtrans's length limit.
- Save the local order before requesting a Snap token.
- Send `transaction_details`, sanitized `item_details`, and `customer_details` to Midtrans.
- Ensure the item sum exactly equals `gross_amount`.
- Represent the voucher as one negative item line while keeping local per-product discount details.
- Store the Snap token and redirect URL after creation.
- If transaction creation fails, set `payment_status = creation_failed` and return a safe error without leaking Midtrans credentials or raw response data.
- Return only `orderId`, `publicStatusToken`, `snapToken`, and an optional `redirectUrl`.
- For zero-total orders, do not call Midtrans; return a success response that directs the client to the local status page.
- Remove the current WhatsApp `Sudah Bayar` redirect and do not treat order submission as payment confirmation.

### `POST /api/payments/midtrans/notification`

This endpoint is public but accepts only validated Midtrans notifications.

Required sequence:

1. Parse only expected fields.
2. Verify signature before mutation.
3. Find the local order by exact `midtrans_order_id`.
4. Parse `gross_amount` safely and compare it to stored `total_paid`.
5. Reject mismatched order ID or amount.
6. Map status:
   - `settlement` -> `paid`
   - `capture` with `fraud_status = accept` -> `paid`
   - `pending` -> `pending`
   - `deny` or `cancel` -> `failed`
   - `expire` -> `expired`
   - `refund` or `partial_refund` -> `refunded`
7. Save transaction ID, payment type, fraud status, timestamps, and normalized payment status.
8. On first transition to `paid`, set business status to `confirmed` and call idempotent fulfillment.
9. Do not automatically revoke course access for refund in this MVP; show the refunded state in admin for manual handling.
10. Return a small JSON response. Duplicate notifications must not duplicate access or email.

### `GET /api/orders/[id]/status`

Return only a limited public status response after matching both local order ID and `publicStatusToken` query parameter:

- payment status
- business status
- amount
- product names
- paid timestamp

Never return email, phone, background, referral data, Snap token, Midtrans transaction payload, or internal credentials.

### Admin commerce APIs

Add the smallest protected API surface needed so the existing admin UI no longer writes `products`, `vouchers`, `orders`, or `course_access_emails` directly with the anonymous Supabase client.

Move these existing operations behind authenticated server routes:

- List/create/update/delete products.
- List/create/update/delete/toggle vouchers.
- List orders.
- Manual order confirmation/revert fallback, including existing course-access behavior.

Reuse current UI behavior and messages. Do not redesign the admin dashboard.

### Course access validation

Add a minimal server endpoint for pre-registration email eligibility. Update course registration to call it instead of anonymously selecting `course_access_emails`. After login, authenticated course pages may keep querying their own rows under the new email-based RLS policy.

## 9. Frontend Changes

### Checkout page

Modify the final post-Claude version of:

- `app/product/[slug]/checkout/page.tsx`
- `app/product/[slug]/checkout/checkout.module.css` only if needed

Required behavior:

- Preserve the current layout, fields, cart/add-on UX, voucher UX, copy, and visual style.
- Load the correct Snap.js URL using `next/script` and `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`.
- Add a narrow TypeScript declaration for `window.snap.pay`.
- Submit only the new `/api/checkout` request contract.
- Disable the submit button while creating the order/token.
- Open Snap Popup using the returned token.
- `onSuccess`, `onPending`, and `onError` navigate to the local status page with order ID and public status token.
- `onClose` keeps the order pending and shows a concise option to continue/retry; it must not create a duplicate order automatically.
- Remove the manual BCA account modal, copy-account logic, `Sudah Bayar` button, and WhatsApp payment-confirmation redirect.
- Client totals remain a preview only; display the server-returned/recorded status after submission.

Do not alter `app/store/StoreClient.tsx`, product-detail layout, or unrelated CSS unless required to support the new API request shape.

### Payment status page

Create a small local status page that:

- Reads order ID and public status token from the URL.
- Fetches the limited status API.
- Shows `Menunggu pembayaran`, `Pembayaran berhasil`, `Pembayaran gagal`, `Kedaluwarsa`, or `Refunded`.
- Polls briefly while status is pending, then offers a manual refresh.
- Links paid users to course login and other states back to checkout/store.
- Matches existing Marcatching visual language without a redesign project.

### Admin Orders tab

Keep the existing table and add only useful payment information:

- payment status
- payment method
- Midtrans order ID
- paid timestamp

Retain manual confirmation as an admin-only fallback. Make webhook-confirmed/refunded states visually distinguishable without redesigning the tab.

## 10. Type Updates

Update `lib/supabaseClient.ts` types to match the migration and API responses. Add a small declaration file for the exact Snap methods used; do not add broad `any` declarations across the app.

## 11. Error and Idempotency Rules

- Repeated checkout button presses must not silently create multiple transactions while the first request is in progress.
- Midtrans order IDs are unique and never reused for a different local order.
- Webhook retries are expected and safe.
- A browser callback cannot mark an order paid.
- An invalid/missing voucher never reduces price.
- Product/add-on names and prices stored on the order are server-created snapshots.
- A failed course email must not change a paid order back to unpaid.
- Errors returned to the browser are concise and contain no secrets or raw provider responses.

## 12. Files Expected to Change

Exact organization may vary slightly, but keep changes within this set unless a direct dependency requires otherwise:

- `.env.example`
- `supabase/midtrans_payment_migration.sql`
- `lib/midtrans.ts` (new)
- `lib/commerce.ts` (new)
- `lib/adminSession.ts` (new or equivalent)
- `lib/supabaseAdmin.ts`
- `lib/supabaseClient.ts`
- `types/midtrans.d.ts` (new or equivalent)
- `app/api/checkout/route.ts`
- `app/api/voucher/validate/route.ts`
- `app/api/payments/midtrans/notification/route.ts` (new)
- `app/api/orders/[id]/status/route.ts` (new)
- Minimal protected admin commerce API route files
- Minimal course-access validation API route
- `app/product/[slug]/checkout/page.tsx`
- `app/product/[slug]/checkout/checkout.module.css` only if required
- New payment-status page and its local style file
- `app/admin/page.tsx`
- `app/course/login/page.tsx`
- `README.md` only for environment/setup steps

Do not edit generated files or lockfiles because no new dependency is required.

## 13. Single Verification Command

After all implementation is complete, run exactly:

```bash
npm run build
```

Do not run any other tests. If build fails because of an unrelated/pre-existing user change, report the exact failure and do not rewrite unrelated code.

## 14. User Manual Testing Checklist — Do Not Execute

Leave these cases for the user:

- Static product without voucher.
- Percentage voucher.
- Fixed voucher.
- Invalid/inactive/ineligible voucher.
- Main product plus multiple add-ons.
- Voucher that reduces total to zero.
- Snap close before payment.
- Pending VA/QRIS payment.
- Successful settlement.
- Expired/failed payment.
- Duplicate webhook notification.
- Admin order visibility.
- Automatic course access and single email delivery.

## 15. Handoff Requirements

At completion, report only:

1. What was implemented.
2. Files changed.
3. Result of the single build command.
4. SQL migration file the user must run.
5. Environment variables the user must add.
6. Midtrans dashboard values the user must configure:
   - Payment Notification URL: `https://marcatching.com/api/payments/midtrans/notification`
   - Finish/Unfinish/Error URLs pointing to the Marcatching payment-status flow.
7. Any genuine blocker.

Do not provide speculative improvements or expand the scope after completing this plan.
