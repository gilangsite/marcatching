-- ============================================================
-- CHAMPAGNE / CAMPAIGN SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  theme        text NOT NULL DEFAULT 'black', -- 'black' | 'white'
  status       text NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  blocks       jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  CONSTRAINT campaigns_theme_check CHECK (theme IN ('black', 'white')),
  CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'published'))
);

-- Auto-update updated_at on campaign save
CREATE OR REPLACE FUNCTION update_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_campaign_updated_at();

-- RLS — allow anon read for published campaigns, admin full access
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published campaigns"
  ON campaigns FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "Service role full access campaigns"
  ON campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Verify table was created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'campaigns';
