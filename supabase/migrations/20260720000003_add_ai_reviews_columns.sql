-- Alter reviews table to make buyer_id nullable (allows system-generated AI reviews)
ALTER TABLE public.reviews ALTER COLUMN buyer_id DROP NOT NULL;

-- Add AI review caching columns to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS ai_review_comment TEXT;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS ai_review_rating INTEGER CHECK (ai_review_rating >= 1 AND ai_review_rating <= 5);
