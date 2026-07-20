-- Trigger function to notify sellers when their note is purchased (status transitions to 'completed')
CREATE OR REPLACE FUNCTION public.notify_on_purchase()
RETURNS trigger AS $$
DECLARE
    v_seller_id UUID;
BEGIN
    IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Get the seller of the note
        SELECT seller_id INTO v_seller_id FROM public.notes WHERE id = NEW.note_id;
        
        -- Insert a 'payment' type notification for the seller, using buyer_id as the actor_id
        IF v_seller_id IS NOT NULL AND v_seller_id != NEW.buyer_id THEN
            INSERT INTO public.notifications (user_id, actor_id, note_id, type)
            VALUES (v_seller_id, NEW.buyer_id, NEW.note_id, 'payment');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to purchases table
DROP TRIGGER IF EXISTS on_purchase_notify ON public.purchases;
CREATE TRIGGER on_purchase_notify
AFTER INSERT OR UPDATE ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.notify_on_purchase();
