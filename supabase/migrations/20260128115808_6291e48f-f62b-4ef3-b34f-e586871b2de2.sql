-- Create storage bucket for temporary uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('temp-uploads', 'temp-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to temp-uploads bucket
CREATE POLICY "Allow public uploads to temp-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'temp-uploads');

-- Allow public read from temp-uploads bucket
CREATE POLICY "Allow public read from temp-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'temp-uploads');