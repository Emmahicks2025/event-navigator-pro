import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Performer to image mapping based on category
const performerImageMap: Record<string, string> = {
  // Pop/mainstream artists
  "Taylor Swift": "/performers/pop-concert.jpg",
  "Harry Styles": "/performers/pop-concert.jpg",
  "Ariana Grande": "/performers/singer-stage.jpg",
  "Billie Eilish": "/performers/pop-concert.jpg",
  "Olivia Rodrigo": "/performers/singer-stage.jpg",
  "Dua Lipa": "/performers/pop-concert.jpg",
  "Justin Bieber": "/performers/pop-concert.jpg",
  "Katy Perry": "/performers/singer-stage.jpg",
  "Lady Gaga": "/performers/singer-stage.jpg",
  "Shawn Mendes": "/performers/pop-concert.jpg",
  "Ed Sheeran": "/performers/concert-generic.jpg",
  "Bruno Mars": "/performers/pop-concert.jpg",
  "The Weeknd": "/performers/pop-concert.jpg",
  "BTS": "/performers/pop-concert.jpg",
  "Twice": "/performers/pop-concert.jpg",
  "Madison Beer": "/performers/singer-stage.jpg",
  "Olivia Dean": "/performers/singer-stage.jpg",
  "New Edition": "/performers/pop-concert.jpg",
  "Brandi Carlile": "/performers/singer-stage.jpg",
  
  // Hip-hop/Rap
  "Drake": "/performers/hip-hop.jpg",
  "Kendrick Lamar": "/performers/hip-hop.jpg",
  "Travis Scott": "/performers/hip-hop.jpg",
  "J. Cole": "/performers/hip-hop.jpg",
  "21 Savage": "/performers/hip-hop.jpg",
  "Lil Baby": "/performers/hip-hop.jpg",
  "Future": "/performers/hip-hop.jpg",
  "Bad Bunny": "/performers/hip-hop.jpg",
  "Cardi B": "/performers/hip-hop.jpg",
  "Megan Thee Stallion": "/performers/hip-hop.jpg",
  "A$AP Rocky": "/performers/hip-hop.jpg",
  "Peso Pluma": "/performers/hip-hop.jpg",
  "A Boogie Wit Da Hoodie": "/performers/hip-hop.jpg",
  "Monaleo": "/performers/hip-hop.jpg",
  "bbno$": "/performers/hip-hop.jpg",
  "Mariah the Scientist": "/performers/hip-hop.jpg",
  "Snow Strippers": "/performers/hip-hop.jpg",
  
  // R&B
  "SZA": "/performers/singer-stage.jpg",
  "Usher": "/performers/singer-stage.jpg",
  "Beyoncé": "/performers/singer-stage.jpg",
  "Doja Cat": "/performers/singer-stage.jpg",
  "Lizzo": "/performers/singer-stage.jpg",
  "Sam Smith": "/performers/singer-stage.jpg",
  
  // Rock/Alternative/Metal
  "Coldplay": "/performers/rock-concert.jpg",
  "U2": "/performers/rock-concert.jpg",
  "Metallica": "/performers/rock-concert.jpg",
  "The Rolling Stones": "/performers/rock-concert.jpg",
  "Foo Fighters": "/performers/rock-concert.jpg",
  "Green Day": "/performers/rock-concert.jpg",
  "Red Hot Chili Peppers": "/performers/rock-concert.jpg",
  "Linkin Park": "/performers/rock-concert.jpg",
  "My Chemical Romance": "/performers/rock-concert.jpg",
  "Imagine Dragons": "/performers/rock-concert.jpg",
  "Arctic Monkeys": "/performers/rock-concert.jpg",
  "The 1975": "/performers/rock-concert.jpg",
  "The Killers": "/performers/rock-concert.jpg",
  "Muse": "/performers/rock-concert.jpg",
  "System of a Down": "/performers/rock-concert.jpg",
  "Slipknot": "/performers/rock-concert.jpg",
  "Panic! At The Disco": "/performers/rock-concert.jpg",
  "Fall Out Boy": "/performers/rock-concert.jpg",
  "Paramore": "/performers/rock-concert.jpg",
  "Blink-182": "/performers/rock-concert.jpg",
  "The Strokes": "/performers/rock-concert.jpg",
  "Tame Impala": "/performers/festival.jpg",
  "Glass Animals": "/performers/festival.jpg",
  "Lorna Shore": "/performers/rock-concert.jpg",
  "Dropkick Murphys": "/performers/rock-concert.jpg",
  "Rob Zombie": "/performers/rock-concert.jpg",
  "Five Finger Death Punch": "/performers/rock-concert.jpg",
  "Journey": "/performers/rock-concert.jpg",
  "Three Dog Night": "/performers/rock-concert.jpg",
  "Avenged Sevenfold": "/performers/rock-concert.jpg",
  "Bring Me The Horizon": "/performers/rock-concert.jpg",
  "A Day To Remember": "/performers/rock-concert.jpg",
  "Pierce The Veil": "/performers/rock-concert.jpg",
  "Sleeping With Sirens": "/performers/rock-concert.jpg",
  "All Time Low": "/performers/rock-concert.jpg",
  "The Black Keys": "/performers/rock-concert.jpg",
  "Cage The Elephant": "/performers/rock-concert.jpg",
  "Kings of Leon": "/performers/rock-concert.jpg",
  "Mumford & Sons": "/performers/rock-concert.jpg",
  "Modest Mouse": "/performers/rock-concert.jpg",
  "MGMT": "/performers/festival.jpg",
  "Vampire Weekend": "/performers/festival.jpg",
  "Young the Giant": "/performers/rock-concert.jpg",
  "Two Door Cinema Club": "/performers/rock-concert.jpg",
  "Phoenix": "/performers/rock-concert.jpg",
  "Foster The People": "/performers/rock-concert.jpg",
  "Bastille": "/performers/rock-concert.jpg",
  "ALT-J": "/performers/festival.jpg",
  "Portugal. The Man": "/performers/festival.jpg",
  
  // Country
  "Chris Stapleton": "/performers/country-music.jpg",
  "Zach Bryan": "/performers/country-music.jpg",
  "Morgan Wallen": "/performers/country-music.jpg",
  "Megan Moroney": "/performers/country-music.jpg",
  "Parker McCollum": "/performers/country-music.jpg",
  "Eric Church": "/performers/country-music.jpg",
  "Rascal Flatts": "/performers/country-music.jpg",
  "Carrie Underwood": "/performers/country-music.jpg",
  "Garth Brooks": "/performers/country-music.jpg",
  "Shania Twain": "/performers/country-music.jpg",
  "Cody Johnson": "/performers/country-music.jpg",
  "Treaty Oak Revival": "/performers/country-music.jpg",
  "Sam Barber": "/performers/country-music.jpg",
  "HARDY": "/performers/country-music.jpg",
  "Scotty McCreery": "/performers/country-music.jpg",
  "Stephen Wilson Jr.": "/performers/country-music.jpg",
  "Alison Krauss": "/performers/country-music.jpg",
  
  // Christian/Gospel
  "Brandon Lake": "/performers/concert-generic.jpg",
  "TobyMac": "/performers/concert-generic.jpg",
  "Forrest Frank": "/performers/concert-generic.jpg",
  
  // EDM/Electronic
  "Illenium": "/performers/edm-lights.jpg",
  "Fred Again": "/performers/edm-lights.jpg",
  "INZO": "/performers/dj-booth.jpg",
  "Pitbull": "/performers/dj-booth.jpg",
  
  // Legends/Classic
  "Elton John": "/performers/piano-concert.jpg",
  "Adele": "/performers/singer-stage.jpg",
  "Celine Dion": "/performers/singer-stage.jpg",
  "The Eagles": "/performers/rock-concert.jpg",
  "James Taylor": "/performers/concert-generic.jpg",
  "John Mellencamp": "/performers/rock-concert.jpg",
  "Barry Manilow": "/performers/piano-concert.jpg",
  "Donny Osmond": "/performers/concert-generic.jpg",
  "Jennifer Lopez": "/performers/singer-stage.jpg",
  "Ricardo Arjona": "/performers/concert-generic.jpg",
  "Tori Amos": "/performers/piano-concert.jpg",
  "Jack Johnson": "/performers/concert-generic.jpg",
  "Alex Warren": "/performers/concert-generic.jpg",
  "The Elovaters": "/performers/concert-generic.jpg",
  "Audrey Hobert": "/performers/concert-generic.jpg",
  "Ty Myers": "/performers/concert-generic.jpg",
  "Charlie Puth": "/performers/pop-concert.jpg",
  "Niall Horan": "/performers/pop-concert.jpg",
  "Lewis Capaldi": "/performers/singer-stage.jpg",
  "Hozier": "/performers/concert-generic.jpg",
  "Florence + The Machine": "/performers/singer-stage.jpg",
  "Machine Gun Kelly": "/performers/rock-concert.jpg",
  
  // Sports
  "World Cup": "/performers/soccer-world-cup.jpg",
  "Monster Jam": "/performers/sports-stadium.jpg",
  "Harlem Globetrotters": "/performers/sports-basketball.jpg",
  "WWE": "/performers/wrestling-ring.jpg",
  "UFC": "/performers/wrestling-ring.jpg",
  "NFR": "/performers/rodeo.jpg",
  "PBR": "/performers/rodeo.jpg",
  "Supercross": "/performers/sports-stadium.jpg",
  "NASCAR": "/performers/sports-stadium.jpg",
  "Fort Worth Rodeo": "/performers/rodeo.jpg",
  "Phoenix Open": "/performers/sports-stadium.jpg",
  "Pac-12 Tournament": "/performers/sports-basketball.jpg",
  "Mountain West": "/performers/sports-basketball.jpg",
  "World Baseball Classic": "/performers/baseball-field.jpg",
  "Heated Rivalry Party": "/performers/sports-stadium.jpg",
  "Festival": "/performers/festival.jpg",
  
  // NFL
  "Chicago Bears": "/performers/sports-football.jpg",
  "Dallas Cowboys": "/performers/sports-football.jpg",
  "NY Giants": "/performers/sports-football.jpg",
  "SF 49ers": "/performers/sports-football.jpg",
  
  // NBA
  "LA Lakers": "/performers/nba-court.jpg",
  "Chicago Bulls": "/performers/nba-court.jpg",
  "Boston Celtics": "/performers/nba-court.jpg",
  "Brooklyn Nets": "/performers/nba-court.jpg",
  "New York Knicks": "/performers/nba-court.jpg",
  "Miami Heat": "/performers/nba-court.jpg",
  "Phoenix Suns": "/performers/nba-court.jpg",
  "Dallas Mavericks": "/performers/nba-court.jpg",
  "Denver Nuggets": "/performers/nba-court.jpg",
  "Atlanta Hawks": "/performers/nba-court.jpg",
  "Houston Rockets": "/performers/nba-court.jpg",
  "Philadelphia 76ers": "/performers/nba-court.jpg",
  
  // NHL
  "Boston Bruins": "/performers/hockey-ice.jpg",
  "Chicago Blackhawks": "/performers/hockey-ice.jpg",
  "New Jersey Devils": "/performers/hockey-ice.jpg",
  "NY Rangers": "/performers/hockey-ice.jpg",
  "Vegas Golden Knights": "/performers/hockey-ice.jpg",
  "Seattle Kraken": "/performers/hockey-ice.jpg",
  
  // MLB
  "New York Yankees": "/performers/baseball-field.jpg",
  "LA Dodgers": "/performers/baseball-field.jpg",
  "Boston Red Sox": "/performers/baseball-field.jpg",
  "Chicago Cubs": "/performers/baseball-field.jpg",
  "Philadelphia Phillies": "/performers/baseball-field.jpg",
  
  // Theater/Broadway
  "Hamilton": "/performers/theater-broadway.jpg",
  "The Lion King": "/performers/theater-broadway.jpg",
  "Wicked": "/performers/theater-broadway.jpg",
  "Phantom of the Opera": "/performers/theater-broadway.jpg",
  "Cirque du Soleil": "/performers/theater-stage.jpg",
  "Disney On Ice": "/performers/theater-stage.jpg",
  "Blue Man Group": "/performers/theater-stage.jpg",
  "Les Misérables": "/performers/theater-broadway.jpg",
  "Harry Potter": "/performers/theater-broadway.jpg",
  "Frozen": "/performers/theater-broadway.jpg",
  "Book of Mormon": "/performers/theater-broadway.jpg",
  "Chicago": "/performers/theater-broadway.jpg",
  "Aladdin": "/performers/theater-broadway.jpg",
  "MJ": "/performers/theater-broadway.jpg",
  "Wizard of Oz": "/performers/theater-broadway.jpg",
  "Some Like It Hot": "/performers/theater-broadway.jpg",
  "Dancing with the Stars": "/performers/event-lights.jpg",
  
  // Comedy
  "Nate Bargatze": "/performers/comedy-mic.jpg",
  "Shane Gillis": "/performers/comedy-mic.jpg",
  "Jo Koy": "/performers/comedy-mic.jpg",
  "Katt Williams": "/performers/comedy-mic.jpg",
  "Matt Rife": "/performers/comedy-mic.jpg",
  "Weird Al Yankovic": "/performers/comedy-mic.jpg",
  "Ali Siddiq": "/performers/comedy-mic.jpg",
  "Flight of the Conchords": "/performers/comedy-mic.jpg",
  
  // Vegas
  "David Copperfield": "/performers/event-lights.jpg",
  "Jabbawockeez": "/performers/event-lights.jpg",
  "Mat Franco": "/performers/event-lights.jpg",
  "Shin Lim": "/performers/event-lights.jpg",
  "Criss Angel": "/performers/event-lights.jpg",
  "Penn and Teller": "/performers/event-lights.jpg",
  "Terry Fator": "/performers/event-lights.jpg",
  "Tournament of Kings": "/performers/event-lights.jpg",
  "Fantasy": "/performers/event-lights.jpg",
  "X Burlesque": "/performers/event-lights.jpg",
  "Chippendales": "/performers/event-lights.jpg",
  "Thunder From Down Under": "/performers/event-lights.jpg",
  "Le Reve": "/performers/event-lights.jpg",
  "Absinthe": "/performers/event-lights.jpg",
};

