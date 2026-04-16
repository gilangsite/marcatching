-- Migration: Create nav_links table for managing navigation dropdown items
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS nav_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  icon TEXT DEFAULT 'Globe',
  text_color TEXT DEFAULT '#ffffff',
  btn_color TEXT DEFAULT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE nav_links ENABLE ROW LEVEL SECURITY;

-- Allow all operations (same pattern as other tables)
CREATE POLICY "Allow all for nav_links" ON nav_links FOR ALL USING (true) WITH CHECK (true);

-- Insert default nav items (Instagram + TikTok)
INSERT INTO nav_links (title, url, icon, text_color, order_index, is_active) VALUES
  ('Instagram', 'https://www.instagram.com/marcatching.id/', 'Instagram', '#ffffff', 1, true),
  ('TikTok', 'https://www.tiktok.com/@marcatching', 'Music2', '#ffffff', 2, true);
