-- ============================================================
-- Landing Pages — add page style (colors, fonts, background photo)
-- Run this in your Supabase SQL Editor if you already ran landing_pages_migration.sql
-- before the style feature. Safe to run more than once.
-- ============================================================

alter table landing_pages add column if not exists style jsonb not null default '{}'::jsonb;
