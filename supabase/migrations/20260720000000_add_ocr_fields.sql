-- Add OCR text and AI suggested price to notes table
ALTER TABLE public.notes 
ADD COLUMN ocr_text TEXT,
ADD COLUMN suggested_price DECIMAL(10, 2);
