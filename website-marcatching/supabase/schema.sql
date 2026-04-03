-- ============================================================
-- Marcatching - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: links
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  icon text not null default 'Link',
  status text not null default 'active', -- 'active' | 'coming_soon'
  order_index integer not null default 0,
  created_at timestamptz not null default now(),

  -- New fields for Text, Button, and Carousel blocks
  type text not null default 'button',
  btn_color text,
  text_color text,
  text_size text,
  text_align text,
  text_bold boolean default false,
  text_italic boolean default false,
  carousel_aspect_ratio text,
  image_data jsonb default '[]'::jsonb
);

-- Table: contact
create table if not exists contact (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table links enable row level security;
alter table contact enable row level security;

-- Allow public read access
create policy "Public read links" on links for select using (true);
create policy "Public read contact" on contact for select using (true);

-- Allow all operations for authenticated users (admin)
create policy "Authenticated full access links" on links
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access contact" on contact
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- Seed Data
-- ============================================================

-- NOTE: If using anon key for admin writes, use the service_role key
-- OR temporarily disable RLS for initial seed:
-- alter table links disable row level security;
-- alter table contact disable row level security;

insert into links (title, url, icon, status, order_index) values
  ('Official Website', null, 'Globe', 'coming_soon', 1),
  ('Instagram Marcatching', 'https://www.instagram.com/marcatching.id/', 'Instagram', 'active', 2),
  ('TikTok Marcatching', 'https://www.tiktok.com/@marcatching', 'Music2', 'active', 3)
on conflict do nothing;

insert into contact (email) values
  ('marcatching.id@gmail.com')
on conflict do nothing;
