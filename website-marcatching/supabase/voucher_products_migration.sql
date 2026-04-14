-- ============================================================
-- Migration: Add applicable_products to vouchers
-- Run this in your Supabase SQL Editor
-- ============================================================

-- NULL means the voucher applies to ALL products
-- An array of product UUIDs means it only applies to those products
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS applicable_products TEXT[] DEFAULT NULL;
