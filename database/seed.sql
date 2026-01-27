-- =====================================================
-- TICKET PLATFORM SEED DATA
-- Sample data for development and testing
-- =====================================================

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
  ('303c4682-51e4-4c14-a4b3-094b6a8cf889', 'Concerts', 'concerts', '🎵', 1),
  ('9d87d605-f464-402b-be29-4be4ba7f09df', 'Sports', 'sports', '⚽', 2),
  ('eb8f23e0-0d41-4680-99ef-e73eca53388b', 'Theater', 'theater', '🎭', 3),
  ('b1de7928-0416-47f6-81bb-470a3529c69e', 'Comedy', 'comedy', '😂', 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SAMPLE VENUES
-- =====================================================
INSERT INTO public.venues (id, name, address, city, state, country, capacity) VALUES
  ('27755415-fe7a-451d-9bf0-ae9124644864', 'Madi Vic Arena', '2301 S Voss Rd #2131', 'Houston', 'TX', 'USA', 18000),
  (gen_random_uuid(), 'Downtown Theater', '123 Main St', 'Austin', 'TX', 'USA', 2500),
  (gen_random_uuid(), 'Comedy Club Central', '456 Laugh Ave', 'Dallas', 'TX', 'USA', 500),
  (gen_random_uuid(), 'Sports Stadium', '789 Victory Blvd', 'San Antonio', 'TX', 'USA', 45000)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PERFORMERS
-- =====================================================
INSERT INTO public.performers (name, slug, description, category_id) VALUES
  ('The Rock Band', 'the-rock-band', 'Popular rock band touring nationwide', '303c4682-51e4-4c14-a4b3-094b6a8cf889'),
  ('Comedy Stars', 'comedy-stars', 'Top comedians from around the country', 'b1de7928-0416-47f6-81bb-470a3529c69e'),
  ('Broadway Ensemble', 'broadway-ensemble', 'Award-winning theater group', 'eb8f23e0-0d41-4680-99ef-e73eca53388b'),
  ('Home Team', 'home-team', 'Local professional sports team', '9d87d605-f464-402b-be29-4be4ba7f09df')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FEATURED CONFIG
-- =====================================================
INSERT INTO public.featured_config (config_key, config_value) VALUES
  ('homepage_hero', '{"title": "Find Your Next Event", "subtitle": "Tickets to concerts, sports, theater and more"}'),
  ('featured_categories', '["concerts", "sports"]')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- NOTES FOR ADMIN SETUP
-- =====================================================
-- After creating a user via Supabase Auth, run:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('<user-uuid>', 'admin');
-- 
-- This grants admin access to the specified user.
