-- ============================================================
-- Creator Workspace — Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Table: creator_workspaces
-- Stores each course member's Creator Revenue Workspace (Audience OS,
-- Revenue Thesis, Content IP, calendar, memory, experiments, metrics,
-- deliverables) as a single jsonb blob, one row per user.
create table if not exists creator_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_workspaces_user_id on creator_workspaces(user_id);

-- Enable Row Level Security
alter table creator_workspaces enable row level security;

-- Each user can only read/write/delete their own workspace row
create policy "User manage own workspace" on creator_workspaces
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
