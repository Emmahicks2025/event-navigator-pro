-- =====================================================
-- TICKET PLATFORM DATABASE SCHEMA
-- Complete schema for self-hosted deployment
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =====================================================
-- TABLES
-- =====================================================

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Venues table
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'USA',
  capacity INTEGER,
  svg_map TEXT,
  map_viewbox TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performers table
CREATE TABLE public.performers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sections table (venue sections)
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'standard',
  capacity INTEGER DEFAULT 100,
  row_count INTEGER DEFAULT 10,
  seats_per_row INTEGER DEFAULT 10,
  is_general_admission BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  svg_path TEXT,
  svg_transform TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  doors_open_time TIME,
  venue_id UUID REFERENCES public.venues(id),
  category_id UUID REFERENCES public.categories(id),
  performer_id UUID REFERENCES public.performers(id),
  description TEXT,
  image_url TEXT,
  price_from NUMERIC,
  price_to NUMERIC,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event Sections (pricing per section per event)
CREATE TABLE public.event_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  service_fee NUMERIC DEFAULT 0,
  capacity INTEGER NOT NULL,
  available_count INTEGER NOT NULL,
  is_sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, section_id)
);

-- Seats table (individual seats within sections)
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  row_name TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  coordinate_x NUMERIC,
  coordinate_y NUMERIC,
  is_aisle BOOLEAN DEFAULT false,
  is_accessible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section_id, row_name, seat_number)
);

-- Ticket Inventory table
CREATE TABLE public.ticket_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_section_id UUID NOT NULL REFERENCES public.event_sections(id) ON DELETE CASCADE,
  seat_id UUID REFERENCES public.seats(id),
  row_name TEXT,
  seat_numbers TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'available',
  is_resale BOOLEAN DEFAULT false,
  seller_id UUID,
  is_lowest_price BOOLEAN DEFAULT false,
  has_clear_view BOOLEAN DEFAULT false,
  notes TEXT,
  reserved_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  subtotal NUMERIC NOT NULL,
  service_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  payment_method TEXT,
  billing_name TEXT,
  billing_email TEXT,
  billing_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id),
  ticket_inventory_id UUID REFERENCES public.ticket_inventory(id),
  section_name TEXT NOT NULL,
  row_name TEXT,
  seat_numbers TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  service_fee NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Featured Config table
CREATE TABLE public.featured_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB DEFAULT '{}',
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Check if user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
$$;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update updated_at column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.order_number := 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performers_updated_at
  BEFORE UPDATE ON public.performers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON public.sections
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

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order number generation trigger
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION public.generate_order_number();

-- New user trigger (attach to auth.users)
-- Note: Run this after setting up Supabase Auth
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_config ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Venues policies
CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Admins can manage venues" ON public.venues FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Performers policies
CREATE POLICY "Anyone can view performers" ON public.performers FOR SELECT USING (true);
CREATE POLICY "Admins can manage performers" ON public.performers FOR ALL USING (is_moderator_or_admin()) WITH CHECK (is_moderator_or_admin());

-- Sections policies
CREATE POLICY "Anyone can view sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Admins and moderators can manage sections" ON public.sections FOR ALL USING (is_moderator_or_admin()) WITH CHECK (is_moderator_or_admin());

-- Events policies
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (is_active = true OR is_moderator_or_admin());
CREATE POLICY "Admins and moderators can manage events" ON public.events FOR ALL USING (is_moderator_or_admin()) WITH CHECK (is_moderator_or_admin());

-- Event Sections policies
CREATE POLICY "Anyone can view event sections" ON public.event_sections FOR SELECT USING (true);
CREATE POLICY "Admins and moderators can manage event sections" ON public.event_sections FOR ALL USING (is_moderator_or_admin()) WITH CHECK (is_moderator_or_admin());

-- Seats policies
CREATE POLICY "Anyone can view seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Admins can manage seats" ON public.seats FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Ticket Inventory policies
CREATE POLICY "Anyone can view available tickets" ON public.ticket_inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage all tickets" ON public.ticket_inventory FOR ALL USING (is_moderator_or_admin()) WITH CHECK (is_moderator_or_admin());

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- User Roles policies
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid() OR is_moderator_or_admin());
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Order Items policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_moderator_or_admin()))
);
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Featured Config policies
CREATE POLICY "Anyone can view featured config" ON public.featured_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage featured config" ON public.featured_config FOR ALL USING (is_admin()) WITH CHECK (is_admin());
