-- =============================================
-- INDUSTRIAL-SCALE TICKETING BACKEND SCHEMA
-- =============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =============================================
-- USER ROLES TABLE (separate from profiles for security)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- VENUES TABLE
-- =============================================
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'USA',
  capacity INTEGER,
  svg_map TEXT, -- Store SVG map data directly
  map_viewbox TEXT, -- SVG viewBox attribute
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECTIONS TABLE (venue sections like 101, 102, GA PIT, etc.)
-- =============================================
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'standard', -- 'floor', 'lower', 'upper', 'pit', 'vip', 'suite'
  svg_path TEXT, -- SVG path data for this section
  svg_transform TEXT, -- Optional transform for positioning
  capacity INTEGER DEFAULT 100,
  row_count INTEGER DEFAULT 10,
  seats_per_row INTEGER DEFAULT 10,
  is_general_admission BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SEATS TABLE (individual seats in sections)
-- =============================================
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  row_name TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  coordinate_x DECIMAL,
  coordinate_y DECIMAL,
  is_accessible BOOLEAN DEFAULT false,
  is_aisle BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(section_id, row_name, seat_number)
);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PERFORMERS TABLE
-- =============================================
CREATE TABLE public.performers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  venue_id UUID REFERENCES public.venues(id),
  category_id UUID REFERENCES public.categories(id),
  performer_id UUID REFERENCES public.performers(id),
  event_date DATE NOT NULL,
  event_time TIME,
  doors_open_time TIME,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EVENT SECTIONS (linking events to sections with pricing)
-- =============================================
CREATE TABLE public.event_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) DEFAULT 0,
  capacity INTEGER NOT NULL,
  available_count INTEGER NOT NULL,
  is_sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, section_id)
);

ALTER TABLE public.event_sections ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TICKET INVENTORY (individual tickets for sale)
-- =============================================
CREATE TABLE public.ticket_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_section_id UUID REFERENCES public.event_sections(id) ON DELETE CASCADE NOT NULL,
  seat_id UUID REFERENCES public.seats(id),
  row_name TEXT,
  seat_numbers TEXT, -- Can be range like "1-4" or individual
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'available', -- 'available', 'reserved', 'sold', 'pending'
  seller_id UUID REFERENCES auth.users(id),
  is_resale BOOLEAN DEFAULT false,
  has_clear_view BOOLEAN DEFAULT false,
  is_lowest_price BOOLEAN DEFAULT false,
  notes TEXT,
  reserved_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ticket_inventory ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  subtotal DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'refunded'
  payment_intent_id TEXT,
  payment_method TEXT,
  billing_email TEXT,
  billing_name TEXT,
  billing_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_inventory_id UUID REFERENCES public.ticket_inventory(id),
  event_id UUID REFERENCES public.events(id) NOT NULL,
  section_name TEXT NOT NULL,
  row_name TEXT,
  seat_numbers TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FEATURED EVENTS CONFIG (for homepage management)
-- =============================================
CREATE TABLE public.featured_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.featured_config ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Check if current user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Roles policies
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Venues policies
CREATE POLICY "Anyone can view venues"
ON public.venues FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage venues"
ON public.venues FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Sections policies
CREATE POLICY "Anyone can view sections"
ON public.sections FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and moderators can manage sections"
ON public.sections FOR ALL
TO authenticated
USING (public.is_moderator_or_admin())
WITH CHECK (public.is_moderator_or_admin());

-- Seats policies
CREATE POLICY "Anyone can view seats"
ON public.seats FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage seats"
ON public.seats FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Categories policies
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Performers policies
CREATE POLICY "Anyone can view performers"
ON public.performers FOR SELECT
USING (true);

CREATE POLICY "Admins can manage performers"
ON public.performers FOR ALL
TO authenticated
USING (public.is_moderator_or_admin())
WITH CHECK (public.is_moderator_or_admin());

-- Events policies
CREATE POLICY "Anyone can view active events"
ON public.events FOR SELECT
USING (is_active = true OR public.is_moderator_or_admin());

CREATE POLICY "Admins and moderators can manage events"
ON public.events FOR ALL
TO authenticated
USING (public.is_moderator_or_admin())
WITH CHECK (public.is_moderator_or_admin());

-- Event sections policies
CREATE POLICY "Anyone can view event sections"
ON public.event_sections FOR SELECT
USING (true);

CREATE POLICY "Admins and moderators can manage event sections"
ON public.event_sections FOR ALL
TO authenticated
USING (public.is_moderator_or_admin())
WITH CHECK (public.is_moderator_or_admin());

-- Ticket inventory policies
CREATE POLICY "Anyone can view available tickets"
ON public.ticket_inventory FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all tickets"
ON public.ticket_inventory FOR ALL
TO authenticated
USING (public.is_moderator_or_admin())
WITH CHECK (public.is_moderator_or_admin());

-- Orders policies
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_moderator_or_admin());

CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Order items policies
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.is_moderator_or_admin())
  )
);

CREATE POLICY "Users can create own order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Featured config policies
CREATE POLICY "Anyone can view featured config"
ON public.featured_config FOR SELECT
USING (true);

CREATE POLICY "Admins can manage featured config"
ON public.featured_config FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performers_updated_at
  BEFORE UPDATE ON public.performers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_sections_updated_at
  BEFORE UPDATE ON public.event_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_inventory_updated_at
  BEFORE UPDATE ON public.ticket_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- =============================================
-- SEED DATA (Categories)
-- =============================================
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Concerts', 'concerts', '🎵', 1),
  ('Sports', 'sports', '⚽', 2),
  ('Theater', 'theater', '🎭', 3),
  ('Comedy', 'comedy', '😂', 4)
ON CONFLICT (slug) DO NOTHING;

-- Initial featured config
INSERT INTO public.featured_config (config_key, config_value) VALUES
  ('homepage_featured_events', '{"max_count": 6, "auto_rotate": true}'),
  ('homepage_carousel_settings', '{"autoplay": true, "interval": 5000}')
ON CONFLICT (config_key) DO NOTHING;