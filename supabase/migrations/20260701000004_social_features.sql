-- 1. Create Likes Table
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

-- 2. Create Wishlists Table
CREATE TABLE public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

-- 3. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Owner of the note
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Person who liked/wishlisted
    note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'like' or 'wishlist'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Set up Realtime for Notifications (so the Navbar can listen to it if we want, or just fetch)
alter publication supabase_realtime add table public.notifications;

-- 5. Triggers for notifications
CREATE OR REPLACE FUNCTION notify_on_action() RETURNS TRIGGER AS $$
DECLARE
    v_seller_id UUID;
BEGIN
    -- Get the seller of the note
    SELECT seller_id INTO v_seller_id FROM public.notes WHERE id = NEW.note_id;
    
    -- Don't notify if user is liking/wishlisting their own note
    IF v_seller_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, actor_id, note_id, type)
        VALUES (v_seller_id, NEW.user_id, NEW.note_id, TG_ARGV[0]);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes
CREATE TRIGGER on_like_notify
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION notify_on_action('like');

-- Trigger for wishlists
CREATE TRIGGER on_wishlist_notify
AFTER INSERT ON public.wishlists
FOR EACH ROW EXECUTE FUNCTION notify_on_action('wishlist');

-- 6. Setup RLS for tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Likes Policies
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Wishlists Policies
CREATE POLICY "Users can view their own wishlists" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wishlists" ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlists" ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
