-- ============================================================
-- Member Landing Pages — Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- One landing page per course member, served at page.marcatching.com/<slug>.
-- Blocks (text, buttons, video, photos, carousels) live in a single jsonb array and are
-- re-validated by the API on every write and on every public read.
create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null,
  -- 'suspended' can only be set by an admin (service role); creators can only choose draft/published.
  status text not null default 'draft' check (status in ('draft', 'published', 'suspended')),
  theme text not null default 'black' check (theme in ('black', 'white')),
  headline text not null default '',
  description text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  -- Colors, fonts and the portrait background photo (copied from Brand Identity when the page is made).
  style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landing_pages_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 30)
);

-- The guarantee that two brands can never hold the same link, even if they save at the same moment.
create unique index if not exists landing_pages_slug_key on landing_pages (slug);

-- Photos uploaded to the public R2 bucket, tracked for the per-user storage quota and cleanup.
create table if not exists landing_page_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_key text not null unique,
  size_bytes integer not null check (size_bytes > 0),
  content_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_landing_page_assets_user on landing_page_assets(user_id, created_at);

-- Row Level Security ON with no policies: nothing is reachable with the public anon key.
-- All reads and writes go through the Next.js API routes using the service role.
alter table landing_pages enable row level security;
alter table landing_page_assets enable row level security;
