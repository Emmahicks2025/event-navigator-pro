-- Create sell requests table for ticket selling form submissions
CREATE TABLE public.sell_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  venue_name TEXT NOT NULL,
  city TEXT NOT NULL,
  section TEXT NOT NULL,
  row_name TEXT,
  seat_numbers TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  asking_price NUMERIC NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit sell requests"
ON public.sell_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own requests"
ON public.sell_requests
FOR SELECT
USING (user_id = auth.uid() OR is_moderator_or_admin());

CREATE POLICY "Admins can manage all requests"
ON public.sell_requests
FOR ALL
USING (is_moderator_or_admin())
WITH CHECK (is_moderator_or_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_sell_requests_updated_at
BEFORE UPDATE ON public.sell_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();