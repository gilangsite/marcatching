-- Midtrans Snap payment integration and commerce RLS hardening.
-- Create this migration in source control only. Run it manually in Supabase.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS midtrans_transaction_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fraud_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS snap_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_redirect_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_updated_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_status_token UUID DEFAULT gen_random_uuid();

UPDATE orders
SET payment_status = CASE
  WHEN status = 'confirmed' THEN 'legacy_confirmed'
  ELSE 'pending'
END
WHERE payment_status IS NULL;

UPDATE orders
SET fulfillment_status = CASE
  WHEN status = 'confirmed' THEN 'fulfilled'
  ELSE 'pending'
END
WHERE fulfillment_status IS NULL;

UPDATE orders
SET public_status_token = gen_random_uuid()
WHERE public_status_token IS NULL;

ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN payment_status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN fulfillment_status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN fulfillment_status SET NOT NULL;
ALTER TABLE orders ALTER COLUMN public_status_token SET DEFAULT gen_random_uuid();
ALTER TABLE orders ALTER COLUMN public_status_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_midtrans_order_id_key
  ON orders (midtrans_order_id)
  WHERE midtrans_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_public_status_token_key
  ON orders (public_status_token);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx
  ON orders (payment_status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'expired', 'refunded',
        'creation_failed', 'legacy_confirmed'
      ));
  END IF;
END $$;

-- Products stay publicly readable for the store, but commerce writes move server-side.
DROP POLICY IF EXISTS "Public insert products" ON products;
DROP POLICY IF EXISTS "Public update products" ON products;
DROP POLICY IF EXISTS "Public delete products" ON products;
DROP POLICY IF EXISTS "Authenticated full access products" ON products;

-- Voucher validation and all order operations move behind server routes.
DROP POLICY IF EXISTS "Public read vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public insert vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public update vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public delete vouchers" ON vouchers;
DROP POLICY IF EXISTS "Authenticated full access vouchers" ON vouchers;

DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Public update orders" ON orders;
DROP POLICY IF EXISTS "Public delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated full access orders" ON orders;

-- Course entitlements are written by the payment/admin backend. Members may
-- only read rows belonging to their authenticated email address.
DROP POLICY IF EXISTS "Public read course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Public insert course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Public update course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Public delete course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Authenticated full access course_access_emails" ON course_access_emails;
DROP POLICY IF EXISTS "Users read own course access" ON course_access_emails;

CREATE POLICY "Users read own course access"
ON course_access_emails
FOR SELECT
TO authenticated
USING (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
