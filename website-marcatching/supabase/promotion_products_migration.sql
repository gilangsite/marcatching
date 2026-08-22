-- ============================================================
-- PROMOTION PRODUCTS (multi-product promotions) MIGRATION
-- Run this in Supabase SQL Editor
-- Suggested query name when saving: promotion_products_migration
-- ============================================================

CREATE TABLE IF NOT EXISTS promotion_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id  uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_index   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (promotion_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_promotion_products_promotion ON promotion_products(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_products_product ON promotion_products(product_id);

-- product_id on promotions was NOT NULL; new promotions store their products in the
-- join table instead, so relax this rather than a destructive column drop.
ALTER TABLE promotions ALTER COLUMN product_id DROP NOT NULL;

-- Carry existing single-product promotions into the join table so nothing is lost.
INSERT INTO promotion_products (promotion_id, product_id, order_index)
SELECT id, product_id, 0 FROM promotions WHERE product_id IS NOT NULL
ON CONFLICT (promotion_id, product_id) DO NOTHING;

ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read promotion_products for on_going promotions"
  ON promotion_products FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM promotions p WHERE p.id = promotion_products.promotion_id AND p.status = 'on_going'));

CREATE POLICY "Service role full access promotion_products"
  ON promotion_products FOR ALL TO service_role USING (true) WITH CHECK (true);
