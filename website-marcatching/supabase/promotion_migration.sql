-- ============================================================
-- PROMOTION SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- Suggested query name when saving: promotion_migration
-- ============================================================

CREATE TABLE IF NOT EXISTS promotions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline     text NOT NULL,
  description  text,
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'off', -- 'on_going' | 'off'
  ends_at      timestamptz, -- NULL = tanpa batas waktu, admin stop manual kapan saja
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promotions_status_check CHECK (status IN ('on_going', 'off'))
);

CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_product_id ON promotions(product_id);

CREATE OR REPLACE FUNCTION update_promotion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_promotions_updated_at ON promotions;
CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_promotion_updated_at();

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read on_going promotions"
  ON promotions FOR SELECT TO anon, authenticated
  USING (status = 'on_going');

CREATE POLICY "Service role full access promotions"
  ON promotions FOR ALL TO service_role USING (true) WITH CHECK (true);
