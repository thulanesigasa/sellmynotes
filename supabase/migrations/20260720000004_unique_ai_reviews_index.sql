-- Create a partial unique index to prevent duplicate AI reviews on the same note
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ai_review ON public.reviews (note_id) WHERE buyer_id IS NULL;
