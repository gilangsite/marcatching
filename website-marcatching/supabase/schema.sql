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
  product_id uuid references products(id) on delete set null,
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
  addon_items jsonb default '[]'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Migration: Add addon_items to existing orders table (run if table already exists)
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS addon_items JSONB DEFAULT '[]'::jsonb;

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
create policy "Public read orders" on orders for select using (true);

-- Allow public insert for orders (checkout)
create policy "Public insert orders" on orders for insert with check (true);

-- Allow public write access for admin-managed tables
-- (Admin auth is handled via cookie-based auth at Next.js layer, not Supabase Auth)
create policy "Public insert links" on links for insert with check (true);
create policy "Public update links" on links for update using (true);
create policy "Public delete links" on links for delete using (true);

create policy "Public insert contact" on contact for insert with check (true);
create policy "Public update contact" on contact for update using (true);
create policy "Public delete contact" on contact for delete using (true);

create policy "Public insert products" on products for insert with check (true);
create policy "Public update products" on products for update using (true);
create policy "Public delete products" on products for delete using (true);

create policy "Public insert vouchers" on vouchers for insert with check (true);
create policy "Public update vouchers" on vouchers for update using (true);
create policy "Public delete vouchers" on vouchers for delete using (true);

create policy "Public update orders" on orders for update using (true);
create policy "Public delete orders" on orders for delete using (true);

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

-- ============================================================
-- E-Course System Tables
-- ============================================================

-- Table: course_materials
-- Stores materials (PDF or YouTube video) for each product/course
create table if not exists course_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  title text not null,
  type text not null default 'video', -- 'pdf' | 'video'
  content_url text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Table: course_enrollments
-- Tracks which users have access to which courses (created when order confirmed)
create table if not exists course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  email text not null,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- Table: learning_progress
-- Tracks which materials a user has marked as complete
create table if not exists learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  material_id uuid references course_materials(id) on delete cascade,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, material_id)
);

-- Table: course_access_emails
-- Tracks which email addresses have confirmed orders (for registration validation)
create table if not exists course_access_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_id uuid references products(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(email, product_id)
);

-- Enable Row Level Security
alter table course_materials enable row level security;
alter table course_enrollments enable row level security;
alter table learning_progress enable row level security;
alter table course_access_emails enable row level security;

-- course_materials: public read (any logged-in user via enrollment check in app)
create policy "Public read course_materials" on course_materials for select using (true);
create policy "Public insert course_materials" on course_materials for insert with check (true);
create policy "Public update course_materials" on course_materials for update using (true);
create policy "Public delete course_materials" on course_materials for delete using (true);

-- course_access_emails: public read (needed for registration validation)
create policy "Public read course_access_emails" on course_access_emails for select using (true);
create policy "Public insert course_access_emails" on course_access_emails for insert with check (true);
create policy "Public update course_access_emails" on course_access_emails for update using (true);
create policy "Public delete course_access_emails" on course_access_emails for delete using (true);

-- course_enrollments: users can read their own
create policy "User read own enrollments" on course_enrollments
  for select using (auth.uid() = user_id);

-- course_enrollments: public insert (for registration flow)
create policy "Public insert enrollments" on course_enrollments
  for insert with check (true);

-- learning_progress: users can read/insert/update their own
create policy "User manage own progress" on learning_progress
  for all using (auth.uid() = user_id);

-- ============================================================
-- About Page Configuration Table
-- ============================================================
create table if not exists about_config (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null default 'gilang@marcatching.com',
  cta_text text not null default 'Marcatching Store',
  cta_url text not null default '/store',
  founder_name text not null default 'Gilang Ramadhan',
  founder_photo_url text,
  founder_quote text,
  comparison_pros jsonb default '[]'::jsonb,
  comparison_cons jsonb default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ensure there is always exactly one row for configuration
insert into about_config (id, contact_email, cta_text, cta_url, founder_name, founder_quote, comparison_pros, comparison_cons)
values (
  '11111111-1111-1111-1111-111111111111', 
  'gilang@marcatching.com', 
  'Marcatching Store', 
  '/store', 
  'Gilang Ramadhan', 
  'Kesuksesan di era AI milik mereka yang mampu mensintesis raw data buatan mesin menjadi arah kreatif yang memiliki nyawa. Marketing bukan sekadar tentang barang apa yang kamu kemas, tapi sistem apa yang kamu desain untuk mengunci perhatian audiens secara elegan.',
  '["Mencari hasil bisnis jangka panjang", "Menginginkan sistem berbasis AI", "Ingin memposisikan brand dengan estetika premium", "Percaya pada data, bukan sekadar opini"]'::jsonb,
  '["Menginginkan jalan pintas atau hasil instan semalam", "Mencari trik kontroversi untuk viral", "Hanya peduli pada likes tanpa melihat impact ke revenue", "Malas beradaptasi dengan teknologi baru"]'::jsonb
) on conflict do nothing;

alter table about_config enable row level security;
create policy "Public read about_config" on about_config for select using (true);
create policy "Public update about_config" on about_config for update using (true);
