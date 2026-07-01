-- Create the raw_notes storage bucket (private, not public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('raw_notes', 'raw_notes', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Sellers can upload their own notes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'raw_notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read files in their own folder
CREATE POLICY "Sellers can read their own notes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'raw_notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service role to read all files (for the Python backend to download and process)
CREATE POLICY "Service role can read all raw notes"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'raw_notes');

-- Allow authenticated users to delete their own files (for rejection flow)
CREATE POLICY "Sellers can delete their own notes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'raw_notes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
