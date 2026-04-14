-- ============================================================
-- Marcatching Analytics — Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: analytics_events
-- Stores page views and click events from the public website
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,            -- 'page_view' | 'click'
  page_path text,                      -- e.g. '/' or '/product/marketing-mastery'
  link_id uuid references links(id) on delete set null,
  link_title text,                     -- snapshot of link title at click time
  session_id text,                     -- random session fingerprint (no PII)
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Indexes for fast query performance
create index if not exists idx_analytics_created_at on analytics_events(created_at);
create index if not exists idx_analytics_event_type on analytics_events(event_type);
create index if not exists idx_analytics_link_id on analytics_events(link_id);
create index if not exists idx_analytics_session on analytics_events(session_id);

-- Composite index for common dashboard query pattern
create index if not exists idx_analytics_type_date on analytics_events(event_type, created_at);

-- Enable Row Level Security
alter table analytics_events enable row level security;

-- Public insert (tracking from website visitors)
create policy "Public insert analytics" on analytics_events
  for insert with check (true);

-- Public read (admin dashboard reads via anon key; admin auth is at Next.js layer)
create policy "Public read analytics" on analytics_events
  for select using (true);

-- Public delete (for potential data cleanup by admin)
create policy "Public delete analytics" on analytics_events
  for delete using (true);

-- ============================================================
-- Enable Realtime for this table
-- ============================================================
alter publication supabase_realtime add table analytics_events;
