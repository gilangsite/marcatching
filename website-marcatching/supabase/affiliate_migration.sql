-- Marcatching first-party affiliate program.
-- Source of truth: Supabase/Postgres. Google Sheets is reporting-only.
-- Create this migration in source control; run it manually after review.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Terms, members, and payout identity
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS affiliate_terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL UNIQUE CHECK (version > 0),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'retired')),
  effective_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_terms_one_published_idx
  ON affiliate_terms_versions ((status)) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS affiliate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  affiliate_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'closed')),
  accepted_terms_id UUID REFERENCES affiliate_terms_versions(id) ON DELETE RESTRICT,
  accepted_terms_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_members_user_id_idx ON affiliate_members (user_id);
CREATE INDEX IF NOT EXISTS affiliate_members_status_created_idx ON affiliate_members (status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_members_email_idx ON affiliate_members (LOWER(email));

CREATE TABLE IF NOT EXISTS affiliate_payout_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID NOT NULL UNIQUE REFERENCES affiliate_members(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL CHECK (char_length(account_number_last4) BETWEEN 2 AND 4),
  tax_id_encrypted TEXT,
  tax_id_last4 TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_payout_accounts_member_idx
  ON affiliate_payout_accounts (affiliate_member_id);

-- ---------------------------------------------------------------------------
-- Product programs and immutable commission versions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  eligibility_type TEXT NOT NULL DEFAULT 'owners_only'
    CHECK (eligibility_type IN ('owners_only', 'all_members')),
  attribution_model TEXT NOT NULL DEFAULT 'last_click'
    CHECK (attribution_model IN ('last_click')),
  attribution_window_days INTEGER NOT NULL DEFAULT 30
    CHECK (attribution_window_days BETWEEN 1 AND 90),
  holding_days INTEGER NOT NULL DEFAULT 14
    CHECK (holding_days BETWEEN 0 AND 90),
  promotional_brief TEXT,
  approved_copy TEXT,
  asset_url TEXT,
  restrictions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_programs_status_created_idx
  ON affiliate_programs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_programs_product_id_idx ON affiliate_programs (product_id);

CREATE TABLE IF NOT EXISTS affiliate_program_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  commission_bps INTEGER NOT NULL CHECK (commission_bps BETWEEN 0 AND 10000),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'retired')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, version_number),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS affiliate_program_versions_program_status_idx
  ON affiliate_program_versions (program_id, status, starts_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_program_versions_active_window_idx
  ON affiliate_program_versions (starts_at, ends_at) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS affiliate_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE CASCADE,
  program_version_id UUID NOT NULL REFERENCES affiliate_program_versions(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'ended')),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (affiliate_member_id, program_version_id)
);

CREATE INDEX IF NOT EXISTS affiliate_enrollments_member_status_idx
  ON affiliate_enrollments (affiliate_member_id, status, accepted_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_enrollments_program_idx ON affiliate_enrollments (program_id);
CREATE INDEX IF NOT EXISTS affiliate_enrollments_version_idx ON affiliate_enrollments (program_version_id);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (affiliate_member_id, program_id)
);

CREATE INDEX IF NOT EXISTS affiliate_links_member_active_idx
  ON affiliate_links (affiliate_member_id, is_active);
CREATE INDEX IF NOT EXISTS affiliate_links_program_idx ON affiliate_links (program_id);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE RESTRICT,
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE RESTRICT,
  program_version_id UUID NOT NULL REFERENCES affiliate_program_versions(id) ON DELETE RESTRICT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  referrer TEXT,
  landing_path TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT TRUE,
  invalid_reason TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_clicks_link_time_idx
  ON affiliate_clicks (affiliate_link_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_member_time_idx
  ON affiliate_clicks (affiliate_member_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_program_time_idx
  ON affiliate_clicks (program_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_valid_time_idx
  ON affiliate_clicks (clicked_at DESC) WHERE is_valid = TRUE;

-- ---------------------------------------------------------------------------
-- Normalized commerce snapshots and attribution
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  line_position INTEGER NOT NULL CHECK (line_position >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_rupiah BIGINT NOT NULL CHECK (unit_price_rupiah >= 0),
  voucher_discount_rupiah BIGINT NOT NULL DEFAULT 0 CHECK (voucher_discount_rupiah >= 0),
  final_amount_rupiah BIGINT NOT NULL CHECK (final_amount_rupiah >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, line_position)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items (product_id);

CREATE TABLE IF NOT EXISTS affiliate_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  click_id UUID NOT NULL REFERENCES affiliate_clicks(click_id) ON DELETE RESTRICT,
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE RESTRICT,
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE RESTRICT,
  program_version_id UUID NOT NULL REFERENCES affiliate_program_versions(id) ON DELETE RESTRICT,
  commission_bps INTEGER NOT NULL CHECK (commission_bps BETWEEN 0 AND 10000),
  holding_days INTEGER NOT NULL CHECK (holding_days BETWEEN 0 AND 90),
  attribution_window_days INTEGER NOT NULL CHECK (attribution_window_days BETWEEN 1 AND 90),
  status TEXT NOT NULL DEFAULT 'valid'
    CHECK (status IN ('valid', 'invalid')),
  invalid_reason TEXT,
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_attributions_order_id_idx ON affiliate_attributions (order_id);
CREATE INDEX IF NOT EXISTS affiliate_attributions_member_time_idx
  ON affiliate_attributions (affiliate_member_id, attributed_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_attributions_program_idx ON affiliate_attributions (program_id);

-- ---------------------------------------------------------------------------
-- Settlement, commission, immutable ledger, payout, and disputes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS affiliate_settlement_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'issued', 'processing', 'completed', 'cancelled')),
  issued_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (period_start, period_end),
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS affiliate_settlement_cycles_status_period_idx
  ON affiliate_settlement_cycles (status, period_end DESC);

CREATE TABLE IF NOT EXISTS affiliate_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_cycle_id UUID NOT NULL REFERENCES affiliate_settlement_cycles(id) ON DELETE RESTRICT,
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'issued', 'disputed', 'approved', 'paid', 'cancelled')),
  attributed_revenue_rupiah BIGINT NOT NULL DEFAULT 0,
  gross_commission_rupiah BIGINT NOT NULL DEFAULT 0,
  reversal_rupiah BIGINT NOT NULL DEFAULT 0,
  adjustment_rupiah BIGINT NOT NULL DEFAULT 0,
  tax_withheld_rupiah BIGINT NOT NULL DEFAULT 0,
  transfer_fee_rupiah BIGINT NOT NULL DEFAULT 0,
  net_payout_rupiah BIGINT NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (settlement_cycle_id, affiliate_member_id)
);

