-- ============================================================
-- Migration: Add payout_status to purchases
-- Required for Task A: Automated Payout Ledger Generation
-- ============================================================

CREATE TYPE payout_status_type AS ENUM ('pending', 'processing', 'paid');

ALTER TABLE public.purchases
  ADD COLUMN payout_status payout_status_type DEFAULT 'pending'::payout_status_type NOT NULL;
