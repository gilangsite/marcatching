-- ============================================================
-- Marcatching - Admin Auth Migration (v2 — includes RLS hardening)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Table: admin_credentials ─────────────────────────────────
create table if not exists admin_credentials (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  otp text,
  otp_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ── Table: admin_sessions ─────────────────────────────────────
-- Each successful OTP login creates a row here.
-- Middleware validates the cookie against this table on EVERY request.
-- Hard Exit deletes ALL rows → every device is kicked out immediately.
create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text not null unique,
  device_name text,
  browser text,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────
-- CRITICAL: Both tables must be completely locked down.
-- Only the service-role key (used by Next.js API routes) can read/write.
-- The anon key (used by browser-side Supabase clients) must be DENIED.

alter table admin_credentials enable row level security;
alter table admin_sessions enable row level security;

-- Drop any accidentally open policies first
drop policy if exists "Public read admin_credentials" on admin_credentials;
drop policy if exists "Public insert admin_credentials" on admin_credentials;
drop policy if exists "Public update admin_credentials" on admin_credentials;
drop policy if exists "Public delete admin_credentials" on admin_credentials;
drop policy if exists "Public read admin_sessions" on admin_sessions;
drop policy if exists "Public insert admin_sessions" on admin_sessions;
drop policy if exists "Public update admin_sessions" on admin_sessions;
drop policy if exists "Public delete admin_sessions" on admin_sessions;

-- NO policies = only service_role can access these tables.
-- The middleware and API routes use SUPABASE_SERVICE_ROLE_KEY, which
-- bypasses RLS entirely, so they will continue to work correctly.
-- The anon key (exposed in the browser) will be fully denied.

-- ── Index for fast session lookups ────────────────────────────
-- The middleware checks session_token on every admin page request.
create index if not exists idx_admin_sessions_token
  on admin_sessions (session_token);
