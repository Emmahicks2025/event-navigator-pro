-- Add missing venues for the 23 unassigned events

-- Racing/Motorsports venues
INSERT INTO venues (name, city, state, country, capacity) VALUES
  ('Buttermilk Mountain', 'Aspen', 'CO', 'USA', 15000),
  ('Daytona International Speedway', 'Daytona Beach', 'FL', 'USA', 101500),
  ('Indianapolis Motor Speedway', 'Indianapolis', 'IN', 'USA', 257325),
  ('Churchill Downs', 'Louisville', 'KY', 'USA', 170000);

-- Broadway/Theater venues
INSERT INTO venues (name, city, state, country, capacity) VALUES
  ('Astor Place Theatre', 'New York', 'NY', 'USA', 287),
  ('Al Hirschfeld Theatre', 'New York', 'NY', 'USA', 1437),
  ('Broadhurst Theatre', 'New York', 'NY', 'USA', 1218),
  ('Walter Kerr Theatre', 'New York', 'NY', 'USA', 975),
  ('Gerald Schoenfeld Theatre', 'New York', 'NY', 'USA', 1079),
  ('Winter Garden Theatre', 'New York', 'NY', 'USA', 1526);

-- Sports venues
INSERT INTO venues (name, city, state, country, capacity) VALUES
  ('Augusta National Golf Club', 'Augusta', 'GA', 'USA', 40000),
  ('PPG Paints Arena', 'Pittsburgh', 'PA', 'USA', 18387),
  ('Busch Stadium', 'St. Louis', 'MO', 'USA', 45494),
  ('Oracle Park', 'San Francisco', 'CA', 'USA', 41915),
  ('Highmark Stadium', 'Orchard Park', 'NY', 'USA', 71608),
  ('Caesars Superdome', 'New Orleans', 'LA', 'USA', 73208),
  ('All England Lawn Tennis Club', 'London', 'England', 'UK', 15000);

-- Concert venues
INSERT INTO venues (name, city, state, country, capacity) VALUES
  ('KFC Yum! Center', 'Louisville', 'KY', 'USA', 22090);

-- Cirque du Soleil Big Top (touring, use generic location)
INSERT INTO venues (name, city, state, country, capacity) VALUES
  ('Big Top - Cirque du Soleil', 'Various', 'NA', 'USA', 2500);