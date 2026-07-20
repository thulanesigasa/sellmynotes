-- Create index to optimize notifications queries checking user unread status
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON public.notifications (user_id, is_read);
