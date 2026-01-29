-- Drop the restrictive service role policies
DROP POLICY IF EXISTS "Service role upload performer images" ON storage.objects;
DROP POLICY IF EXISTS "Service role upload venue maps" ON storage.objects;

-- Create new policies that allow any authenticated or admin user to upload
-- For venue-maps bucket - allow uploads for admin functionality
CREATE POLICY "Allow uploads to venue-maps"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'venue-maps');

-- For performer-images bucket - allow uploads for admin functionality  
CREATE POLICY "Allow uploads to performer-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'performer-images');

-- Also allow updates (upserts)
CREATE POLICY "Allow updates to venue-maps"
ON storage.objects FOR UPDATE
USING (bucket_id = 'venue-maps');

CREATE POLICY "Allow updates to performer-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'performer-images');