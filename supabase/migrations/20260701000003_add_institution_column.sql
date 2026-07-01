-- Since the 'university' column was missing before, we'll just add the new 'institution' column directly
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS institution TEXT DEFAULT 'Unknown Institution';
