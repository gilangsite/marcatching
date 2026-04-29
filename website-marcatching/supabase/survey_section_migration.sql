-- ============================================================
-- Add 'section' column to survey_questions
-- Differentiates biodata questions from survey questions
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE survey_questions
  ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'survey';

-- 'biodata' = shown on landing page for collecting user info
-- 'survey'  = the actual survey questions (answered one by one)
