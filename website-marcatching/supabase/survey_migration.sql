-- ============================================================
-- Marcatching - Survey System Tables
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: surveys
create table if not exists surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text, -- HTML from RichTextEditor
  image_url text,
  image_aspect_ratio text default '16:9',
  status text not null default 'active', -- 'active' | 'inactive'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Table: survey_questions
create table if not exists survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references surveys(id) on delete cascade,
  label text not null,
  type text not null default 'short_answer',
  -- 'short_answer' | 'long_answer' | 'dropdown' | 'checkbox' | 'radio' | 'rating'
  options jsonb default '[]'::jsonb, -- for dropdown, checkbox, radio
  is_required boolean default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table surveys enable row level security;
alter table survey_questions enable row level security;

-- Public read (needed to display survey page)
create policy "Public read surveys" on surveys for select using (true);
create policy "Public read survey_questions" on survey_questions for select using (true);

-- Admin write (protected at Next.js middleware layer)
create policy "Public insert surveys" on surveys for insert with check (true);
create policy "Public update surveys" on surveys for update using (true);
create policy "Public delete surveys" on surveys for delete using (true);

create policy "Public insert survey_questions" on survey_questions for insert with check (true);
create policy "Public update survey_questions" on survey_questions for update using (true);
create policy "Public delete survey_questions" on survey_questions for delete using (true);
