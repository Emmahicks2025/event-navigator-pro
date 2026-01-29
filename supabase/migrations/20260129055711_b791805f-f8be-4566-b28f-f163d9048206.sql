-- Create storage buckets for local assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('performer-images', 'performer-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('venue-maps', 'venue-maps', true)
ON CONFLICT (id) DO NOTHING;

-- Create public SELECT policies for the buckets
CREATE POLICY "Public read performer images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'performer-images');

CREATE POLICY "Public read venue maps" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'venue-maps');

-- Allow service role to upload
CREATE POLICY "Service role upload performer images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'performer-images');

CREATE POLICY "Service role upload venue maps" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'venue-maps');