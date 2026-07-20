-- Create index on notifications created_at to optimize feed query sorting
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);
