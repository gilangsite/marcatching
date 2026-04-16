-- Migration: E-Commerce Store Tables
-- Run this in the Supabase SQL Editor

-- 1. Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for product_categories" ON product_categories FOR ALL USING (true) WITH CHECK (true);

-- 2. Store Page Blocks (editable content above product grid)
CREATE TABLE IF NOT EXISTS store_page_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'headline' | 'text' | 'image' | 'video' | 'button'
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE store_page_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for store_page_blocks" ON store_page_blocks FOR ALL USING (true) WITH CHECK (true);

-- 3. Store Product Placements (controlled ordering + status)
CREATE TABLE IF NOT EXISTS store_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  order_index INTEGER DEFAULT 0,
  store_status TEXT DEFAULT 'active', -- 'active' | 'coming_soon' | 'hidden'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for store_products" ON store_products FOR ALL USING (true) WITH CHECK (true);

-- 4. Alter products: add category + checkout click counter
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS checkout_clicks INTEGER DEFAULT 0;

-- 5. RPC function to atomically increment checkout_clicks
CREATE OR REPLACE FUNCTION increment_checkout_clicks(product_id_arg UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE products SET checkout_clicks = checkout_clicks + 1 WHERE id = product_id_arg;
$$;

