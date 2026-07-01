-- ============================================================
-- Migration: Webhook Trigger for Note Published
-- Required for Task C: User Retention Notifications
-- ============================================================

-- Ensure the pg_net extension is enabled for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_note_published()
RETURNS trigger AS $$
DECLARE
  webhook_url text;
  webhook_secret text;
BEGIN
  -- Change this to the actual backend URL in production
  webhook_url := current_setting('app.settings.backend_url', true);
  IF webhook_url IS NULL THEN
    -- Fallback for local development or default env
    webhook_url := 'http://host.docker.internal:8000/webhooks/note-published';
  END IF;

  webhook_secret := current_setting('app.settings.webhook_secret', true);
  IF webhook_secret IS NULL THEN
    webhook_secret := 'super-secret-key-123';
  END IF;

  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    PERFORM net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Webhook-Secret', webhook_secret
      ),
      body := jsonb_build_object(
        'type', 'UPDATE',
        'table', 'notes',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_note_published ON public.notes;
CREATE TRIGGER on_note_published
  AFTER UPDATE OF status ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_note_published();
