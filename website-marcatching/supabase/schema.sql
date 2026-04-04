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

-- Table: products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sub_headline text,
  description text,
  image_url text,
  price_before_discount integer default 0,
  price_after_discount integer default 0,
  discount_percentage integer default 0,
  features jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Table: vouchers
create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_value integer not null default 0,
  discount_type text not null default 'fixed', -- 'fixed' (Rp) or 'percentage' (%)
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Table: orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  product_name text not null,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  background text,
  referral_source text,
  voucher_code text,
  price_original integer default 0,
  price_discounted integer default 0,
  voucher_discount integer default 0,
  total_paid integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table links enable row level security;
alter table contact enable row level security;
alter table products enable row level security;
alter table vouchers enable row level security;
alter table orders enable row level security;

-- Allow public read access
create policy "Public read links" on links for select using (true);
create policy "Public read contact" on contact for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read vouchers" on vouchers for select using (true);

-- Allow public insert for orders (checkout)
create policy "Public insert orders" on orders for insert with check (true);

-- Allow all operations for authenticated users (admin)
create policy "Authenticated full access links" on links
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access contact" on contact
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access products" on products
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access vouchers" on vouchers
  for all using (auth.role() = 'authenticated');

create policy "Authenticated full access orders" on orders
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- Seed Data
-- ============================================================

insert into links (title, url, icon, status, order_index) values
  ('Official Website', null, 'Globe', 'coming_soon', 1),
  ('Instagram Marcatching', 'https://www.instagram.com/marcatching.id/', 'Instagram', 'active', 2),
  ('TikTok Marcatching', 'https://www.tiktok.com/@marcatching', 'Music2', 'active', 3)
on conflict do nothing;

insert into contact (email) values
  ('marcatching.id@gmail.com')
on conflict do nothing;