CREATE INDEX IF NOT EXISTS affiliate_statements_member_status_idx
  ON affiliate_statements (affiliate_member_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_statements_cycle_idx ON affiliate_statements (settlement_cycle_id);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID NOT NULL UNIQUE REFERENCES affiliate_statements(id) ON DELETE RESTRICT,
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'processing', 'paid', 'failed', 'cancelled')),
  amount_rupiah BIGINT NOT NULL CHECK (amount_rupiah >= 0),
  bank_name TEXT,
  account_name TEXT,
  account_number_last4 TEXT,
  transfer_reference TEXT,
  proof_url TEXT,
  finance_exported_at TIMESTAMPTZ,
  failure_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_payouts_member_status_idx
  ON affiliate_payouts (affiliate_member_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_payouts_status_created_idx
  ON affiliate_payouts (status, created_at DESC);

-- Immutable encrypted bank snapshot used by admin when executing this payout.
-- It is intentionally excluded from member-facing grants and DTOs.
CREATE TABLE IF NOT EXISTS affiliate_payout_account_snapshots (
  payout_id UUID PRIMARY KEY REFERENCES affiliate_payouts(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL,
  tax_id_encrypted TEXT,
  tax_id_last4 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribution_id UUID NOT NULL UNIQUE REFERENCES affiliate_attributions(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE RESTRICT,
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE RESTRICT,
  program_version_id UUID NOT NULL REFERENCES affiliate_program_versions(id) ON DELETE RESTRICT,
  statement_id UUID REFERENCES affiliate_statements(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'available', 'allocated', 'paid', 'held', 'reversed')),
  commissionable_amount_rupiah BIGINT NOT NULL CHECK (commissionable_amount_rupiah >= 0),
  commission_bps INTEGER NOT NULL CHECK (commission_bps BETWEEN 0 AND 10000),
  commission_amount_rupiah BIGINT NOT NULL CHECK (commission_amount_rupiah >= 0),
  available_at TIMESTAMPTZ NOT NULL,
  hold_reason TEXT,
  reversal_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_commissions_member_status_idx
  ON affiliate_commissions (affiliate_member_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_commissions_status_available_idx
  ON affiliate_commissions (status, available_at);
CREATE INDEX IF NOT EXISTS affiliate_commissions_order_id_idx ON affiliate_commissions (order_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_program_idx ON affiliate_commissions (program_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_statement_idx ON affiliate_commissions (statement_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_pending_maturity_idx
  ON affiliate_commissions (available_at) WHERE status = 'pending';

-- Signed carry-forward items. A refund after a payout creates a negative
-- adjustment instead of rewriting a historical paid statement.
CREATE TABLE IF NOT EXISTS affiliate_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  source_commission_id UUID REFERENCES affiliate_commissions(id) ON DELETE RESTRICT,
  statement_id UUID REFERENCES affiliate_statements(id) ON DELETE SET NULL,
  adjustment_type TEXT NOT NULL
    CHECK (adjustment_type IN ('post_payout_refund', 'manual_credit', 'manual_debit')),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'allocated', 'applied', 'cancelled')),
  amount_rupiah BIGINT NOT NULL CHECK (amount_rupiah <> 0),
  reason TEXT NOT NULL,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_commission_id, adjustment_type)
);

CREATE INDEX IF NOT EXISTS affiliate_adjustments_member_status_idx
  ON affiliate_adjustments (affiliate_member_id, status, available_at);
CREATE INDEX IF NOT EXISTS affiliate_adjustments_statement_idx
  ON affiliate_adjustments (statement_id);

CREATE TABLE IF NOT EXISTS affiliate_payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES affiliate_payouts(id) ON DELETE CASCADE,
  commission_id UUID NOT NULL UNIQUE REFERENCES affiliate_commissions(id) ON DELETE RESTRICT,
  amount_rupiah BIGINT NOT NULL CHECK (amount_rupiah >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payout_id, commission_id)
);

CREATE INDEX IF NOT EXISTS affiliate_payout_items_payout_idx ON affiliate_payout_items (payout_id);

CREATE TABLE IF NOT EXISTS affiliate_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  commission_id UUID REFERENCES affiliate_commissions(id) ON DELETE RESTRICT,
  payout_id UUID REFERENCES affiliate_payouts(id) ON DELETE RESTRICT,
  statement_id UUID REFERENCES affiliate_statements(id) ON DELETE RESTRICT,
  entry_type TEXT NOT NULL
    CHECK (entry_type IN ('commission_accrual', 'commission_reversal', 'manual_adjustment', 'payout')),
  amount_rupiah BIGINT NOT NULL,
  reference_key TEXT NOT NULL UNIQUE,
  description TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (amount_rupiah <> 0)
);

CREATE INDEX IF NOT EXISTS affiliate_ledger_member_time_idx
  ON affiliate_ledger_entries (affiliate_member_id, effective_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_ledger_commission_idx ON affiliate_ledger_entries (commission_id);
CREATE INDEX IF NOT EXISTS affiliate_ledger_payout_idx ON affiliate_ledger_entries (payout_id);
CREATE INDEX IF NOT EXISTS affiliate_ledger_statement_idx ON affiliate_ledger_entries (statement_id);

CREATE TABLE IF NOT EXISTS affiliate_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID NOT NULL REFERENCES affiliate_members(id) ON DELETE RESTRICT,
  statement_id UUID NOT NULL REFERENCES affiliate_statements(id) ON DELETE RESTRICT,
  payout_id UUID REFERENCES affiliate_payouts(id) ON DELETE SET NULL,
  disputed_amount_rupiah BIGINT NOT NULL DEFAULT 0 CHECK (disputed_amount_rupiah >= 0),
  reason TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'reviewing', 'resolved', 'rejected')),
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_disputes_member_status_idx
  ON affiliate_disputes (affiliate_member_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_disputes_statement_idx ON affiliate_disputes (statement_id);
CREATE INDEX IF NOT EXISTS affiliate_disputes_status_created_idx
  ON affiliate_disputes (status, created_at DESC);

CREATE TABLE IF NOT EXISTS affiliate_email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_member_id UUID REFERENCES affiliate_members(id) ON DELETE SET NULL,
  payout_id UUID REFERENCES affiliate_payouts(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_email_status_created_idx
  ON affiliate_email_deliveries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_email_member_idx ON affiliate_email_deliveries (affiliate_member_id);

CREATE TABLE IF NOT EXISTS affiliate_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'member', 'system')),
  actor_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliate_audit_resource_idx
  ON affiliate_audit_logs (resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_audit_actor_idx
  ON affiliate_audit_logs (actor_type, actor_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Idempotent state helpers. External email/payment calls remain outside DB tx.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION promote_mature_affiliate_commissions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  changed_count INTEGER;
BEGIN
  UPDATE public.affiliate_commissions c
  SET status = 'available', updated_at = NOW()
  FROM public.orders o
  WHERE c.order_id = o.id
    AND c.status = 'pending'
    AND c.available_at <= NOW()
    AND o.payment_status = 'paid';

  GET DIAGNOSTICS changed_count = ROW_COUNT;
  RETURN changed_count;
END;
$$;

REVOKE ALL ON FUNCTION promote_mature_affiliate_commissions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION promote_mature_affiliate_commissions() TO service_role;

CREATE OR REPLACE FUNCTION publish_affiliate_program_version(
  p_product_id UUID,
  p_commission_bps INTEGER,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_eligibility_type TEXT,
  p_attribution_window_days INTEGER,
  p_holding_days INTEGER,
  p_promotional_brief TEXT,
  p_approved_copy TEXT,
  p_asset_url TEXT,
  p_restrictions TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  program_id_value UUID;
  version_id_value UUID;
  next_version INTEGER;
BEGIN
  IF p_commission_bps < 1 OR p_commission_bps > 10000
    OR p_attribution_window_days < 1 OR p_attribution_window_days > 90
    OR p_holding_days < 0 OR p_holding_days > 90
    OR p_eligibility_type NOT IN ('owners_only', 'all_members')
    OR (p_ends_at IS NOT NULL AND p_ends_at <= p_starts_at)
  THEN RAISE EXCEPTION 'Invalid affiliate program configuration';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('affiliate-program:' || p_product_id::TEXT));
  INSERT INTO public.affiliate_programs (
    product_id, status, eligibility_type, attribution_window_days,
    holding_days, promotional_brief, approved_copy, asset_url, restrictions
  ) VALUES (
    p_product_id, 'active', p_eligibility_type, p_attribution_window_days,
    p_holding_days, NULLIF(trim(p_promotional_brief), ''), NULLIF(trim(p_approved_copy), ''),
    NULLIF(trim(p_asset_url), ''), NULLIF(trim(p_restrictions), '')
  )
  ON CONFLICT (product_id) DO UPDATE SET
    status = 'active',
    eligibility_type = EXCLUDED.eligibility_type,
    attribution_window_days = EXCLUDED.attribution_window_days,
    holding_days = EXCLUDED.holding_days,
    promotional_brief = EXCLUDED.promotional_brief,
    approved_copy = EXCLUDED.approved_copy,
    asset_url = EXCLUDED.asset_url,
    restrictions = EXCLUDED.restrictions,
    updated_at = NOW()
  RETURNING id INTO program_id_value;

  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.affiliate_program_versions
  WHERE program_id = program_id_value;

  INSERT INTO public.affiliate_program_versions (
    program_id, version_number, commission_bps, starts_at,
    ends_at, status, published_at
  ) VALUES (
    program_id_value, next_version, p_commission_bps, p_starts_at,
    p_ends_at, 'published', NOW()
  ) RETURNING id INTO version_id_value;

  RETURN jsonb_build_object(
    'programId', program_id_value,
    'versionId', version_id_value,
    'versionNumber', next_version
  );
END;
$$;

REVOKE ALL ON FUNCTION publish_affiliate_program_version(UUID, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_affiliate_program_version(UUID, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION publish_affiliate_terms(p_title TEXT, p_content TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id UUID;
  next_version INTEGER;
BEGIN
  IF char_length(trim(p_title)) = 0 OR char_length(trim(p_content)) < 200 THEN
    RAISE EXCEPTION 'Affiliate terms are incomplete';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('affiliate-terms-publish'));
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM public.affiliate_terms_versions;
  INSERT INTO public.affiliate_terms_versions (
    version, title, content, status, effective_at
  ) VALUES (next_version, trim(p_title), trim(p_content), 'draft', NOW())
  RETURNING id INTO new_id;
  UPDATE public.affiliate_terms_versions
  SET status = 'retired', updated_at = NOW()
  WHERE status = 'published';
  UPDATE public.affiliate_terms_versions
  SET status = 'published', published_at = NOW(), updated_at = NOW()
  WHERE id = new_id;
  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION publish_affiliate_terms(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_affiliate_terms(TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION generate_affiliate_settlement(
  p_period_start DATE,
  p_period_end DATE,
  p_minimum_payout BIGINT DEFAULT 50000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cycle_id UUID;
  statement_id_value UUID;
  payout_id_value UUID;
  member_row RECORD;
  statement_count INTEGER := 0;
  payout_total BIGINT := 0;
BEGIN
  IF p_period_end < p_period_start OR p_minimum_payout < 0 THEN
    RAISE EXCEPTION 'Invalid settlement parameters';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('affiliate-settlement:' || p_period_end::TEXT));
  PERFORM public.promote_mature_affiliate_commissions();

  INSERT INTO public.affiliate_settlement_cycles (period_start, period_end, status, issued_at)
  VALUES (p_period_start, p_period_end, 'issued', NOW())
  ON CONFLICT (period_start, period_end) DO UPDATE
  SET status = CASE
        WHEN public.affiliate_settlement_cycles.status = 'draft' THEN 'issued'
        ELSE public.affiliate_settlement_cycles.status
      END,
      issued_at = COALESCE(public.affiliate_settlement_cycles.issued_at, NOW()),
      updated_at = NOW()
  RETURNING id INTO cycle_id;

  FOR member_row IN
    SELECT
      m.id AS affiliate_member_id,
      COALESCE(commissions.revenue, 0)::BIGINT AS revenue,
      COALESCE(commissions.gross, 0)::BIGINT AS gross,
      COALESCE(adjustments.total, 0)::BIGINT AS adjustment,
      (COALESCE(commissions.gross, 0) + COALESCE(adjustments.total, 0))::BIGINT AS net,
      a.bank_name,
      a.account_name,
      a.account_number_last4,
      a.account_number_encrypted,
      a.tax_id_encrypted,
      a.tax_id_last4
    FROM public.affiliate_members m
    JOIN public.affiliate_payout_accounts a
      ON a.affiliate_member_id = m.id
    LEFT JOIN LATERAL (
      SELECT
        SUM(c.commissionable_amount_rupiah)::BIGINT AS revenue,
        SUM(c.commission_amount_rupiah)::BIGINT AS gross
      FROM public.affiliate_commissions c
      WHERE c.affiliate_member_id = m.id
        AND c.status = 'available'
        AND c.statement_id IS NULL
        AND c.available_at < (p_period_end + 1)::TIMESTAMPTZ
    ) commissions ON TRUE
    LEFT JOIN LATERAL (
      SELECT SUM(adj.amount_rupiah)::BIGINT AS total
      FROM public.affiliate_adjustments adj
      WHERE adj.affiliate_member_id = m.id
        AND adj.status = 'available'
        AND adj.statement_id IS NULL
        AND adj.available_at < (p_period_end + 1)::TIMESTAMPTZ
    ) adjustments ON TRUE
    WHERE m.status = 'active'
      AND (COALESCE(commissions.gross, 0) + COALESCE(adjustments.total, 0)) >= p_minimum_payout
  LOOP
    statement_id_value := NULL;
    INSERT INTO public.affiliate_statements (
      settlement_cycle_id, affiliate_member_id, status,
      attributed_revenue_rupiah, gross_commission_rupiah, adjustment_rupiah,
      net_payout_rupiah, issued_at
    ) VALUES (
      cycle_id, member_row.affiliate_member_id, 'issued',
      member_row.revenue, member_row.gross, member_row.adjustment, member_row.net, NOW()
    )
    ON CONFLICT (settlement_cycle_id, affiliate_member_id) DO NOTHING
    RETURNING id INTO statement_id_value;

    IF statement_id_value IS NULL THEN CONTINUE; END IF;

    INSERT INTO public.affiliate_payouts (
      statement_id, affiliate_member_id, status, amount_rupiah,
      bank_name, account_name, account_number_last4
    ) VALUES (
      statement_id_value, member_row.affiliate_member_id, 'scheduled', member_row.net,
      member_row.bank_name, member_row.account_name, member_row.account_number_last4
    ) RETURNING id INTO payout_id_value;

    INSERT INTO public.affiliate_payout_account_snapshots (
      payout_id, bank_name, account_name, account_number_encrypted,
      account_number_last4, tax_id_encrypted, tax_id_last4
    ) VALUES (
      payout_id_value, member_row.bank_name, member_row.account_name,
      member_row.account_number_encrypted, member_row.account_number_last4,
      member_row.tax_id_encrypted, member_row.tax_id_last4
    );

    INSERT INTO public.affiliate_payout_items (payout_id, commission_id, amount_rupiah)
    SELECT payout_id_value, c.id, c.commission_amount_rupiah
    FROM public.affiliate_commissions c
    WHERE c.affiliate_member_id = member_row.affiliate_member_id
      AND c.status = 'available'
      AND c.statement_id IS NULL
      AND c.available_at < (p_period_end + 1)::TIMESTAMPTZ;

    UPDATE public.affiliate_commissions c
    SET status = 'allocated', statement_id = statement_id_value, updated_at = NOW()
    FROM public.affiliate_payout_items pi
    WHERE pi.payout_id = payout_id_value AND pi.commission_id = c.id;

    UPDATE public.affiliate_adjustments
    SET status = 'allocated', statement_id = statement_id_value, updated_at = NOW()
    WHERE affiliate_member_id = member_row.affiliate_member_id
      AND status = 'available'
      AND statement_id IS NULL
      AND available_at < (p_period_end + 1)::TIMESTAMPTZ;

    statement_count := statement_count + 1;
    payout_total := payout_total + member_row.net;
  END LOOP;

  RETURN jsonb_build_object(
    'cycleId', cycle_id,
    'statementCount', statement_count,
    'payoutTotalRupiah', payout_total
  );
END;
$$;

REVOKE ALL ON FUNCTION generate_affiliate_settlement(DATE, DATE, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION generate_affiliate_settlement(DATE, DATE, BIGINT) TO service_role;

CREATE OR REPLACE FUNCTION mark_affiliate_payout_paid(
  p_payout_id UUID,
  p_transfer_reference TEXT,
  p_proof_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  payout_row RECORD;
  paid_time TIMESTAMPTZ := NOW();
BEGIN
  SELECT p.*, s.status AS statement_status
  INTO payout_row
  FROM public.affiliate_payouts p
  JOIN public.affiliate_statements s ON s.id = p.statement_id
  WHERE p.id = p_payout_id
  FOR UPDATE OF p, s;

  IF NOT FOUND THEN RAISE EXCEPTION 'Payout not found'; END IF;
  IF payout_row.status = 'paid' THEN
    RETURN jsonb_build_object('alreadyPaid', TRUE, 'payoutId', payout_row.id);
  END IF;
  IF payout_row.status NOT IN ('scheduled', 'processing') THEN
    RAISE EXCEPTION 'Payout cannot be paid from status %', payout_row.status;
  END IF;
  IF payout_row.statement_status = 'disputed' THEN
    RAISE EXCEPTION 'Resolve dispute before payout';
  END IF;
  IF COALESCE(trim(p_transfer_reference), '') = '' THEN
    RAISE EXCEPTION 'Transfer reference is required';
  END IF;

  UPDATE public.affiliate_payouts
  SET status = 'paid', transfer_reference = p_transfer_reference,
      proof_url = NULLIF(trim(p_proof_url), ''), paid_at = paid_time, updated_at = paid_time
  WHERE id = p_payout_id;

  UPDATE public.affiliate_statements
  SET status = 'paid', updated_at = paid_time
  WHERE id = payout_row.statement_id;

  UPDATE public.affiliate_commissions c
  SET status = 'paid', paid_at = paid_time, updated_at = paid_time
  FROM public.affiliate_payout_items pi
  WHERE pi.payout_id = p_payout_id AND pi.commission_id = c.id;

  UPDATE public.affiliate_adjustments
  SET status = 'applied', updated_at = paid_time
  WHERE statement_id = payout_row.statement_id AND status = 'allocated';

  INSERT INTO public.affiliate_ledger_entries (
    affiliate_member_id, payout_id, statement_id, entry_type,
    amount_rupiah, reference_key, description, effective_at
  ) VALUES (
    payout_row.affiliate_member_id, payout_row.id, payout_row.statement_id, 'payout',
    -payout_row.amount_rupiah, 'payout:' || payout_row.id || ':paid',
    'Payout ' || p_transfer_reference, paid_time
  ) ON CONFLICT (reference_key) DO NOTHING;

  RETURN jsonb_build_object(
    'alreadyPaid', FALSE,
    'payoutId', payout_row.id,
    'statementId', payout_row.statement_id,
    'affiliateMemberId', payout_row.affiliate_member_id,
    'amountRupiah', payout_row.amount_rupiah,
    'paidAt', paid_time
  );
END;
$$;

REVOKE ALL ON FUNCTION mark_affiliate_payout_paid(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_affiliate_payout_paid(UUID, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION reverse_affiliate_commissions_for_order(
  p_order_id UUID,
  p_reason TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  commission_row RECORD;
  payout_id_value UUID;
  payout_item_id_value UUID;
  payout_status_value TEXT;
  payout_statement_id_value UUID;
  remaining_gross BIGINT;
  remaining_revenue BIGINT;
  statement_adjustment BIGINT;
  remaining_net BIGINT;
  changed_count INTEGER := 0;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('affiliate-refund:' || p_order_id::TEXT));

  FOR commission_row IN
    SELECT * FROM public.affiliate_commissions
    WHERE order_id = p_order_id AND status <> 'reversed'
    FOR UPDATE
  LOOP
    payout_id_value := NULL;
    payout_item_id_value := NULL;
    payout_status_value := NULL;
    payout_statement_id_value := NULL;
    IF commission_row.status IN ('paid', 'allocated') THEN
      SELECT p.id, p.status, p.statement_id, pi.id
      INTO payout_id_value, payout_status_value, payout_statement_id_value, payout_item_id_value
      FROM public.affiliate_payout_items pi
      JOIN public.affiliate_payouts p ON p.id = pi.payout_id
      WHERE pi.commission_id = commission_row.id
      FOR UPDATE OF p;
    END IF;

    IF commission_row.status = 'paid' OR payout_status_value = 'paid' THEN
      INSERT INTO public.affiliate_adjustments (
        affiliate_member_id, source_commission_id, adjustment_type,
        status, amount_rupiah, reason
      ) VALUES (
        commission_row.affiliate_member_id, commission_row.id, 'post_payout_refund',
        'available', -commission_row.commission_amount_rupiah, p_reason
      ) ON CONFLICT (source_commission_id, adjustment_type) DO NOTHING;

      IF FOUND THEN changed_count := changed_count + 1; END IF;
    ELSE
      UPDATE public.affiliate_commissions
      SET status = 'reversed', reversal_reason = p_reason,
          statement_id = NULL, updated_at = NOW()
      WHERE id = commission_row.id;
      changed_count := changed_count + 1;

      IF commission_row.status = 'allocated' AND payout_id_value IS NOT NULL THEN
        DELETE FROM public.affiliate_payout_items WHERE id = payout_item_id_value;

        SELECT
          COALESCE(SUM(c.commission_amount_rupiah), 0),
          COALESCE(SUM(c.commissionable_amount_rupiah), 0)
        INTO remaining_gross, remaining_revenue
        FROM public.affiliate_payout_items pi
        JOIN public.affiliate_commissions c ON c.id = pi.commission_id
        WHERE pi.payout_id = payout_id_value;

        SELECT COALESCE(adjustment_rupiah, 0)
        INTO statement_adjustment
        FROM public.affiliate_statements
        WHERE id = payout_statement_id_value;
        remaining_net := remaining_gross + statement_adjustment;

        IF remaining_net < 50000 THEN
          UPDATE public.affiliate_commissions
          SET status = 'available', statement_id = NULL, updated_at = NOW()
          WHERE statement_id = payout_statement_id_value AND status = 'allocated';
          UPDATE public.affiliate_adjustments
          SET status = 'available', statement_id = NULL, updated_at = NOW()
          WHERE statement_id = payout_statement_id_value AND status = 'allocated';
          DELETE FROM public.affiliate_payout_items WHERE payout_id = payout_id_value;
          UPDATE public.affiliate_payouts
          SET status = 'cancelled', amount_rupiah = GREATEST(0, remaining_net),
              failure_reason = 'Refund reduced payout below minimum', updated_at = NOW()
          WHERE id = payout_id_value;
          UPDATE public.affiliate_statements
          SET status = 'cancelled', attributed_revenue_rupiah = remaining_revenue,
              gross_commission_rupiah = remaining_gross, net_payout_rupiah = remaining_net,
              updated_at = NOW()
          WHERE id = payout_statement_id_value;
        ELSE
          UPDATE public.affiliate_payouts
          SET amount_rupiah = remaining_net, updated_at = NOW()
          WHERE id = payout_id_value;
          UPDATE public.affiliate_statements
          SET attributed_revenue_rupiah = remaining_revenue,
              gross_commission_rupiah = remaining_gross, net_payout_rupiah = remaining_net,
              updated_at = NOW()
          WHERE id = payout_statement_id_value;
        END IF;
      END IF;
    END IF;

    INSERT INTO public.affiliate_ledger_entries (
      affiliate_member_id, commission_id, entry_type, amount_rupiah,
      reference_key, description
    ) VALUES (
      commission_row.affiliate_member_id, commission_row.id, 'commission_reversal',
      -commission_row.commission_amount_rupiah,
      'commission:' || commission_row.id || ':reversal', p_reason
    ) ON CONFLICT (reference_key) DO NOTHING;
  END LOOP;

  RETURN changed_count;
END;
$$;

REVOKE ALL ON FUNCTION reverse_affiliate_commissions_for_order(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reverse_affiliate_commissions_for_order(UUID, TEXT) TO service_role;

-- ---------------------------------------------------------------------------
-- RLS and least privilege
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION current_affiliate_member_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id
  FROM public.affiliate_members
  WHERE user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION current_affiliate_member_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION current_affiliate_member_id() TO authenticated;

ALTER TABLE affiliate_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_program_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_settlement_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payout_account_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_email_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Affiliate read published terms" ON affiliate_terms_versions;
CREATE POLICY "Affiliate read published terms" ON affiliate_terms_versions
  FOR SELECT TO authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Affiliate read own member" ON affiliate_members;
CREATE POLICY "Affiliate read own member" ON affiliate_members
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Affiliate read active programs" ON affiliate_programs;
CREATE POLICY "Affiliate read active programs" ON affiliate_programs
  FOR SELECT TO authenticated USING (status IN ('active', 'paused', 'ended'));

DROP POLICY IF EXISTS "Affiliate read published program versions" ON affiliate_program_versions;
CREATE POLICY "Affiliate read published program versions" ON affiliate_program_versions
  FOR SELECT TO authenticated USING (status IN ('published', 'retired'));

DROP POLICY IF EXISTS "Affiliate read own enrollments" ON affiliate_enrollments;
CREATE POLICY "Affiliate read own enrollments" ON affiliate_enrollments
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own links" ON affiliate_links;
CREATE POLICY "Affiliate read own links" ON affiliate_links
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own clicks" ON affiliate_clicks;
CREATE POLICY "Affiliate read own clicks" ON affiliate_clicks
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own attributions" ON affiliate_attributions;
CREATE POLICY "Affiliate read own attributions" ON affiliate_attributions
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own statements" ON affiliate_statements;
CREATE POLICY "Affiliate read own statements" ON affiliate_statements
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own payouts" ON affiliate_payouts;
CREATE POLICY "Affiliate read own payouts" ON affiliate_payouts
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own commissions" ON affiliate_commissions;
CREATE POLICY "Affiliate read own commissions" ON affiliate_commissions
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own adjustments" ON affiliate_adjustments;
CREATE POLICY "Affiliate read own adjustments" ON affiliate_adjustments
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own payout items" ON affiliate_payout_items;
CREATE POLICY "Affiliate read own payout items" ON affiliate_payout_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliate_payouts p
      WHERE p.id = affiliate_payout_items.payout_id
        AND p.affiliate_member_id = (SELECT public.current_affiliate_member_id())
    )
  );

DROP POLICY IF EXISTS "Affiliate read own ledger" ON affiliate_ledger_entries;
CREATE POLICY "Affiliate read own ledger" ON affiliate_ledger_entries
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

DROP POLICY IF EXISTS "Affiliate read own disputes" ON affiliate_disputes;
CREATE POLICY "Affiliate read own disputes" ON affiliate_disputes
  FOR SELECT TO authenticated
  USING (affiliate_member_id = (SELECT public.current_affiliate_member_id()));

-- Sensitive account ciphertext, commerce snapshots, email logs, and audit logs
-- intentionally have no member-facing policies. They are returned as safe DTOs
-- through authorized server routes only.

REVOKE ALL ON TABLE
  affiliate_terms_versions,
  affiliate_members,
  affiliate_payout_accounts,
  affiliate_programs,
  affiliate_program_versions,
  affiliate_enrollments,
  affiliate_links,
  affiliate_clicks,
  order_items,
  affiliate_attributions,
  affiliate_settlement_cycles,
  affiliate_statements,
  affiliate_payouts,
  affiliate_payout_account_snapshots,
  affiliate_commissions,
  affiliate_adjustments,
  affiliate_payout_items,
  affiliate_ledger_entries,
  affiliate_disputes,
  affiliate_email_deliveries,
  affiliate_audit_logs
FROM anon;

-- Supabase projects can define broad default privileges for authenticated.
-- Clear them first, then grant only the read surface protected by RLS below.
REVOKE ALL ON TABLE
  affiliate_terms_versions,
  affiliate_members,
  affiliate_payout_accounts,
  affiliate_programs,
  affiliate_program_versions,
  affiliate_enrollments,
  affiliate_links,
  affiliate_clicks,
  order_items,
  affiliate_attributions,
  affiliate_settlement_cycles,
  affiliate_statements,
  affiliate_payouts,
  affiliate_payout_account_snapshots,
  affiliate_commissions,
  affiliate_adjustments,
  affiliate_payout_items,
  affiliate_ledger_entries,
  affiliate_disputes,
  affiliate_email_deliveries,
  affiliate_audit_logs
FROM authenticated;

GRANT SELECT ON TABLE
  affiliate_terms_versions,
  affiliate_members,
  affiliate_programs,
  affiliate_program_versions,
  affiliate_enrollments,
  affiliate_links,
  affiliate_clicks,
  affiliate_attributions,
  affiliate_statements,
  affiliate_payouts,
  affiliate_commissions,
  affiliate_adjustments,
  affiliate_payout_items,
  affiliate_ledger_entries,
  affiliate_disputes
TO authenticated;

-- Seed the first terms version as a draft. Admin must review and publish it.
INSERT INTO affiliate_terms_versions (version, title, content, status)
VALUES (
  1,
  'Syarat dan Ketentuan Marcatching Affiliate',
  $terms$
Syarat dan Ketentuan Marcatching Affiliate — Draft v1

1. Ruang lingkup
Program ini hanya mempromosikan produk digital milik Marcatching. Affiliate bertindak sebagai mitra promosi independen, bukan karyawan, agen hukum, atau perwakilan yang berwenang membuat janji atas nama Marcatching.

2. Kelayakan dan penerimaan
Peserta wajib memiliki akun course.marcatching.com yang aktif, memberikan data yang benar, dan menerima versi syarat yang berlaku. Sebagian program dapat dibatasi hanya untuk member yang telah memiliki produk terkait.

3. Link dan atribusi
Penjualan diatribusikan menggunakan last valid click dengan first-party cookie maksimal 30 hari, atau periode khusus yang terlihat pada program. Komisi hanya berlaku untuk produk yang secara tepat terhubung dari link affiliate. Add-on tidak otomatis menghasilkan komisi kecuali mempunyai program dan atribusi tersendiri. Pembelian oleh affiliate menggunakan emailnya sendiri tidak memperoleh komisi.

4. Nilai dan penguncian komisi
Persentase, masa berlaku, dan masa tahan ditampilkan sebelum affiliate mengikuti program. Versi komisi yang telah disetujui tidak dapat diturunkan secara retroaktif. Setiap click, order, dan komisi menyimpan snapshot versinya. Perubahan rate hanya berlaku menurut versi dan tanggal efektif yang baru.

5. Dasar perhitungan
Komisi dihitung dari nilai item terkait setelah diskon voucher, dibulatkan ke Rupiah terdekat. Biaya payment gateway ditanggung Marcatching. Pajak atau pemotongan wajib dapat diberlakukan sesuai ketentuan yang berlaku dan akan ditampilkan pada statement.

6. Validasi, refund, dan fraud
Komisi berstatus pending selama masa tahan default 14 hari. Refund, chargeback, pembatalan, duplikasi, manipulasi cookie/click, self-referral, misleading claim, spam, paid traffic yang menyamar, atau aktivitas tidak wajar dapat membuat atribusi ditolak, komisi dibalik, akun ditahan, atau program dihentikan. Riwayat perubahan tetap disimpan dan tidak di-reset.

7. Settlement dan payout
Komisi matang masuk settlement bulanan. Statement ditargetkan terbit tanggal 1, masa banding tanggal 1–3, dan payout dilakukan paling lambat tanggal 5 atau hari kerja berikutnya. Minimum payout Rp50.000; saldo di bawah minimum dibawa ke periode berikutnya. Payout dilakukan manual ke rekening terverifikasi, dan biaya transfer ditanggung Marcatching. Jadwal dapat bergeser karena data rekening salah, pemeriksaan fraud, sengketa, gangguan bank, atau keadaan kahar.

8. Data payout
Affiliate wajib mengisi nama bank, nama pemilik, dan nomor rekening yang benar serta bertanggung jawab atas konsekuensi data yang keliru. Marcatching menyimpan nomor rekening dan identitas pajak dalam bentuk terenkripsi dan hanya menampilkan sebagian digit pada dashboard/statement.

9. Konten promosi
Affiliate wajib mengikuti brief, menggunakan klaim yang jujur, mengungkap hubungan affiliate secara jelas, menghormati hak cipta dan merek, serta tidak menjanjikan hasil yang tidak dapat dibuktikan. Materi yang menyesatkan atau melanggar hukum dapat diminta untuk diturunkan.

10. Statement, slip, dan banding
Affiliate menerima rincian click, transaksi teratribusi, status komisi, penyesuaian, dan payout. Banding wajib diajukan melalui dashboard maksimal tiga hari setelah statement diterbitkan dengan alasan dan bukti yang memadai. Marcatching akan menyimpan hasil pemeriksaan dalam riwayat sengketa.

11. Perubahan dan penghentian
Marcatching dapat membuka, menjeda, atau menutup program untuk masa depan. Perubahan syarat material diterbitkan sebagai versi baru dan dapat memerlukan persetujuan ulang. Hak atas komisi valid yang telah terkunci tetap diproses, kecuali kemudian terbukti terjadi refund, fraud, atau pelanggaran.

12. Dukungan
Pertanyaan dan sengketa dapat disampaikan melalui dashboard Affiliate atau gilang@marcatching.com.

Dokumen ini adalah draft operasional dan harus ditinjau penasihat hukum/pajak Indonesia sebelum dipublikasikan.
$terms$,
  'draft'
)
ON CONFLICT (version) DO NOTHING;
