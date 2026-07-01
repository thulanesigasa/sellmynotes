-- Add unique constraint on reviews to prevent duplicate submissions
-- (one review per buyer per note)
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_buyer_note_unique UNIQUE (buyer_id, note_id);

-- Allow buyers to update/delete their own reviews
CREATE POLICY "Buyers can update their own reviews."
  ON public.reviews FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete their own reviews."
  ON public.reviews FOR DELETE
  USING (auth.uid() = buyer_id);
