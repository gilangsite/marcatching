-- Migration: Create admin_sessions table to track device logins

CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token uuid NOT NULL UNIQUE,
  device_name text,
  browser text,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- Note: We don't necessarily need an admin_id because there's only one admin account,
-- but this table will allow us to track and invalidate active devices.
