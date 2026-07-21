-- Create a composite index to optimize notes explore search queries by status, course_code and institution
CREATE INDEX IF NOT EXISTS idx_notes_search_composite ON public.notes (status, course_code, institution);
