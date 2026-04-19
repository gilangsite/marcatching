-- ============================================================
-- Migration: Add is_coming_soon to products
-- Purpose: Allows marking a product as "Coming Soon" globally from the Products tab.
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false;
