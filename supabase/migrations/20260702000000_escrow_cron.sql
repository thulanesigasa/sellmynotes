-- ============================================================
-- Migration: Automated Escrow Release via pg_cron
-- Runs hourly: transitions purchases from 'completed' → 'released'
-- after 48 hours have elapsed since creation (buyer protection window).
-- ============================================================

-- 1. Enable the pg_cron extension (requires Supabase Pro or self-hosted)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant cron usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 2. Add role column to profiles (used by admin middleware)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin'));

-- 3. Create the escrow release function
CREATE OR REPLACE FUNCTION public.release_completed_escrow()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  released_count INTEGER;
BEGIN
  UPDATE public.purchases
  SET
    status = 'released',
    updated_at = NOW()
  WHERE
    status = 'completed'
    AND created_at <= NOW() - INTERVAL '48 hours';

  GET DIAGNOSTICS released_count = ROW_COUNT;

  IF released_count > 0 THEN
    RAISE LOG 'Escrow cron: released % purchase(s) older than 48h.', released_count;
  END IF;
END;
$$;

-- 4. Schedule the function to run every hour
-- Uses cron.schedule (idempotent: unschedule first to avoid duplicates)
SELECT cron.unschedule('release-completed-escrow') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'release-completed-escrow'
);

SELECT cron.schedule(
  'release-completed-escrow',   -- unique job name
  '0 * * * *',                  -- every hour on the hour
  $$ SELECT public.release_completed_escrow(); $$
);
