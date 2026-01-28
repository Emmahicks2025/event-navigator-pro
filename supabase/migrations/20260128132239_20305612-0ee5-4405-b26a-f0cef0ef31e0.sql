-- Add a column to track which homepage sections an event should appear in
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS homepage_sections text[] DEFAULT '{}';

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_events_homepage_sections ON public.events USING GIN (homepage_sections);

-- Update existing featured events to include 'top_events' section
UPDATE public.events 
SET homepage_sections = ARRAY['top_events']
WHERE is_featured = true AND (homepage_sections IS NULL OR homepage_sections = '{}');