// Default image by category
const categoryDefaultImages: Record<string, string> = {
  concerts: "/performers/concert-generic.jpg",
  sports: "/performers/sports-stadium.jpg",
  theater: "/performers/theater-stage.jpg",
  comedy: "/performers/comedy-mic.jpg",
};

// Get image for performer
function getPerformerImage(performer: string, category: string): string {
  if (performerImageMap[performer]) return performerImageMap[performer];
  
  // Check partial match
  for (const [key, value] of Object.entries(performerImageMap)) {
    if (performer.includes(key) || key.includes(performer)) return value;
  }
  
  return categoryDefaultImages[category] || "/performers/concert-generic.jpg";
}

// All seed events
interface SeedEvent {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  doors_open_time: string;
  venue_name: string;
  city: string;
  state: string;
  category_slug: string;
  performer_name: string;
  price_from: number;
  price_to: number;
  is_featured: boolean;
  is_active: boolean;
}

const seedEvents: SeedEvent[] = [
  // Nebraska Events
  { title: "Chris Stapleton", description: "Live concert performance by Chris Stapleton", event_date: "2026-10-07", event_time: "19:30", doors_open_time: "18:30", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "Chris Stapleton", price_from: 120, price_to: 500, is_featured: true, is_active: true },
  { title: "Zach Bryan", description: "Live concert performance by Zach Bryan", event_date: "2026-04-25", event_time: "19:00", doors_open_time: "18:00", venue_name: "Nebraska Memorial Stadium", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "Zach Bryan", price_from: 100, price_to: 450, is_featured: true, is_active: true },
  { title: "Treaty Oak Revival", description: "Live concert performance by Treaty Oak Revival", event_date: "2026-07-11", event_time: "19:00", doors_open_time: "18:00", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "Treaty Oak Revival", price_from: 80, price_to: 350, is_featured: false, is_active: true },
  { title: "Megan Moroney", description: "Live concert performance by Megan Moroney", event_date: "2026-07-26", event_time: "19:00", doors_open_time: "18:00", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "Megan Moroney", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Brandon Lake", description: "Live concert performance by Brandon Lake", event_date: "2026-04-11", event_time: "19:00", doors_open_time: "18:00", venue_name: "CHI Health Center Omaha", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Brandon Lake", price_from: 65, price_to: 280, is_featured: false, is_active: true },
  { title: "Parker McCollum", description: "Live concert performance by Parker McCollum", event_date: "2026-08-01", event_time: "19:30", doors_open_time: "18:30", venue_name: "CHI Health Center Omaha", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Parker McCollum", price_from: 90, price_to: 380, is_featured: false, is_active: true },
  { title: "Eric Church", description: "Live concert performance by Eric Church", event_date: "2026-02-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "CHI Health Center Omaha", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Eric Church", price_from: 110, price_to: 420, is_featured: true, is_active: true },
  { title: "Journey", description: "Live concert performance by Journey", event_date: "2026-04-09", event_time: "19:30", doors_open_time: "18:30", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "Journey", price_from: 95, price_to: 400, is_featured: false, is_active: true },
  { title: "Monaleo", description: "Live concert performance by Monaleo", event_date: "2026-01-31", event_time: "20:00", doors_open_time: "19:00", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "Monaleo", price_from: 55, price_to: 200, is_featured: false, is_active: true },
  { title: "TobyMac", description: "Live concert performance by TobyMac", event_date: "2026-03-19", event_time: "19:00", doors_open_time: "18:00", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "TobyMac", price_from: 60, price_to: 250, is_featured: false, is_active: true },
  // New York Events
  { title: "Harry Styles", description: "Live concert performance by Harry Styles", event_date: "2026-09-02", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Harry Styles", price_from: 130, price_to: 580, is_featured: true, is_active: true },
  { title: "Brazil vs Morocco - World Cup", description: "FIFA World Cup Match 7 Group C", event_date: "2026-06-13", event_time: "18:00", doors_open_time: "17:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 200, price_to: 800, is_featured: true, is_active: true },
  { title: "Argentina vs Uruguay - World Cup", description: "FIFA World Cup Match 12 Group D", event_date: "2026-06-15", event_time: "15:00", doors_open_time: "14:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 220, price_to: 850, is_featured: true, is_active: true },
  { title: "World Cup Final", description: "FIFA World Cup 2026 Final", event_date: "2026-07-19", event_time: "18:00", doors_open_time: "15:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 800, price_to: 5000, is_featured: true, is_active: true },
  { title: "Cardi B", description: "Live concert performance by Cardi B", event_date: "2026-04-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Cardi B", price_from: 120, price_to: 520, is_featured: true, is_active: true },
  { title: "Twice", description: "Live K-Pop concert performance by Twice", event_date: "2026-05-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "Twice", price_from: 140, price_to: 650, is_featured: true, is_active: true },
  { title: "Hamilton", description: "Broadway musical Hamilton", event_date: "2026-01-27", event_time: "19:00", doors_open_time: "18:00", venue_name: "Richard Rodgers Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Hamilton", price_from: 125, price_to: 500, is_featured: true, is_active: true },
  { title: "The Lion King", description: "Disney's The Lion King Broadway musical", event_date: "2026-01-27", event_time: "19:00", doors_open_time: "18:00", venue_name: "Minskoff Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "The Lion King", price_from: 110, price_to: 445, is_featured: true, is_active: true },
  // Los Angeles Events
  { title: "Lady Gaga", description: "Live concert performance by Lady Gaga", event_date: "2026-02-23", event_time: "20:00", doors_open_time: "19:00", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Lady Gaga", price_from: 135, price_to: 590, is_featured: true, is_active: true },
  { title: "BTS LA", description: "Live K-Pop concert performance by BTS", event_date: "2026-07-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "BTS", price_from: 175, price_to: 850, is_featured: true, is_active: true },
  { title: "Bruno Mars LA", description: "Live concert performance by Bruno Mars", event_date: "2026-06-06", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Bruno Mars", price_from: 145, price_to: 680, is_featured: true, is_active: true },
  { title: "Billie Eilish", description: "Live concert performance by Billie Eilish", event_date: "2026-06-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Billie Eilish", price_from: 125, price_to: 570, is_featured: true, is_active: true },
  { title: "The Weeknd", description: "Live concert performance by The Weeknd", event_date: "2026-08-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "The Weeknd", price_from: 138, price_to: 640, is_featured: true, is_active: true },
  { title: "Kendrick Lamar", description: "Live concert performance by Kendrick Lamar", event_date: "2026-09-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Kendrick Lamar", price_from: 140, price_to: 650, is_featured: true, is_active: true },
  // Chicago Events  
  { title: "BTS Chicago", description: "Live K-Pop concert performance by BTS", event_date: "2026-08-27", event_time: "20:00", doors_open_time: "19:00", venue_name: "Soldier Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "BTS", price_from: 155, price_to: 720, is_featured: true, is_active: true },
  { title: "Bruno Mars Chicago", description: "Live concert performance by Bruno Mars", event_date: "2026-05-17", event_time: "19:30", doors_open_time: "18:30", venue_name: "Soldier Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Bruno Mars", price_from: 120, price_to: 575, is_featured: true, is_active: true },
  { title: "Post Malone", description: "Live concert performance by Post Malone", event_date: "2026-08-10", event_time: "20:00", doors_open_time: "19:00", venue_name: "Soldier Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Post Malone", price_from: 110, price_to: 480, is_featured: true, is_active: true },
  { title: "Chicago Bulls vs Boston Celtics", description: "NBA Regular Season Game", event_date: "2026-02-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "sports", performer_name: "Chicago Bulls", price_from: 90, price_to: 450, is_featured: false, is_active: true },
  { title: "Foo Fighters", description: "Live concert performance by Foo Fighters", event_date: "2026-07-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Foo Fighters", price_from: 110, price_to: 480, is_featured: true, is_active: true },
  { title: "Green Day", description: "Live concert performance by Green Day", event_date: "2026-07-30", event_time: "19:30", doors_open_time: "18:30", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Green Day", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  // Boston Events
  { title: "Taylor Swift Boston", description: "Live concert performance by Taylor Swift", event_date: "2026-06-15", event_time: "19:00", doors_open_time: "18:00", venue_name: "Gillette Stadium", city: "Foxborough", state: "MA", category_slug: "concerts", performer_name: "Taylor Swift", price_from: 180, price_to: 950, is_featured: true, is_active: true },
  { title: "Red Hot Chili Peppers", description: "Live concert performance by Red Hot Chili Peppers", event_date: "2026-09-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "Gillette Stadium", city: "Foxborough", state: "MA", category_slug: "concerts", performer_name: "Red Hot Chili Peppers", price_from: 120, price_to: 540, is_featured: true, is_active: true },
  { title: "Boston Celtics vs LA Lakers", description: "NBA Regular Season Game", event_date: "2026-03-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "TD Garden", city: "Boston", state: "MA", category_slug: "sports", performer_name: "Boston Celtics", price_from: 120, price_to: 650, is_featured: false, is_active: true },
  // Miami Events
  { title: "Drake Miami", description: "Live concert performance by Drake", event_date: "2026-07-22", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "Drake", price_from: 145, price_to: 680, is_featured: true, is_active: true },
  { title: "Bad Bunny Miami", description: "Live concert performance by Bad Bunny", event_date: "2026-05-10", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "Bad Bunny", price_from: 152, price_to: 710, is_featured: true, is_active: true },
  { title: "Imagine Dragons", description: "Live concert performance by Imagine Dragons", event_date: "2026-07-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "Imagine Dragons", price_from: 95, price_to: 420, is_featured: true, is_active: true },
  // Atlanta Events
  { title: "Beyoncé Atlanta", description: "Live concert performance by Beyoncé", event_date: "2026-09-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Beyoncé", price_from: 220, price_to: 980, is_featured: true, is_active: true },
  { title: "Travis Scott", description: "Live concert performance by Travis Scott", event_date: "2026-06-20", event_time: "20:00", doors_open_time: "19:00", venue_name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Travis Scott", price_from: 135, price_to: 620, is_featured: true, is_active: true },
  // Houston Events
  { title: "Travis Scott Houston", description: "Live concert performance by Travis Scott", event_date: "2026-06-22", event_time: "20:00", doors_open_time: "19:00", venue_name: "NRG Stadium", city: "Houston", state: "TX", category_slug: "concerts", performer_name: "Travis Scott", price_from: 130, price_to: 600, is_featured: true, is_active: true },
  { title: "Megan Thee Stallion", description: "Live concert performance by Megan Thee Stallion", event_date: "2026-07-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "NRG Stadium", city: "Houston", state: "TX", category_slug: "concerts", performer_name: "Megan Thee Stallion", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  // Dallas Events
  { title: "Coldplay Dallas", description: "Live concert performance by Coldplay", event_date: "2026-08-20", event_time: "20:00", doors_open_time: "19:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "concerts", performer_name: "Coldplay", price_from: 135, price_to: 620, is_featured: true, is_active: true },
  { title: "Metallica", description: "Live concert performance by Metallica", event_date: "2026-08-28", event_time: "19:00", doors_open_time: "17:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "concerts", performer_name: "Metallica", price_from: 150, price_to: 700, is_featured: true, is_active: true },
  { title: "WWE WrestleMania", description: "WWE WrestleMania Championship Event", event_date: "2026-04-05", event_time: "17:00", doors_open_time: "14:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "sports", performer_name: "WWE", price_from: 75, price_to: 800, is_featured: true, is_active: true },
  // Phoenix Events
  { title: "Super Bowl LX", description: "NFL Super Bowl LX Championship", event_date: "2026-02-08", event_time: "18:30", doors_open_time: "14:00", venue_name: "State Farm Stadium", city: "Glendale", state: "AZ", category_slug: "sports", performer_name: "Dallas Cowboys", price_from: 2500, price_to: 15000, is_featured: true, is_active: true },
  // Las Vegas Events
  { title: "UFC 300", description: "UFC Championship Fight Night", event_date: "2026-04-13", event_time: "19:00", doors_open_time: "17:00", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "UFC", price_from: 200, price_to: 1500, is_featured: true, is_active: true },
  { title: "National Finals Rodeo", description: "NFR Championship Finals", event_date: "2026-12-05", event_time: "18:45", doors_open_time: "17:00", venue_name: "Thomas & Mack Center", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "NFR", price_from: 150, price_to: 800, is_featured: true, is_active: true },
  { title: "The Eagles Vegas", description: "Live concert performance by The Eagles", event_date: "2026-10-03", event_time: "20:00", doors_open_time: "19:00", venue_name: "MSG Sphere", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "The Eagles", price_from: 175, price_to: 800, is_featured: true, is_active: true },
  { title: "Adele Residency", description: "Adele's Las Vegas residency show", event_date: "2026-06-07", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Colosseum at Caesars Palace", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Adele", price_from: 280, price_to: 1200, is_featured: true, is_active: true },
  { title: "U2 at Sphere", description: "U2 UV Achtung Baby Live at Sphere", event_date: "2026-03-15", event_time: "20:30", doors_open_time: "19:00", venue_name: "MSG Sphere", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "U2", price_from: 195, price_to: 950, is_featured: true, is_active: true },
  { title: "Garth Brooks Residency", description: "Garth Brooks Las Vegas residency", event_date: "2026-06-21", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Colosseum at Caesars Palace", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Garth Brooks", price_from: 150, price_to: 600, is_featured: true, is_active: true },
  // More featured events
  { title: "Ariana Grande World Tour", description: "Live concert performance by Ariana Grande", event_date: "2026-06-30", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Ariana Grande", price_from: 130, price_to: 590, is_featured: true, is_active: true },
  { title: "Ed Sheeran", description: "Live concert performance by Ed Sheeran", event_date: "2026-07-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "Ed Sheeran", price_from: 115, price_to: 520, is_featured: true, is_active: true },
  { title: "Dua Lipa", description: "Live concert performance by Dua Lipa", event_date: "2026-05-15", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Dua Lipa", price_from: 125, price_to: 560, is_featured: true, is_active: true },
  { title: "The Rolling Stones", description: "Live concert performance by The Rolling Stones", event_date: "2026-10-10", event_time: "20:00", doors_open_time: "19:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "The Rolling Stones", price_from: 200, price_to: 900, is_featured: true, is_active: true },
  { title: "J. Cole", description: "Live concert performance by J. Cole", event_date: "2026-07-15", event_time: "20:00", doors_open_time: "19:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "J. Cole", price_from: 125, price_to: 560, is_featured: true, is_active: true },
  { title: "My Chemical Romance Reunion", description: "MCR Reunion Tour", event_date: "2026-09-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "My Chemical Romance", price_from: 130, price_to: 580, is_featured: true, is_active: true },
  { title: "SZA SOS Tour", description: "Live concert performance by SZA", event_date: "2026-06-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "SZA", price_from: 115, price_to: 500, is_featured: true, is_active: true },
  { title: "Wicked Broadway", description: "Broadway musical Wicked", event_date: "2026-02-20", event_time: "19:00", doors_open_time: "18:00", venue_name: "Gershwin Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Wicked", price_from: 130, price_to: 550, is_featured: true, is_active: true },
  { title: "Elton John Farewell", description: "Elton John Farewell Yellow Brick Road Tour", event_date: "2026-04-26", event_time: "20:00", doors_open_time: "19:00", venue_name: "Dodger Stadium", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Elton John", price_from: 175, price_to: 850, is_featured: true, is_active: true },
  { title: "Morgan Wallen Nashville", description: "Live concert performance by Morgan Wallen", event_date: "2026-06-01", event_time: "19:30", doors_open_time: "18:30", venue_name: "Nissan Stadium", city: "Nashville", state: "TN", category_slug: "concerts", performer_name: "Morgan Wallen", price_from: 130, price_to: 580, is_featured: true, is_active: true },
  { title: "Linkin Park", description: "Live concert performance by Linkin Park", event_date: "2026-11-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Linkin Park", price_from: 130, price_to: 580, is_featured: true, is_active: true },
  { title: "Katy Perry", description: "Live concert performance by Katy Perry", event_date: "2026-08-08", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Katy Perry", price_from: 115, price_to: 520, is_featured: true, is_active: true },
  { title: "Justin Bieber", description: "Live concert performance by Justin Bieber", event_date: "2026-09-25", event_time: "20:00", doors_open_time: "19:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "Justin Bieber", price_from: 140, price_to: 650, is_featured: true, is_active: true },
  // Denver Events
  { title: "Tame Impala", description: "Live concert performance by Tame Impala", event_date: "2026-06-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Tame Impala", price_from: 95, price_to: 400, is_featured: false, is_active: true },
  { title: "MGMT", description: "Live concert performance by MGMT", event_date: "2026-06-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "MGMT", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Mumford & Sons", description: "Live concert performance by Mumford & Sons", event_date: "2026-07-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Mumford & Sons", price_from: 90, price_to: 400, is_featured: false, is_active: true },
  // More events across different cities
  { title: "Nate Bargatze", description: "Live comedy show by Nate Bargatze", event_date: "2026-03-14", event_time: "20:00", doors_open_time: "19:00", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "comedy", performer_name: "Nate Bargatze", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "Shane Gillis", description: "Live comedy show by Shane Gillis", event_date: "2026-03-21", event_time: "20:00", doors_open_time: "19:00", venue_name: "Chicago Theatre", city: "Chicago", state: "IL", category_slug: "comedy", performer_name: "Shane Gillis", price_from: 60, price_to: 220, is_featured: false, is_active: true },
  { title: "Matt Rife", description: "Live comedy show by Matt Rife", event_date: "2026-04-11", event_time: "20:00", doors_open_time: "19:00", venue_name: "Fillmore Miami Beach", city: "Miami Beach", state: "FL", category_slug: "comedy", performer_name: "Matt Rife", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "Jo Koy", description: "Live comedy show by Jo Koy", event_date: "2026-04-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Wang Theatre", city: "Boston", state: "MA", category_slug: "comedy", performer_name: "Jo Koy", price_from: 65, price_to: 220, is_featured: false, is_active: true },
  { title: "Katt Williams", description: "Live comedy show by Katt Williams", event_date: "2026-03-28", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Met Philadelphia", city: "Philadelphia", state: "PA", category_slug: "comedy", performer_name: "Katt Williams", price_from: 70, price_to: 300, is_featured: false, is_active: true },
  // More sports
  { title: "LA Lakers vs Golden State Warriors", description: "NBA Western Conference Rivalry", event_date: "2026-03-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Crypto.com Arena", city: "Los Angeles", state: "CA", category_slug: "sports", performer_name: "LA Lakers", price_from: 175, price_to: 900, is_featured: true, is_active: true },
  { title: "UFC 305", description: "UFC Championship Event", event_date: "2026-08-08", event_time: "18:00", doors_open_time: "16:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "sports", performer_name: "UFC", price_from: 175, price_to: 1200, is_featured: true, is_active: true },
  { title: "PBR World Finals", description: "PBR World Championship Finals", event_date: "2026-11-05", event_time: "19:00", doors_open_time: "17:00", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "PBR", price_from: 100, price_to: 600, is_featured: true, is_active: true },
  // More rock concerts
  { title: "Arctic Monkeys", description: "Live concert performance by Arctic Monkeys", event_date: "2026-06-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Arctic Monkeys", price_from: 110, price_to: 480, is_featured: false, is_active: true },
  { title: "The 1975", description: "Live concert performance by The 1975", event_date: "2026-05-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "The 1975", price_from: 95, price_to: 400, is_featured: false, is_active: true },
  { title: "The Killers", description: "Live concert performance by The Killers", event_date: "2026-09-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "The Killers", price_from: 100, price_to: 450, is_featured: false, is_active: true },
  { title: "Muse", description: "Live concert performance by Muse", event_date: "2026-10-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Muse", price_from: 110, price_to: 500, is_featured: false, is_active: true },
  { title: "Blink-182", description: "Live concert performance by Blink-182", event_date: "2026-08-02", event_time: "19:00", doors_open_time: "18:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Blink-182", price_from: 105, price_to: 460, is_featured: false, is_active: true },
  { title: "Paramore", description: "Live concert performance by Paramore", event_date: "2026-06-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Paramore", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Fall Out Boy", description: "Live concert performance by Fall Out Boy", event_date: "2026-08-18", event_time: "19:00", doors_open_time: "18:00", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Fall Out Boy", price_from: 90, price_to: 400, is_featured: false, is_active: true },
  { title: "Panic! At The Disco", description: "Live concert performance by Panic! At The Disco", event_date: "2026-04-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Panic! At The Disco", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  // More hip hop
  { title: "21 Savage", description: "Live concert performance by 21 Savage", event_date: "2026-05-08", event_time: "20:00", doors_open_time: "19:00", venue_name: "State Farm Arena", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "21 Savage", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Lil Baby", description: "Live concert performance by Lil Baby", event_date: "2026-06-12", event_time: "20:00", doors_open_time: "19:00", venue_name: "State Farm Arena", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Lil Baby", price_from: 100, price_to: 450, is_featured: false, is_active: true },
  { title: "Future", description: "Live concert performance by Future", event_date: "2026-08-22", event_time: "20:00", doors_open_time: "19:00", venue_name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Future", price_from: 110, price_to: 500, is_featured: false, is_active: true },
  { title: "Doja Cat", description: "Live concert performance by Doja Cat", event_date: "2026-05-30", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Doja Cat", price_from: 105, price_to: 480, is_featured: false, is_active: true },
  { title: "Lizzo", description: "Live concert performance by Lizzo", event_date: "2026-08-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Lizzo", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  // Broadway shows
  { title: "Book of Mormon", description: "Broadway musical The Book of Mormon", event_date: "2026-03-01", event_time: "19:00", doors_open_time: "18:00", venue_name: "Eugene O'Neill Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Book of Mormon", price_from: 100, price_to: 400, is_featured: false, is_active: true },
  { title: "Les Misérables", description: "Broadway musical Les Misérables", event_date: "2026-03-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Imperial Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Les Misérables", price_from: 90, price_to: 350, is_featured: false, is_active: true },
  { title: "Phantom of the Opera", description: "Broadway musical Phantom of the Opera", event_date: "2026-03-10", event_time: "19:30", doors_open_time: "18:30", venue_name: "Boston Opera House", city: "Boston", state: "MA", category_slug: "theater", performer_name: "Phantom of the Opera", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Frozen Broadway", description: "Disney's Frozen Broadway musical", event_date: "2026-04-12", event_time: "19:00", doors_open_time: "18:00", venue_name: "St. James Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Frozen", price_from: 100, price_to: 380, is_featured: false, is_active: true },
  { title: "Cirque du Soleil - O", description: "Cirque du Soleil water show O", event_date: "2026-02-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bellagio Theatre", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Cirque du Soleil", price_from: 125, price_to: 350, is_featured: false, is_active: true },
  // More Vegas shows
  { title: "Blue Man Group", description: "Blue Man Group Las Vegas show", event_date: "2026-02-15", event_time: "19:00", doors_open_time: "18:00", venue_name: "Luxor Hotel", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Blue Man Group", price_from: 75, price_to: 200, is_featured: false, is_active: true },
  { title: "Shania Twain Residency", description: "Shania Twain Las Vegas residency", event_date: "2026-05-09", event_time: "20:00", doors_open_time: "19:00", venue_name: "Planet Hollywood Resort", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Shania Twain", price_from: 120, price_to: 480, is_featured: false, is_active: true },
  { title: "Usher Residency", description: "Usher My Way Las Vegas Residency", event_date: "2026-04-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Park MGM", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Usher", price_from: 130, price_to: 520, is_featured: false, is_active: true },
  // More events
  { title: "Glass Animals", description: "Live concert performance by Glass Animals", event_date: "2026-05-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "The Greek Theatre", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Glass Animals", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "Florence + The Machine", description: "Live concert performance by Florence + The Machine", event_date: "2026-09-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Florence + The Machine", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Hozier", description: "Live concert performance by Hozier", event_date: "2026-05-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Hozier", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "The Black Keys", description: "Live concert performance by The Black Keys", event_date: "2026-09-10", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "The Black Keys", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Cage The Elephant", description: "Live concert performance by Cage The Elephant", event_date: "2026-08-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "The Greek Theatre", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Cage The Elephant", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "The Strokes", description: "Live concert performance by The Strokes", event_date: "2026-10-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "The Strokes", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Sam Smith", description: "Live concert performance by Sam Smith", event_date: "2026-04-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Sam Smith", price_from: 90, price_to: 400, is_featured: false, is_active: true },
  { title: "Shawn Mendes", description: "Live concert performance by Shawn Mendes", event_date: "2026-07-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Shawn Mendes", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Charlie Puth", description: "Live concert performance by Charlie Puth", event_date: "2026-04-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Charlie Puth", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Niall Horan", description: "Live concert performance by Niall Horan", event_date: "2026-06-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Niall Horan", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Lewis Capaldi", description: "Live concert performance by Lewis Capaldi", event_date: "2026-03-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Lewis Capaldi", price_from: 80, price_to: 320, is_featured: false, is_active: true },
  { title: "Machine Gun Kelly", description: "Live concert performance by Machine Gun Kelly", event_date: "2026-07-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Machine Gun Kelly", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Kings of Leon", description: "Live concert performance by Kings of Leon", event_date: "2026-09-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bridgestone Arena", city: "Nashville", state: "TN", category_slug: "concerts", performer_name: "Kings of Leon", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Carrie Underwood", description: "Live concert performance by Carrie Underwood", event_date: "2026-07-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bridgestone Arena", city: "Nashville", state: "TN", category_slug: "concerts", performer_name: "Carrie Underwood", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Jennifer Lopez", description: "Live concert performance by Jennifer Lopez", event_date: "2026-05-30", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Jennifer Lopez", price_from: 125, price_to: 580, is_featured: false, is_active: true },
  { title: "Slipknot", description: "Live concert performance by Slipknot", event_date: "2026-10-15", event_time: "19:00", doors_open_time: "17:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Slipknot", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "System of a Down", description: "Live concert performance by System of a Down", event_date: "2026-10-22", event_time: "19:30", doors_open_time: "18:00", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "System of a Down", price_from: 95, price_to: 420, is_featured: false, is_active: true },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting seed process...");
    console.log(`Total events to seed: ${seedEvents.length}`);

    const results = {
      venues: { created: 0, existing: 0, errors: 0 },
      performers: { created: 0, existing: 0, errors: 0 },
      events: { created: 0, existing: 0, errors: 0 },
    };

    // Get existing categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug");
    
    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || []);
    console.log(`Found ${categoryMap.size} categories`);

    // Extract unique venues
    const uniqueVenues = new Map<string, { name: string; city: string; state: string }>();
    seedEvents.forEach(event => {
      const key = `${event.venue_name}-${event.city}-${event.state}`;
      if (!uniqueVenues.has(key)) {
        uniqueVenues.set(key, { name: event.venue_name, city: event.city, state: event.state });
      }
    });
    console.log(`Found ${uniqueVenues.size} unique venues to seed`);

    // Seed venues in batch
    const venueInserts = [];
    for (const venue of uniqueVenues.values()) {
      const { data: existing } = await supabase
        .from("venues")
        .select("id")
        .eq("name", venue.name)
        .eq("city", venue.city)
        .single();

      if (!existing) {
        venueInserts.push(venue);
      } else {
        results.venues.existing++;
      }
    }

    if (venueInserts.length > 0) {
      const { error: venueError } = await supabase
        .from("venues")
        .insert(venueInserts);
      
      if (venueError) {
        console.error("Error inserting venues:", venueError);
        results.venues.errors = venueInserts.length;
      } else {
        results.venues.created = venueInserts.length;
      }
    }
    console.log(`Venues: ${results.venues.created} created, ${results.venues.existing} existing`);

    // Get venues map
    const { data: allVenues } = await supabase.from("venues").select("id, name, city");
    const venueMap = new Map(allVenues?.map(v => [`${v.name}-${v.city}`, v.id]) || []);

    // Extract unique performers
    const uniquePerformers = new Map<string, { name: string; category: string }>();
    seedEvents.forEach(event => {
      if (!uniquePerformers.has(event.performer_name)) {
        uniquePerformers.set(event.performer_name, { 
          name: event.performer_name, 
          category: event.category_slug 
        });
      }
    });
    console.log(`Found ${uniquePerformers.size} unique performers to seed`);

    // Seed performers in batch
    const performerInserts = [];
    for (const performer of uniquePerformers.values()) {
      const { data: existing } = await supabase
        .from("performers")
        .select("id")
        .eq("name", performer.name)
        .single();

      if (!existing) {
        const imageUrl = getPerformerImage(performer.name, performer.category);
        const categoryId = categoryMap.get(performer.category);
        
        performerInserts.push({
          name: performer.name,
          image_url: imageUrl,
          category_id: categoryId,
          slug: performer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        });
      } else {
        results.performers.existing++;
      }
    }

    if (performerInserts.length > 0) {
      const { error: performerError } = await supabase
        .from("performers")
        .insert(performerInserts);
      
      if (performerError) {
        console.error("Error inserting performers:", performerError);
        results.performers.errors = performerInserts.length;
      } else {
        results.performers.created = performerInserts.length;
      }
    }
    console.log(`Performers: ${results.performers.created} created, ${results.performers.existing} existing`);

    // Get performers map
    const { data: allPerformers } = await supabase.from("performers").select("id, name");
    const performerMap = new Map(allPerformers?.map(p => [p.name, p.id]) || []);

    // Seed events in batches
    const batchSize = 50;
    for (let i = 0; i < seedEvents.length; i += batchSize) {
      const batch = seedEvents.slice(i, i + batchSize);
      const eventInserts = [];

      for (const event of batch) {
        const venueKey = `${event.venue_name}-${event.city}`;
        const venueId = venueMap.get(venueKey);
        const performerId = performerMap.get(event.performer_name);
        const categoryId = categoryMap.get(event.category_slug);
        const imageUrl = getPerformerImage(event.performer_name, event.category_slug);

        // Check if event exists
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .eq("title", event.title)
          .eq("event_date", event.event_date)
          .single();

        if (!existing) {
          eventInserts.push({
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            event_time: event.event_time,
            doors_open_time: event.doors_open_time,
            venue_id: venueId,
            performer_id: performerId,
            category_id: categoryId,
            image_url: imageUrl,
            price_from: event.price_from,
            price_to: event.price_to,
            is_featured: event.is_featured,
            is_active: event.is_active,
          });
        } else {
          results.events.existing++;
        }
      }

      if (eventInserts.length > 0) {
        const { error: eventError } = await supabase
          .from("events")
          .insert(eventInserts);
        
        if (eventError) {
          console.error(`Error inserting events batch ${i}:`, eventError);
          results.events.errors += eventInserts.length;
        } else {
          results.events.created += eventInserts.length;
        }
      }
      
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(seedEvents.length/batchSize)}`);
    }

    console.log("Seed complete!", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Seed data complete",
        results,
        totalEventsSeeded: seedEvents.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Seed error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
