-- =====================================================
-- TICKET PLATFORM SEED DATA
-- Sample data for development and testing
-- Version: 2.0 (Updated January 2026)
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
  ('27755415-fe7a-451d-9bf0-ae9124644864', 'Madison Square Garden', '4 Pennsylvania Plaza', 'New York', 'NY', 'USA', 20789),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Staples Center', '1111 S Figueroa St', 'Los Angeles', 'CA', 'USA', 19068),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'United Center', '1901 W Madison St', 'Chicago', 'IL', 'USA', 20917),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Barclays Center', '620 Atlantic Ave', 'Brooklyn', 'NY', 'USA', 17732),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'TD Garden', '100 Legends Way', 'Boston', 'MA', 'USA', 19580),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Wells Fargo Center', '3601 S Broad St', 'Philadelphia', 'PA', 'USA', 19500),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'American Airlines Arena', '601 Biscayne Blvd', 'Miami', 'FL', 'USA', 19600),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'Chase Center', '1 Warriors Way', 'San Francisco', 'CA', 'USA', 18064),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'Crypto.com Arena', '1111 S Figueroa St', 'Los Angeles', 'CA', 'USA', 19068),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Capital One Arena', '601 F St NW', 'Washington', 'DC', 'USA', 20356),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Pinnacle Bank Arena', '400 Pinnacle Arena Dr', 'Lincoln', 'NE', 'USA', 15500),
  ('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'Toyota Center', '1510 Polk St', 'Houston', 'TX', 'USA', 18055),
  ('f2a3b4c5-d6e7-5f6a-9b0c-1d2e3f4a5b6c', 'AT&T Stadium', '1 AT&T Way', 'Arlington', 'TX', 'USA', 80000),
  ('a3b4c5d6-e7f8-6a7b-0c1d-2e3f4a5b6c7d', 'SoFi Stadium', '1001 Stadium Dr', 'Inglewood', 'CA', 'USA', 70240),
  ('b4c5d6e7-f8a9-7b8c-1d2e-3f4a5b6c7d8e', 'Radio City Music Hall', '1260 6th Ave', 'New York', 'NY', 'USA', 6015)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PERFORMERS (Music)
-- =====================================================
INSERT INTO public.performers (name, slug, description, category_id, image_url) VALUES
  ('Taylor Swift', 'taylor-swift', 'Multi-Grammy winning pop superstar on The Eras Tour', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/pop-concert.jpg'),
  ('Morgan Wallen', 'morgan-wallen', 'Country music sensation with chart-topping hits', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/country-music.jpg'),
  ('Drake', 'drake', 'Hip-hop icon and multi-platinum recording artist', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/hip-hop.jpg'),
  ('Ed Sheeran', 'ed-sheeran', 'British singer-songwriter with worldwide acclaim', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/singer-stage.jpg'),
  ('Beyoncé', 'beyonce', 'Global superstar and Renaissance World Tour headliner', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/concert-crowd.jpg'),
  ('The Weeknd', 'the-weeknd', 'R&B and pop artist with record-breaking tours', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/concert-stage.jpg'),
  ('Bruno Mars', 'bruno-mars', '15-time Grammy winner known for electrifying performances', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/concert-generic.jpg'),
  ('Coldplay', 'coldplay', 'British rock band on their Music of the Spheres Tour', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/rock-concert.jpg'),
  ('Bad Bunny', 'bad-bunny', 'Latin music superstar breaking world records', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/festival.jpg'),
  ('Adele', 'adele', 'British vocal powerhouse with Las Vegas residency', '303c4682-51e4-4c14-a4b3-094b6a8cf889', '/performers/piano-concert.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PERFORMERS (Sports)
-- =====================================================
INSERT INTO public.performers (name, slug, description, category_id, image_url) VALUES
  ('Los Angeles Lakers', 'la-lakers', 'NBA franchise with 17 championships', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/nba-court.jpg'),
  ('New York Yankees', 'ny-yankees', 'MLB legendary franchise with 27 World Series titles', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/baseball-field.jpg'),
  ('Dallas Cowboys', 'dallas-cowboys', 'NFL Americas Team', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/sports-football.jpg'),
  ('Chicago Bulls', 'chicago-bulls', 'NBA franchise home of Michael Jordan legacy', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/sports-basketball.jpg'),
  ('Boston Bruins', 'boston-bruins', 'NHL Original Six franchise', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/hockey-ice.jpg'),
  ('WWE', 'wwe', 'World Wrestling Entertainment live events', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/wrestling-ring.jpg'),
  ('Houston Rodeo', 'houston-rodeo', 'Worlds largest livestock show and rodeo', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/rodeo.jpg'),
  ('FIFA World Cup', 'fifa-world-cup', 'International soccer championship', '9d87d605-f464-402b-be29-4be4ba7f09df', '/performers/soccer-world-cup.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PERFORMERS (Theater)
-- =====================================================
INSERT INTO public.performers (name, slug, description, category_id, image_url) VALUES
  ('Hamilton', 'hamilton', 'Tony Award-winning hip-hop musical about Alexander Hamilton', 'eb8f23e0-0d41-4680-99ef-e73eca53388b', '/performers/theater-broadway.jpg'),
  ('The Lion King', 'the-lion-king', 'Disney classic brought to life on stage', 'eb8f23e0-0d41-4680-99ef-e73eca53388b', '/performers/theater-stage.jpg'),
  ('Wicked', 'wicked', 'The untold story of the witches of Oz', 'eb8f23e0-0d41-4680-99ef-e73eca53388b', '/performers/theater-broadway.jpg'),
  ('Phantom of the Opera', 'phantom-of-the-opera', 'Longest-running Broadway show in history', 'eb8f23e0-0d41-4680-99ef-e73eca53388b', '/performers/theater-stage.jpg'),
  ('Les Misérables', 'les-miserables', 'Epic musical based on Victor Hugos novel', 'eb8f23e0-0d41-4680-99ef-e73eca53388b', '/performers/theater-broadway.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE PERFORMERS (Comedy)
-- =====================================================
INSERT INTO public.performers (name, slug, description, category_id, image_url) VALUES
  ('Kevin Hart', 'kevin-hart', 'Stand-up comedy superstar and actor', 'b1de7928-0416-47f6-81bb-470a3529c69e', '/performers/comedy-mic.jpg'),
  ('Dave Chappelle', 'dave-chappelle', 'Legendary comedian with Netflix specials', 'b1de7928-0416-47f6-81bb-470a3529c69e', '/performers/comedy-mic.jpg'),
  ('Sebastian Maniscalco', 'sebastian-maniscalco', 'Italian-American comedian touring worldwide', 'b1de7928-0416-47f6-81bb-470a3529c69e', '/performers/comedy-mic.jpg'),
  ('Trevor Noah', 'trevor-noah', 'Former Daily Show host on world tour', 'b1de7928-0416-47f6-81bb-470a3529c69e', '/performers/comedy-mic.jpg'),
  ('John Mulaney', 'john-mulaney', 'Emmy-winning comedian and writer', 'b1de7928-0416-47f6-81bb-470a3529c69e', '/performers/comedy-mic.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FEATURED CONFIG
-- =====================================================
INSERT INTO public.featured_config (config_key, config_value) VALUES
  ('homepage_hero', '{"title": "Find Your Next Event", "subtitle": "Tickets to concerts, sports, theater and more", "backgroundImage": "/hero-stadium.jpg"}'),
  ('featured_categories', '["concerts", "sports", "theater", "comedy"]'),
  ('homepage_sections', '{"trending": true, "featured": true, "upcoming": true, "popular": true}')
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;

-- =====================================================
-- STORAGE BUCKETS SETUP
-- Run these in the Supabase SQL Editor after schema setup
-- =====================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('venue-maps', 'venue-maps', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('performer-images', 'performer-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('temp-uploads', 'temp-uploads', true) ON CONFLICT DO NOTHING;

-- =====================================================
-- AUTH TRIGGER SETUP
-- Run this after setting up Supabase Auth
-- =====================================================
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ADMIN USER SETUP
-- After creating a user via Supabase Auth, run:
-- =====================================================
-- INSERT INTO public.user_roles (user_id, role) VALUES ('<your-user-uuid>', 'admin');
