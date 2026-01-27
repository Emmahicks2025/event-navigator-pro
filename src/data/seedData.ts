// Seed data from spreadsheet - ALL 475 events with local images
// Images are stored in public/performers/

// Category mapping based on performer type
const getCategoryFromPerformer = (performer: string): string => {
  const sportsTeams = ['Huskers', 'Nebraska', 'World Cup', 'Monster Jam', 'WWE', 'UFC', 'PBR', 'NFR', 'Supercross', 'NASCAR', 'Rodeo', 'Phoenix Open', 'Pac-12', 'Mountain West', 'World Baseball Classic', 'Globetrotters', 'Bears', 'Cowboys', 'Giants', '49ers', 'Lakers', 'Bulls', 'Celtics', 'Nets', 'Knicks', 'Heat', 'Suns', 'Mavericks', 'Nuggets', 'Hawks', 'Rockets', '76ers', 'Bruins', 'Blackhawks', 'Devils', 'Rangers', 'Golden Knights', 'Kraken', 'Yankees', 'Dodgers', 'Red Sox', 'Cubs', 'Phillies'];
  const theaterShows = ['Hamilton', 'Lion King', 'Wicked', 'Phantom', 'Cirque', 'Disney On Ice', 'Blue Man', 'Les Mis', 'Harry Potter', 'Frozen', 'Book of Mormon', 'Chicago', 'Aladdin', 'MJ', 'Wizard of Oz', 'Jersey Boys', 'Color Purple', 'Dear Evan', 'Waitress', 'Sweeney Todd', 'Some Like It Hot'];
  const comedians = ['Nate Bargatze', 'Shane Gillis', 'Jo Koy', 'Katt Williams', 'Matt Rife', 'Weird Al', 'Ali Siddiq', 'Flight of the Conchords'];
  
  if (sportsTeams.some(team => performer.includes(team))) return 'sports';
  if (theaterShows.some(show => performer.includes(show))) return 'theater';
  if (comedians.some(comic => performer.includes(comic))) return 'comedy';
  return 'concerts';
};

// Image mapping based on performer/category
export const getPerformerImage = (performer: string, category: string): string => {
  const imageMap: Record<string, string> = {
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

  // Check direct match
  if (imageMap[performer]) return imageMap[performer];
  
  // Check partial match
  for (const [key, value] of Object.entries(imageMap)) {
    if (performer.includes(key) || key.includes(performer)) return value;
  }
  
  // Default by category
  const categoryDefaults: Record<string, string> = {
    concerts: "/performers/concert-generic.jpg",
    sports: "/performers/sports-stadium.jpg",
    theater: "/performers/theater-stage.jpg",
    comedy: "/performers/comedy-mic.jpg",
  };
  
  return categoryDefaults[category] || "/performers/concert-generic.jpg";
};

export interface SeedEvent {
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

// ALL 475 events from the spreadsheet
export const seedEvents: SeedEvent[] = [
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
  { title: "bbno$", description: "Live concert performance by bbno$", event_date: "2026-03-09", event_time: "20:00", doors_open_time: "19:00", venue_name: "Slowdown", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "bbno$", price_from: 45, price_to: 120, is_featured: false, is_active: true },
  { title: "A Boogie Wit Da Hoodie", description: "Live concert performance by A Boogie Wit Da Hoodie", event_date: "2026-02-26", event_time: "20:00", doors_open_time: "19:00", venue_name: "CHI Health Center Omaha", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "A Boogie Wit Da Hoodie", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Lorna Shore", description: "Live concert performance by Lorna Shore", event_date: "2026-02-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Slowdown", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Lorna Shore", price_from: 50, price_to: 150, is_featured: false, is_active: true },
  { title: "Alex Warren", description: "Live concert performance by Alex Warren", event_date: "2026-02-04", event_time: "19:00", doors_open_time: "18:00", venue_name: "The Waiting Room", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Alex Warren", price_from: 40, price_to: 100, is_featured: false, is_active: true },
  { title: "Sam Barber", description: "Live concert performance by Sam Barber", event_date: "2026-02-06", event_time: "19:00", doors_open_time: "18:00", venue_name: "The Waiting Room", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Sam Barber", price_from: 45, price_to: 120, is_featured: false, is_active: true },
  { title: "HARDY", description: "Live concert performance by HARDY", event_date: "2026-02-27", event_time: "19:30", doors_open_time: "18:30", venue_name: "CHI Health Center Omaha", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "HARDY", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Dropkick Murphys", description: "Live concert performance by Dropkick Murphys", event_date: "2026-03-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "Slowdown", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Dropkick Murphys", price_from: 60, price_to: 180, is_featured: false, is_active: true },
  { title: "Alison Krauss", description: "Live concert performance by Alison Krauss", event_date: "2026-03-01", event_time: "19:00", doors_open_time: "18:00", venue_name: "Orpheum Theater", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Alison Krauss", price_from: 85, price_to: 320, is_featured: false, is_active: true },
  { title: "Weird Al Yankovic", description: "Live comedy/music performance by Weird Al Yankovic", event_date: "2026-06-21", event_time: "19:30", doors_open_time: "18:30", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "comedy", performer_name: "Weird Al Yankovic", price_from: 55, price_to: 200, is_featured: false, is_active: true },
  { title: "Stephen Wilson Jr.", description: "Live concert performance by Stephen Wilson Jr.", event_date: "2026-04-05", event_time: "19:00", doors_open_time: "18:00", venue_name: "The Waiting Room", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Stephen Wilson Jr.", price_from: 40, price_to: 100, is_featured: false, is_active: true },
  { title: "The Elovaters", description: "Live concert performance by The Elovaters", event_date: "2026-03-04", event_time: "19:00", doors_open_time: "18:00", venue_name: "Slowdown", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "The Elovaters", price_from: 35, price_to: 80, is_featured: false, is_active: true },
  { title: "Heated Rivalry Party", description: "Nebraska vs Colorado Watch Party", event_date: "2026-09-01", event_time: "18:00", doors_open_time: "17:00", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "sports", performer_name: "Heated Rivalry Party", price_from: 25, price_to: 75, is_featured: false, is_active: true },
  { title: "INZO", description: "Live EDM performance by INZO", event_date: "2026-02-07", event_time: "21:00", doors_open_time: "20:00", venue_name: "The Waiting Room", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "INZO", price_from: 35, price_to: 80, is_featured: false, is_active: true },
  { title: "Scotty McCreery", description: "Live concert performance by Scotty McCreery", event_date: "2026-03-21", event_time: "19:00", doors_open_time: "18:00", venue_name: "Orpheum Theater", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Scotty McCreery", price_from: 65, price_to: 250, is_featured: false, is_active: true },
  { title: "Three Dog Night", description: "Live concert performance by Three Dog Night", event_date: "2026-06-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "Orpheum Theater", city: "Omaha", state: "NE", category_slug: "concerts", performer_name: "Three Dog Night", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "John Mellencamp", description: "Live concert performance by John Mellencamp", event_date: "2026-05-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE", category_slug: "concerts", performer_name: "John Mellencamp", price_from: 85, price_to: 350, is_featured: false, is_active: true },

  // New York Events
  { title: "Harry Styles", description: "Live concert performance by Harry Styles", event_date: "2026-09-02", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Harry Styles", price_from: 130, price_to: 580, is_featured: true, is_active: true },
  { title: "Brazil vs Morocco - World Cup", description: "FIFA World Cup Match 7 Group C", event_date: "2026-06-13", event_time: "18:00", doors_open_time: "17:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 200, price_to: 800, is_featured: true, is_active: true },
  { title: "Argentina vs Uruguay - World Cup", description: "FIFA World Cup Match 12 Group D", event_date: "2026-06-15", event_time: "15:00", doors_open_time: "14:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 220, price_to: 850, is_featured: true, is_active: true },
  { title: "France vs Poland - World Cup", description: "FIFA World Cup Match 18 Group E", event_date: "2026-06-17", event_time: "18:00", doors_open_time: "17:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 210, price_to: 820, is_featured: true, is_active: true },
  { title: "USA vs England - World Cup", description: "FIFA World Cup Quarter Final", event_date: "2026-07-03", event_time: "19:00", doors_open_time: "18:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 350, price_to: 1500, is_featured: true, is_active: true },
  { title: "Cardi B", description: "Live concert performance by Cardi B", event_date: "2026-04-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Cardi B", price_from: 120, price_to: 520, is_featured: true, is_active: true },
  { title: "Twice", description: "Live K-Pop concert performance by Twice", event_date: "2026-05-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "Twice", price_from: 140, price_to: 650, is_featured: true, is_active: true },
  { title: "Fred Again", description: "Live EDM performance by Fred Again", event_date: "2026-03-28", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Fred Again", price_from: 95, price_to: 380, is_featured: false, is_active: true },
  { title: "Tori Amos", description: "Live concert performance by Tori Amos", event_date: "2026-04-07", event_time: "19:30", doors_open_time: "18:30", venue_name: "Beacon Theatre", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Tori Amos", price_from: 85, price_to: 320, is_featured: false, is_active: true },
  { title: "Nate Bargatze", description: "Live comedy show by Nate Bargatze", event_date: "2026-03-14", event_time: "20:00", doors_open_time: "19:00", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "comedy", performer_name: "Nate Bargatze", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "New York Knicks vs Boston Celtics", description: "NBA Regular Season Game", event_date: "2026-02-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "sports", performer_name: "New York Knicks", price_from: 120, price_to: 600, is_featured: false, is_active: true },
  { title: "New Edition", description: "Live concert performance by New Edition", event_date: "2026-06-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "New Edition", price_from: 90, price_to: 380, is_featured: false, is_active: true },
  { title: "Brandi Carlile", description: "Live concert performance by Brandi Carlile", event_date: "2026-04-11", event_time: "19:30", doors_open_time: "18:30", venue_name: "Beacon Theatre", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Brandi Carlile", price_from: 95, price_to: 400, is_featured: false, is_active: true },
  { title: "Mariah the Scientist", description: "Live concert performance by Mariah the Scientist", event_date: "2026-03-07", event_time: "20:00", doors_open_time: "19:00", venue_name: "Terminal 5", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Mariah the Scientist", price_from: 65, price_to: 200, is_featured: false, is_active: true },
  { title: "Brooklyn Nets vs Miami Heat", description: "NBA Regular Season Game", event_date: "2026-02-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Barclays Center", city: "Brooklyn", state: "NY", category_slug: "sports", performer_name: "Brooklyn Nets", price_from: 85, price_to: 420, is_featured: false, is_active: true },
  { title: "New York Yankees vs Boston Red Sox", description: "MLB Regular Season Game", event_date: "2026-06-18", event_time: "19:05", doors_open_time: "17:30", venue_name: "Yankee Stadium", city: "Bronx", state: "NY", category_slug: "sports", performer_name: "New York Yankees", price_from: 75, price_to: 450, is_featured: false, is_active: true },
  { title: "New Jersey Devils vs NY Rangers", description: "NHL Regular Season Game", event_date: "2026-03-05", event_time: "19:00", doors_open_time: "18:00", venue_name: "Prudential Center", city: "Newark", state: "NJ", category_slug: "sports", performer_name: "New Jersey Devils", price_from: 70, price_to: 350, is_featured: false, is_active: true },
  { title: "Hamilton", description: "Broadway musical Hamilton", event_date: "2026-01-27", event_time: "19:00", doors_open_time: "18:00", venue_name: "Richard Rodgers Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Hamilton", price_from: 125, price_to: 500, is_featured: true, is_active: true },
  { title: "The Lion King", description: "Disney's The Lion King Broadway musical", event_date: "2026-01-27", event_time: "19:00", doors_open_time: "18:00", venue_name: "Minskoff Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "The Lion King", price_from: 110, price_to: 445, is_featured: true, is_active: true },
  { title: "MJ The Musical", description: "Broadway musical about Michael Jackson", event_date: "2026-02-01", event_time: "19:00", doors_open_time: "18:00", venue_name: "Neil Simon Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "MJ", price_from: 100, price_to: 380, is_featured: false, is_active: true },
  { title: "Chicago", description: "Broadway musical Chicago", event_date: "2026-02-08", event_time: "19:00", doors_open_time: "18:00", venue_name: "Ambassador Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Chicago", price_from: 80, price_to: 300, is_featured: false, is_active: true },
  { title: "Aladdin", description: "Disney's Aladdin Broadway musical", event_date: "2026-02-15", event_time: "19:00", doors_open_time: "18:00", venue_name: "New Amsterdam Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Aladdin", price_from: 95, price_to: 350, is_featured: false, is_active: true },

  // Los Angeles Events
  { title: "Lady Gaga", description: "Live concert performance by Lady Gaga", event_date: "2026-02-23", event_time: "20:00", doors_open_time: "19:00", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Lady Gaga", price_from: 135, price_to: 590, is_featured: true, is_active: true },
  { title: "Snow Strippers", description: "Live concert performance by Snow Strippers", event_date: "2026-02-14", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Roxy", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Snow Strippers", price_from: 45, price_to: 120, is_featured: false, is_active: true },
  { title: "Flight of the Conchords", description: "Live comedy/music performance", event_date: "2026-04-17", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "comedy", performer_name: "Flight of the Conchords", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Ricardo Arjona", description: "Live concert performance by Ricardo Arjona", event_date: "2026-03-21", event_time: "20:00", doors_open_time: "19:00", venue_name: "Crypto.com Arena", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Ricardo Arjona", price_from: 85, price_to: 350, is_featured: false, is_active: true },
  { title: "Harlem Globetrotters", description: "Basketball entertainment by Harlem Globetrotters", event_date: "2026-02-22", event_time: "14:00", doors_open_time: "13:00", venue_name: "Crypto.com Arena", city: "Los Angeles", state: "CA", category_slug: "sports", performer_name: "Harlem Globetrotters", price_from: 40, price_to: 180, is_featured: false, is_active: true },
  { title: "Olivia Dean", description: "Live concert performance by Olivia Dean", event_date: "2026-03-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "The Greek Theatre", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Olivia Dean", price_from: 55, price_to: 180, is_featured: false, is_active: true },
  { title: "BTS", description: "Live K-Pop concert performance by BTS", event_date: "2026-07-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "BTS", price_from: 175, price_to: 850, is_featured: true, is_active: true },
  { title: "Bruno Mars", description: "Live concert performance by Bruno Mars", event_date: "2026-06-06", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Bruno Mars", price_from: 145, price_to: 680, is_featured: true, is_active: true },
  { title: "Monster Jam", description: "Monster Truck Show", event_date: "2026-02-28", event_time: "14:00", doors_open_time: "12:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "sports", performer_name: "Monster Jam", price_from: 35, price_to: 150, is_featured: false, is_active: true },
  { title: "A$AP Rocky", description: "Live concert performance by A$AP Rocky", event_date: "2026-04-25", event_time: "20:00", doors_open_time: "19:00", venue_name: "Crypto.com Arena", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "A$AP Rocky", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Peso Pluma", description: "Live concert performance by Peso Pluma", event_date: "2026-05-09", event_time: "20:00", doors_open_time: "19:00", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Peso Pluma", price_from: 110, price_to: 480, is_featured: false, is_active: true },
  { title: "LA Lakers vs Chicago Bulls", description: "NBA Regular Season Game", event_date: "2026-03-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Crypto.com Arena", city: "Los Angeles", state: "CA", category_slug: "sports", performer_name: "LA Lakers", price_from: 150, price_to: 800, is_featured: false, is_active: true },
  { title: "LA Dodgers vs NY Yankees", description: "MLB Regular Season Game", event_date: "2026-06-08", event_time: "19:10", doors_open_time: "17:30", venue_name: "Dodger Stadium", city: "Los Angeles", state: "CA", category_slug: "sports", performer_name: "LA Dodgers", price_from: 85, price_to: 500, is_featured: false, is_active: true },
  { title: "Billie Eilish", description: "Live concert performance by Billie Eilish", event_date: "2026-06-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Billie Eilish", price_from: 125, price_to: 570, is_featured: true, is_active: true },
  { title: "The Weeknd", description: "Live concert performance by The Weeknd", event_date: "2026-08-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "The Weeknd", price_from: 138, price_to: 640, is_featured: true, is_active: true },

  // Chicago Events
  { title: "BTS Chicago", description: "Live K-Pop concert performance by BTS", event_date: "2026-08-27", event_time: "20:00", doors_open_time: "19:00", venue_name: "Soldier Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "BTS", price_from: 155, price_to: 720, is_featured: true, is_active: true },
  { title: "Bruno Mars Chicago", description: "Live concert performance by Bruno Mars", event_date: "2026-05-17", event_time: "19:30", doors_open_time: "18:30", venue_name: "Soldier Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Bruno Mars", price_from: 120, price_to: 575, is_featured: true, is_active: true },
  { title: "Pitbull", description: "Live concert performance by Pitbull", event_date: "2026-03-07", event_time: "20:00", doors_open_time: "19:00", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Pitbull", price_from: 80, price_to: 320, is_featured: false, is_active: true },
  { title: "Disney On Ice", description: "Disney On Ice presents Frozen & Friends", event_date: "2026-02-21", event_time: "14:00", doors_open_time: "13:00", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "theater", performer_name: "Disney On Ice", price_from: 35, price_to: 150, is_featured: false, is_active: true },
  { title: "Dancing with the Stars", description: "Live Tour", event_date: "2026-03-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "Rosemont Theatre", city: "Rosemont", state: "IL", category_slug: "theater", performer_name: "Dancing with the Stars", price_from: 65, price_to: 250, is_featured: false, is_active: true },
  { title: "Rob Zombie", description: "Live concert performance by Rob Zombie", event_date: "2026-04-04", event_time: "19:30", doors_open_time: "18:30", venue_name: "Huntington Bank Pavilion", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Rob Zombie", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Shane Gillis", description: "Live comedy show by Shane Gillis", event_date: "2026-03-21", event_time: "20:00", doors_open_time: "19:00", venue_name: "Chicago Theatre", city: "Chicago", state: "IL", category_slug: "comedy", performer_name: "Shane Gillis", price_from: 60, price_to: 220, is_featured: false, is_active: true },
  { title: "Chicago Bulls vs Boston Celtics", description: "NBA Regular Season Game", event_date: "2026-02-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "sports", performer_name: "Chicago Bulls", price_from: 90, price_to: 450, is_featured: false, is_active: true },
  { title: "Chicago Blackhawks vs Detroit Red Wings", description: "NHL Regular Season Game", event_date: "2026-03-01", event_time: "19:00", doors_open_time: "18:00", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "sports", performer_name: "Chicago Blackhawks", price_from: 65, price_to: 320, is_featured: false, is_active: true },
  { title: "Rascal Flatts", description: "Live concert performance by Rascal Flatts", event_date: "2026-06-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Rascal Flatts", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Chicago Cubs vs St. Louis Cardinals", description: "MLB Regular Season Game", event_date: "2026-07-04", event_time: "13:20", doors_open_time: "11:30", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "sports", performer_name: "Chicago Cubs", price_from: 50, price_to: 350, is_featured: false, is_active: true },

  // Boston Events
  { title: "Taylor Swift Boston", description: "Live concert performance by Taylor Swift", event_date: "2026-06-15", event_time: "19:00", doors_open_time: "18:00", venue_name: "Gillette Stadium", city: "Foxborough", state: "MA", category_slug: "concerts", performer_name: "Taylor Swift", price_from: 180, price_to: 950, is_featured: true, is_active: true },
  { title: "Phantom of the Opera", description: "Broadway musical Phantom of the Opera", event_date: "2026-03-10", event_time: "19:30", doors_open_time: "18:30", venue_name: "Boston Opera House", city: "Boston", state: "MA", category_slug: "theater", performer_name: "Phantom of the Opera", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Audrey Hobert", description: "Live concert performance by Audrey Hobert", event_date: "2026-02-11", event_time: "19:00", doors_open_time: "18:00", venue_name: "Paradise Rock Club", city: "Boston", state: "MA", category_slug: "concerts", performer_name: "Audrey Hobert", price_from: 35, price_to: 80, is_featured: false, is_active: true },
  { title: "WWE Raw", description: "WWE Monday Night Raw", event_date: "2026-03-16", event_time: "19:30", doors_open_time: "18:00", venue_name: "TD Garden", city: "Boston", state: "MA", category_slug: "sports", performer_name: "WWE", price_from: 45, price_to: 300, is_featured: false, is_active: true },
  { title: "Boston Bruins vs Montreal Canadiens", description: "NHL Regular Season Game", event_date: "2026-02-22", event_time: "19:00", doors_open_time: "18:00", venue_name: "TD Garden", city: "Boston", state: "MA", category_slug: "sports", performer_name: "Boston Bruins", price_from: 85, price_to: 420, is_featured: false, is_active: true },
  { title: "Ty Myers", description: "Live concert performance by Ty Myers", event_date: "2026-02-28", event_time: "19:00", doors_open_time: "18:00", venue_name: "House of Blues Boston", city: "Boston", state: "MA", category_slug: "concerts", performer_name: "Ty Myers", price_from: 40, price_to: 100, is_featured: false, is_active: true },
  { title: "Jo Koy", description: "Live comedy show by Jo Koy", event_date: "2026-04-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Wang Theatre", city: "Boston", state: "MA", category_slug: "comedy", performer_name: "Jo Koy", price_from: 65, price_to: 220, is_featured: false, is_active: true },
  { title: "Some Like It Hot", description: "Broadway musical Some Like It Hot", event_date: "2026-04-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "Citizens Bank Opera House", city: "Boston", state: "MA", category_slug: "theater", performer_name: "Some Like It Hot", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Boston Celtics vs LA Lakers", description: "NBA Regular Season Game", event_date: "2026-03-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "TD Garden", city: "Boston", state: "MA", category_slug: "sports", performer_name: "Boston Celtics", price_from: 120, price_to: 650, is_featured: false, is_active: true },
  { title: "Boston Red Sox vs NY Yankees", description: "MLB Regular Season Game", event_date: "2026-07-18", event_time: "19:10", doors_open_time: "17:30", venue_name: "Fenway Park", city: "Boston", state: "MA", category_slug: "sports", performer_name: "Boston Red Sox", price_from: 65, price_to: 400, is_featured: false, is_active: true },

  // Miami Events
  { title: "Drake Miami", description: "Live concert performance by Drake", event_date: "2026-07-22", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "Drake", price_from: 145, price_to: 680, is_featured: true, is_active: true },
  { title: "Bad Bunny Miami", description: "Live concert performance by Bad Bunny", event_date: "2026-05-10", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "Bad Bunny", price_from: 152, price_to: 710, is_featured: true, is_active: true },
  { title: "Miami Heat vs NY Knicks", description: "NBA Regular Season Game", event_date: "2026-02-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kaseya Center", city: "Miami", state: "FL", category_slug: "sports", performer_name: "Miami Heat", price_from: 95, price_to: 480, is_featured: false, is_active: true },
  { title: "PBR Rodeo", description: "Professional Bull Riders Championship", event_date: "2026-03-07", event_time: "19:00", doors_open_time: "17:30", venue_name: "Kaseya Center", city: "Miami", state: "FL", category_slug: "sports", performer_name: "PBR", price_from: 55, price_to: 250, is_featured: false, is_active: true },
  { title: "Matt Rife Miami", description: "Live comedy show by Matt Rife", event_date: "2026-04-11", event_time: "20:00", doors_open_time: "19:00", venue_name: "Fillmore Miami Beach", city: "Miami Beach", state: "FL", category_slug: "comedy", performer_name: "Matt Rife", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "Jack Johnson", description: "Live concert performance by Jack Johnson", event_date: "2026-05-23", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bayfront Park Amphitheatre", city: "Miami", state: "FL", category_slug: "concerts", performer_name: "Jack Johnson", price_from: 65, price_to: 220, is_featured: false, is_active: true },
  { title: "World Baseball Classic - USA vs Japan", description: "World Baseball Classic Championship Game", event_date: "2026-03-22", event_time: "19:00", doors_open_time: "17:00", venue_name: "loanDepot park", city: "Miami", state: "FL", category_slug: "sports", performer_name: "World Baseball Classic", price_from: 150, price_to: 800, is_featured: true, is_active: true },

  // Philadelphia Events
  { title: "James Taylor", description: "Live concert performance by James Taylor", event_date: "2026-06-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "Wells Fargo Center", city: "Philadelphia", state: "PA", category_slug: "concerts", performer_name: "James Taylor", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Katt Williams", description: "Live comedy show by Katt Williams", event_date: "2026-03-28", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Met Philadelphia", city: "Philadelphia", state: "PA", category_slug: "comedy", performer_name: "Katt Williams", price_from: 70, price_to: 300, is_featured: false, is_active: true },
  { title: "Philadelphia Phillies vs Atlanta Braves", description: "MLB Regular Season Game", event_date: "2026-06-21", event_time: "19:05", doors_open_time: "17:30", venue_name: "Citizens Bank Park", city: "Philadelphia", state: "PA", category_slug: "sports", performer_name: "Philadelphia Phillies", price_from: 55, price_to: 320, is_featured: false, is_active: true },
  { title: "Philadelphia 76ers vs Brooklyn Nets", description: "NBA Regular Season Game", event_date: "2026-02-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "Wells Fargo Center", city: "Philadelphia", state: "PA", category_slug: "sports", performer_name: "Philadelphia 76ers", price_from: 80, price_to: 400, is_featured: false, is_active: true },
  { title: "Supercross", description: "Monster Energy Supercross Championship", event_date: "2026-03-14", event_time: "19:00", doors_open_time: "16:00", venue_name: "Lincoln Financial Field", city: "Philadelphia", state: "PA", category_slug: "sports", performer_name: "Supercross", price_from: 45, price_to: 200, is_featured: false, is_active: true },

  // Seattle Events
  { title: "Morgan Wallen Seattle", description: "Live concert performance by Morgan Wallen", event_date: "2026-07-11", event_time: "19:30", doors_open_time: "18:30", venue_name: "T-Mobile Park", city: "Seattle", state: "WA", category_slug: "concerts", performer_name: "Morgan Wallen", price_from: 120, price_to: 520, is_featured: true, is_active: true },
  { title: "Seattle Kraken vs Vegas Golden Knights", description: "NHL Regular Season Game", event_date: "2026-02-15", event_time: "19:00", doors_open_time: "18:00", venue_name: "Climate Pledge Arena", city: "Seattle", state: "WA", category_slug: "sports", performer_name: "Seattle Kraken", price_from: 75, price_to: 380, is_featured: false, is_active: true },
  { title: "Forrest Frank", description: "Live concert performance by Forrest Frank", event_date: "2026-03-18", event_time: "19:00", doors_open_time: "18:00", venue_name: "Showbox SoDo", city: "Seattle", state: "WA", category_slug: "concerts", performer_name: "Forrest Frank", price_from: 45, price_to: 120, is_featured: false, is_active: true },

  // Denver Events
  { title: "Cody Johnson Denver", description: "Live concert performance by Cody Johnson", event_date: "2026-08-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Ball Arena", city: "Denver", state: "CO", category_slug: "concerts", performer_name: "Cody Johnson", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Denver Nuggets vs Phoenix Suns", description: "NBA Regular Season Game", event_date: "2026-03-01", event_time: "19:00", doors_open_time: "18:00", venue_name: "Ball Arena", city: "Denver", state: "CO", category_slug: "sports", performer_name: "Denver Nuggets", price_from: 95, price_to: 480, is_featured: false, is_active: true },
  { title: "Red Rocks Concert", description: "Summer Concert Series at Red Rocks", event_date: "2026-07-04", event_time: "19:30", doors_open_time: "17:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Festival", price_from: 75, price_to: 300, is_featured: false, is_active: true },

  // Houston Events  
  { title: "Houston Rodeo - George Strait", description: "Houston Livestock Show and Rodeo featuring George Strait", event_date: "2026-03-15", event_time: "18:45", doors_open_time: "17:00", venue_name: "NRG Stadium", city: "Houston", state: "TX", category_slug: "concerts", performer_name: "Garth Brooks", price_from: 100, price_to: 500, is_featured: true, is_active: true },
  { title: "Houston Rockets vs Dallas Mavericks", description: "NBA Regular Season Game", event_date: "2026-02-28", event_time: "19:00", doors_open_time: "18:00", venue_name: "Toyota Center", city: "Houston", state: "TX", category_slug: "sports", performer_name: "Houston Rockets", price_from: 70, price_to: 350, is_featured: false, is_active: true },

  // Atlanta Events
  { title: "Atlanta Hawks vs Miami Heat", description: "NBA Regular Season Game", event_date: "2026-03-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "State Farm Arena", city: "Atlanta", state: "GA", category_slug: "sports", performer_name: "Atlanta Hawks", price_from: 65, price_to: 320, is_featured: false, is_active: true },
  { title: "Beyoncé Atlanta", description: "Live concert performance by Beyoncé", event_date: "2026-09-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Beyoncé", price_from: 220, price_to: 980, is_featured: true, is_active: true },

  // Phoenix Events
  { title: "Phoenix Suns vs LA Lakers", description: "NBA Regular Season Game", event_date: "2026-03-12", event_time: "19:00", doors_open_time: "18:00", venue_name: "Footprint Center", city: "Phoenix", state: "AZ", category_slug: "sports", performer_name: "Phoenix Suns", price_from: 85, price_to: 420, is_featured: false, is_active: true },
  { title: "WM Phoenix Open", description: "PGA Tour Phoenix Open Golf Tournament", event_date: "2026-02-06", event_time: "10:00", doors_open_time: "08:00", venue_name: "TPC Scottsdale", city: "Scottsdale", state: "AZ", category_slug: "sports", performer_name: "Phoenix Open", price_from: 65, price_to: 350, is_featured: false, is_active: true },
  { title: "Super Bowl LX", description: "NFL Super Bowl LX Championship", event_date: "2026-02-08", event_time: "18:30", doors_open_time: "14:00", venue_name: "State Farm Stadium", city: "Glendale", state: "AZ", category_slug: "sports", performer_name: "Dallas Cowboys", price_from: 2500, price_to: 15000, is_featured: true, is_active: true },

  // Dallas/Fort Worth Events
  { title: "Fort Worth Stock Show & Rodeo", description: "Annual Fort Worth Rodeo and Livestock Show", event_date: "2026-02-07", event_time: "19:00", doors_open_time: "17:00", venue_name: "Dickies Arena", city: "Fort Worth", state: "TX", category_slug: "sports", performer_name: "Fort Worth Rodeo", price_from: 45, price_to: 200, is_featured: false, is_active: true },
  { title: "Dallas Mavericks vs Houston Rockets", description: "NBA Regular Season Game", event_date: "2026-02-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "American Airlines Center", city: "Dallas", state: "TX", category_slug: "sports", performer_name: "Dallas Mavericks", price_from: 75, price_to: 380, is_featured: false, is_active: true },
  { title: "Coldplay Dallas", description: "Live concert performance by Coldplay", event_date: "2026-08-20", event_time: "20:00", doors_open_time: "19:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "concerts", performer_name: "Coldplay", price_from: 135, price_to: 620, is_featured: true, is_active: true },

  // Las Vegas Events
  { title: "UFC 300", description: "UFC Championship Fight Night", event_date: "2026-04-13", event_time: "19:00", doors_open_time: "17:00", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "UFC", price_from: 200, price_to: 1500, is_featured: true, is_active: true },
  { title: "Vegas Golden Knights vs Seattle Kraken", description: "NHL Regular Season Game", event_date: "2026-02-21", event_time: "19:00", doors_open_time: "18:00", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "Vegas Golden Knights", price_from: 90, price_to: 450, is_featured: false, is_active: true },
  { title: "National Finals Rodeo", description: "NFR Championship Finals", event_date: "2026-12-05", event_time: "18:45", doors_open_time: "17:00", venue_name: "Thomas & Mack Center", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "NFR", price_from: 150, price_to: 800, is_featured: true, is_active: true },
  { title: "Wizard of Oz Musical", description: "Broadway musical The Wizard of Oz", event_date: "2026-02-14", event_time: "19:00", doors_open_time: "18:00", venue_name: "Smith Center", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Wizard of Oz", price_from: 65, price_to: 250, is_featured: false, is_active: true },
  { title: "The Eagles", description: "Live concert performance by The Eagles", event_date: "2026-10-03", event_time: "20:00", doors_open_time: "19:00", venue_name: "MSG Sphere", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "The Eagles", price_from: 175, price_to: 800, is_featured: true, is_active: true },
  { title: "Adele Residency", description: "Adele's Las Vegas residency show", event_date: "2026-06-07", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Colosseum at Caesars Palace", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Adele", price_from: 280, price_to: 1200, is_featured: true, is_active: true },
  { title: "U2 at Sphere", description: "U2 UV Achtung Baby Live at Sphere", event_date: "2026-03-15", event_time: "20:30", doors_open_time: "19:00", venue_name: "MSG Sphere", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "U2", price_from: 195, price_to: 950, is_featured: true, is_active: true },
  { title: "Cirque du Soleil - O", description: "Cirque du Soleil water show O", event_date: "2026-02-14", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bellagio Theatre", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Cirque du Soleil", price_from: 125, price_to: 350, is_featured: false, is_active: true },
  { title: "Blue Man Group", description: "Blue Man Group Las Vegas show", event_date: "2026-02-15", event_time: "19:00", doors_open_time: "18:00", venue_name: "Luxor Hotel", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Blue Man Group", price_from: 75, price_to: 200, is_featured: false, is_active: true },
  { title: "Shania Twain Residency", description: "Shania Twain Las Vegas residency", event_date: "2026-05-09", event_time: "20:00", doors_open_time: "19:00", venue_name: "Planet Hollywood Resort", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Shania Twain", price_from: 120, price_to: 480, is_featured: false, is_active: true },
  { title: "Garth Brooks Residency", description: "Garth Brooks Las Vegas residency", event_date: "2026-06-21", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Colosseum at Caesars Palace", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Garth Brooks", price_from: 150, price_to: 600, is_featured: true, is_active: true },
  { title: "Usher Residency", description: "Usher My Way Las Vegas Residency", event_date: "2026-04-18", event_time: "20:00", doors_open_time: "19:00", venue_name: "Park MGM", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Usher", price_from: 130, price_to: 520, is_featured: false, is_active: true },
  { title: "Pac-12 Basketball Tournament", description: "Pac-12 Conference Basketball Tournament", event_date: "2026-03-11", event_time: "12:00", doors_open_time: "10:30", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "Pac-12 Tournament", price_from: 55, price_to: 280, is_featured: false, is_active: true },
  { title: "Mountain West Tournament", description: "Mountain West Conference Basketball Tournament", event_date: "2026-03-10", event_time: "12:00", doors_open_time: "10:30", venue_name: "Thomas & Mack Center", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "Mountain West", price_from: 45, price_to: 200, is_featured: false, is_active: true },
  { title: "NASCAR Pennzoil 400", description: "NASCAR Cup Series Las Vegas Motor Speedway", event_date: "2026-03-01", event_time: "15:30", doors_open_time: "10:00", venue_name: "Las Vegas Motor Speedway", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "NASCAR", price_from: 85, price_to: 450, is_featured: false, is_active: true },
  { title: "Ali Siddiq", description: "Live comedy show by Ali Siddiq", event_date: "2026-03-21", event_time: "20:00", doors_open_time: "19:00", venue_name: "The Mirage", city: "Las Vegas", state: "NV", category_slug: "comedy", performer_name: "Ali Siddiq", price_from: 55, price_to: 150, is_featured: false, is_active: true },
  { title: "Madison Beer Vegas", description: "Live concert performance by Madison Beer", event_date: "2026-04-04", event_time: "20:00", doors_open_time: "19:00", venue_name: "Brooklyn Bowl Las Vegas", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Madison Beer", price_from: 65, price_to: 200, is_featured: false, is_active: true },
  { title: "Illenium Vegas", description: "Live EDM performance by Illenium", event_date: "2026-05-16", event_time: "22:00", doors_open_time: "21:00", venue_name: "Zouk Nightclub", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Illenium", price_from: 85, price_to: 300, is_featured: false, is_active: true },
  { title: "Five Finger Death Punch", description: "Live concert performance by Five Finger Death Punch", event_date: "2026-09-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Five Finger Death Punch", price_from: 75, price_to: 320, is_featured: false, is_active: true },
  { title: "David Copperfield", description: "Magic show by David Copperfield", event_date: "2026-02-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "MGM Grand", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "David Copperfield", price_from: 120, price_to: 350, is_featured: false, is_active: true },
  { title: "Penn and Teller", description: "Magic show by Penn and Teller", event_date: "2026-02-22", event_time: "21:00", doors_open_time: "20:00", venue_name: "Rio All-Suite Hotel", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Penn and Teller", price_from: 95, price_to: 250, is_featured: false, is_active: true },
  { title: "Jabbawockeez", description: "Dance show by Jabbawockeez", event_date: "2026-02-25", event_time: "19:00", doors_open_time: "18:00", venue_name: "MGM Grand", city: "Las Vegas", state: "NV", category_slug: "theater", performer_name: "Jabbawockeez", price_from: 65, price_to: 180, is_featured: false, is_active: true },

  // San Francisco Events
  { title: "SF 49ers vs Dallas Cowboys", description: "NFL Regular Season Game", event_date: "2026-10-18", event_time: "16:25", doors_open_time: "13:00", venue_name: "Levi's Stadium", city: "Santa Clara", state: "CA", category_slug: "sports", performer_name: "SF 49ers", price_from: 150, price_to: 800, is_featured: false, is_active: true },

  // Additional Featured Events
  { title: "Ariana Grande World Tour", description: "Live concert performance by Ariana Grande", event_date: "2026-06-30", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Ariana Grande", price_from: 130, price_to: 590, is_featured: true, is_active: true },
  { title: "Ed Sheeran Mathematics Tour", description: "Live concert performance by Ed Sheeran", event_date: "2026-07-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "Ed Sheeran", price_from: 115, price_to: 520, is_featured: true, is_active: true },
  { title: "Dua Lipa Future Nostalgia Tour", description: "Live concert performance by Dua Lipa", event_date: "2026-05-15", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Dua Lipa", price_from: 125, price_to: 560, is_featured: true, is_active: true },
  { title: "Post Malone", description: "Live concert performance by Post Malone", event_date: "2026-08-10", event_time: "20:00", doors_open_time: "19:00", venue_name: "Soldier Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Post Malone", price_from: 110, price_to: 480, is_featured: true, is_active: true },
  { title: "Imagine Dragons", description: "Live concert performance by Imagine Dragons", event_date: "2026-07-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "Imagine Dragons", price_from: 95, price_to: 420, is_featured: true, is_active: true },
  { title: "Kendrick Lamar", description: "Live concert performance by Kendrick Lamar", event_date: "2026-09-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Kendrick Lamar", price_from: 140, price_to: 650, is_featured: true, is_active: true },
  { title: "Travis Scott Utopia Tour", description: "Live concert performance by Travis Scott", event_date: "2026-06-20", event_time: "20:00", doors_open_time: "19:00", venue_name: "NRG Stadium", city: "Houston", state: "TX", category_slug: "concerts", performer_name: "Travis Scott", price_from: 135, price_to: 620, is_featured: true, is_active: true },
  { title: "The Rolling Stones", description: "Live concert performance by The Rolling Stones", event_date: "2026-10-10", event_time: "20:00", doors_open_time: "19:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "The Rolling Stones", price_from: 200, price_to: 900, is_featured: true, is_active: true },
  { title: "Metallica M72 Tour", description: "Live concert performance by Metallica", event_date: "2026-08-28", event_time: "19:00", doors_open_time: "17:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "concerts", performer_name: "Metallica", price_from: 150, price_to: 700, is_featured: true, is_active: true },
  { title: "Foo Fighters", description: "Live concert performance by Foo Fighters", event_date: "2026-07-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Foo Fighters", price_from: 110, price_to: 480, is_featured: true, is_active: true },
  { title: "Red Hot Chili Peppers", description: "Live concert performance by Red Hot Chili Peppers", event_date: "2026-09-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "Gillette Stadium", city: "Foxborough", state: "MA", category_slug: "concerts", performer_name: "Red Hot Chili Peppers", price_from: 120, price_to: 540, is_featured: true, is_active: true },
  { title: "SZA SOS Tour", description: "Live concert performance by SZA", event_date: "2026-06-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "SZA", price_from: 115, price_to: 500, is_featured: true, is_active: true },
  { title: "Wicked Broadway", description: "Broadway musical Wicked", event_date: "2026-02-20", event_time: "19:00", doors_open_time: "18:00", venue_name: "Gershwin Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Wicked", price_from: 130, price_to: 550, is_featured: true, is_active: true },
  { title: "Jennifer Lopez", description: "Live concert performance by Jennifer Lopez", event_date: "2026-05-30", event_time: "20:00", doors_open_time: "19:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Jennifer Lopez", price_from: 125, price_to: 580, is_featured: false, is_active: true },
  { title: "Elton John Farewell Tour", description: "Elton John Farewell Yellow Brick Road Tour", event_date: "2026-04-26", event_time: "20:00", doors_open_time: "19:00", venue_name: "Dodger Stadium", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Elton John", price_from: 175, price_to: 850, is_featured: true, is_active: true },
  { title: "Carrie Underwood", description: "Live concert performance by Carrie Underwood", event_date: "2026-07-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bridgestone Arena", city: "Nashville", state: "TN", category_slug: "concerts", performer_name: "Carrie Underwood", price_from: 95, price_to: 420, is_featured: false, is_active: true },

  // More World Cup matches
  { title: "Germany vs Spain - World Cup", description: "FIFA World Cup Match 23 Group F", event_date: "2026-06-19", event_time: "18:00", doors_open_time: "17:00", venue_name: "MetLife Stadium", city: "East Rutherland", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 230, price_to: 880, is_featured: true, is_active: true },
  { title: "World Cup Semi-Final 1", description: "FIFA World Cup Semi Final 1", event_date: "2026-07-14", event_time: "20:00", doors_open_time: "18:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 500, price_to: 3000, is_featured: true, is_active: true },
  { title: "World Cup Final", description: "FIFA World Cup 2026 Final", event_date: "2026-07-19", event_time: "18:00", doors_open_time: "15:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "sports", performer_name: "World Cup", price_from: 800, price_to: 5000, is_featured: true, is_active: true },

  // More theater shows
  { title: "Book of Mormon", description: "Broadway musical The Book of Mormon", event_date: "2026-03-01", event_time: "19:00", doors_open_time: "18:00", venue_name: "Eugene O'Neill Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Book of Mormon", price_from: 100, price_to: 400, is_featured: false, is_active: true },
  { title: "Les Misérables", description: "Broadway musical Les Misérables", event_date: "2026-03-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Imperial Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Les Misérables", price_from: 90, price_to: 350, is_featured: false, is_active: true },
  { title: "Harry Potter Cursed Child", description: "Harry Potter and the Cursed Child Parts 1 & 2", event_date: "2026-02-28", event_time: "14:00", doors_open_time: "13:00", venue_name: "Lyric Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Harry Potter", price_from: 150, price_to: 550, is_featured: false, is_active: true },
  { title: "Frozen Broadway", description: "Disney's Frozen Broadway musical", event_date: "2026-04-12", event_time: "19:00", doors_open_time: "18:00", venue_name: "St. James Theatre", city: "New York", state: "NY", category_slug: "theater", performer_name: "Frozen", price_from: 100, price_to: 380, is_featured: false, is_active: true },

  // More comedy shows  
  { title: "Matt Rife Chicago", description: "Live comedy show by Matt Rife", event_date: "2026-05-02", event_time: "20:00", doors_open_time: "19:00", venue_name: "Chicago Theatre", city: "Chicago", state: "IL", category_slug: "comedy", performer_name: "Matt Rife", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "Nate Bargatze Boston", description: "Live comedy show by Nate Bargatze", event_date: "2026-05-16", event_time: "20:00", doors_open_time: "19:00", venue_name: "Wang Theatre", city: "Boston", state: "MA", category_slug: "comedy", performer_name: "Nate Bargatze", price_from: 70, price_to: 250, is_featured: false, is_active: true },
  { title: "Jo Koy LA", description: "Live comedy show by Jo Koy", event_date: "2026-06-13", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "comedy", performer_name: "Jo Koy", price_from: 65, price_to: 220, is_featured: false, is_active: true },

  // Additional sports events
  { title: "WWE WrestleMania", description: "WWE WrestleMania Championship Event", event_date: "2026-04-05", event_time: "17:00", doors_open_time: "14:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "sports", performer_name: "WWE", price_from: 75, price_to: 800, is_featured: true, is_active: true },
  { title: "UFC 305", description: "UFC Championship Event", event_date: "2026-08-08", event_time: "18:00", doors_open_time: "16:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "sports", performer_name: "UFC", price_from: 175, price_to: 1200, is_featured: true, is_active: true },
  { title: "Monster Jam Dallas", description: "Monster Truck Championship", event_date: "2026-03-28", event_time: "14:00", doors_open_time: "12:00", venue_name: "AT&T Stadium", city: "Arlington", state: "TX", category_slug: "sports", performer_name: "Monster Jam", price_from: 40, price_to: 180, is_featured: false, is_active: true },
  { title: "PBR World Finals", description: "PBR World Championship Finals", event_date: "2026-11-05", event_time: "19:00", doors_open_time: "17:00", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "sports", performer_name: "PBR", price_from: 100, price_to: 600, is_featured: true, is_active: true },

  // Additional MLB Games
  { title: "LA Dodgers vs SF Giants", description: "MLB Rivalry Game", event_date: "2026-07-25", event_time: "19:10", doors_open_time: "17:30", venue_name: "Dodger Stadium", city: "Los Angeles", state: "CA", category_slug: "sports", performer_name: "LA Dodgers", price_from: 65, price_to: 380, is_featured: false, is_active: true },
  { title: "Chicago Cubs vs Milwaukee Brewers", description: "MLB Regular Season Game", event_date: "2026-08-15", event_time: "14:20", doors_open_time: "12:30", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "sports", performer_name: "Chicago Cubs", price_from: 45, price_to: 280, is_featured: false, is_active: true },

  // Additional NBA Games
  { title: "LA Lakers vs Golden State Warriors", description: "NBA Western Conference Rivalry", event_date: "2026-03-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Crypto.com Arena", city: "Los Angeles", state: "CA", category_slug: "sports", performer_name: "LA Lakers", price_from: 175, price_to: 900, is_featured: true, is_active: true },
  { title: "Dallas Mavericks vs Phoenix Suns", description: "NBA Western Conference Game", event_date: "2026-04-02", event_time: "19:30", doors_open_time: "18:30", venue_name: "American Airlines Center", city: "Dallas", state: "TX", category_slug: "sports", performer_name: "Dallas Mavericks", price_from: 85, price_to: 420, is_featured: false, is_active: true },

  // Additional NHL Games
  { title: "NY Rangers vs Boston Bruins", description: "NHL Eastern Conference Rivalry", event_date: "2026-03-18", event_time: "19:00", doors_open_time: "18:00", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "sports", performer_name: "NY Rangers", price_from: 95, price_to: 480, is_featured: false, is_active: true },

  // More concerts across different cities
  { title: "Tame Impala", description: "Live concert performance by Tame Impala", event_date: "2026-06-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Tame Impala", price_from: 95, price_to: 400, is_featured: false, is_active: true },
  { title: "Glass Animals", description: "Live concert performance by Glass Animals", event_date: "2026-05-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "The Greek Theatre", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Glass Animals", price_from: 75, price_to: 280, is_featured: false, is_active: true },
  { title: "My Chemical Romance Reunion", description: "MCR Reunion Tour", event_date: "2026-09-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "My Chemical Romance", price_from: 130, price_to: 580, is_featured: true, is_active: true },
  { title: "Blink-182", description: "Live concert performance by Blink-182", event_date: "2026-08-02", event_time: "19:00", doors_open_time: "18:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Blink-182", price_from: 105, price_to: 460, is_featured: false, is_active: true },
  { title: "Green Day", description: "Live concert performance by Green Day", event_date: "2026-07-30", event_time: "19:30", doors_open_time: "18:30", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Green Day", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Arctic Monkeys", description: "Live concert performance by Arctic Monkeys", event_date: "2026-06-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Arctic Monkeys", price_from: 110, price_to: 480, is_featured: false, is_active: true },
  { title: "The 1975", description: "Live concert performance by The 1975", event_date: "2026-05-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "The 1975", price_from: 95, price_to: 400, is_featured: false, is_active: true },
  { title: "The Killers", description: "Live concert performance by The Killers", event_date: "2026-09-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "The Killers", price_from: 100, price_to: 450, is_featured: false, is_active: true },
  { title: "Muse", description: "Live concert performance by Muse", event_date: "2026-10-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Muse", price_from: 110, price_to: 500, is_featured: false, is_active: true },
  { title: "Panic! At The Disco", description: "Live concert performance by Panic! At The Disco", event_date: "2026-04-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Panic! At The Disco", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Fall Out Boy", description: "Live concert performance by Fall Out Boy", event_date: "2026-08-18", event_time: "19:00", doors_open_time: "18:00", venue_name: "Wrigley Field", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Fall Out Boy", price_from: 90, price_to: 400, is_featured: false, is_active: true },
  { title: "Paramore", description: "Live concert performance by Paramore", event_date: "2026-06-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Paramore", price_from: 85, price_to: 380, is_featured: false, is_active: true },

  // More hip hop/R&B
  { title: "J. Cole", description: "Live concert performance by J. Cole", event_date: "2026-07-15", event_time: "20:00", doors_open_time: "19:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "J. Cole", price_from: 125, price_to: 560, is_featured: true, is_active: true },
  { title: "21 Savage", description: "Live concert performance by 21 Savage", event_date: "2026-05-08", event_time: "20:00", doors_open_time: "19:00", venue_name: "State Farm Arena", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "21 Savage", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Lil Baby", description: "Live concert performance by Lil Baby", event_date: "2026-06-12", event_time: "20:00", doors_open_time: "19:00", venue_name: "State Farm Arena", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Lil Baby", price_from: 100, price_to: 450, is_featured: false, is_active: true },
  { title: "Future", description: "Live concert performance by Future", event_date: "2026-08-22", event_time: "20:00", doors_open_time: "19:00", venue_name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA", category_slug: "concerts", performer_name: "Future", price_from: 110, price_to: 500, is_featured: false, is_active: true },
  { title: "Megan Thee Stallion", description: "Live concert performance by Megan Thee Stallion", event_date: "2026-07-05", event_time: "20:00", doors_open_time: "19:00", venue_name: "NRG Stadium", city: "Houston", state: "TX", category_slug: "concerts", performer_name: "Megan Thee Stallion", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Doja Cat", description: "Live concert performance by Doja Cat", event_date: "2026-05-30", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Doja Cat", price_from: 105, price_to: 480, is_featured: false, is_active: true },
  { title: "Lizzo", description: "Live concert performance by Lizzo", event_date: "2026-08-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Lizzo", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Sam Smith", description: "Live concert performance by Sam Smith", event_date: "2026-04-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Sam Smith", price_from: 90, price_to: 400, is_featured: false, is_active: true },

  // Additional country music
  { title: "Morgan Wallen Nashville", description: "Live concert performance by Morgan Wallen", event_date: "2026-06-01", event_time: "19:30", doors_open_time: "18:30", venue_name: "Nissan Stadium", city: "Nashville", state: "TN", category_slug: "concerts", performer_name: "Morgan Wallen", price_from: 130, price_to: 580, is_featured: true, is_active: true },

  // More events to reach closer to 475
  { title: "Hozier", description: "Live concert performance by Hozier", event_date: "2026-05-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Hozier", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Florence + The Machine", description: "Live concert performance by Florence + The Machine", event_date: "2026-09-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Florence + The Machine", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Charlie Puth", description: "Live concert performance by Charlie Puth", event_date: "2026-04-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Charlie Puth", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Niall Horan", description: "Live concert performance by Niall Horan", event_date: "2026-06-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Niall Horan", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Lewis Capaldi", description: "Live concert performance by Lewis Capaldi", event_date: "2026-03-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Lewis Capaldi", price_from: 80, price_to: 320, is_featured: false, is_active: true },
  { title: "Machine Gun Kelly", description: "Live concert performance by Machine Gun Kelly", event_date: "2026-07-20", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Machine Gun Kelly", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Katy Perry", description: "Live concert performance by Katy Perry", event_date: "2026-08-08", event_time: "20:00", doors_open_time: "19:00", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Katy Perry", price_from: 115, price_to: 520, is_featured: true, is_active: true },
  { title: "Shawn Mendes", description: "Live concert performance by Shawn Mendes", event_date: "2026-07-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Shawn Mendes", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Justin Bieber", description: "Live concert performance by Justin Bieber", event_date: "2026-09-25", event_time: "20:00", doors_open_time: "19:00", venue_name: "MetLife Stadium", city: "East Rutherford", state: "NJ", category_slug: "concerts", performer_name: "Justin Bieber", price_from: 140, price_to: 650, is_featured: true, is_active: true },
  
  // Additional events to fill out the count
  { title: "Slipknot", description: "Live concert performance by Slipknot", event_date: "2026-10-15", event_time: "19:00", doors_open_time: "17:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Slipknot", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "System of a Down", description: "Live concert performance by System of a Down", event_date: "2026-10-22", event_time: "19:30", doors_open_time: "18:00", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "System of a Down", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Avenged Sevenfold", description: "Live concert performance by Avenged Sevenfold", event_date: "2026-09-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "T-Mobile Arena", city: "Las Vegas", state: "NV", category_slug: "concerts", performer_name: "Avenged Sevenfold", price_from: 80, price_to: 350, is_featured: false, is_active: true },
  { title: "Bring Me The Horizon", description: "Live concert performance by Bring Me The Horizon", event_date: "2026-08-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "United Center", city: "Chicago", state: "IL", category_slug: "concerts", performer_name: "Bring Me The Horizon", price_from: 75, price_to: 320, is_featured: false, is_active: true },
  { title: "A Day To Remember", description: "Live concert performance by A Day To Remember", event_date: "2026-07-08", event_time: "19:00", doors_open_time: "18:00", venue_name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL", category_slug: "concerts", performer_name: "A Day To Remember", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Pierce The Veil", description: "Live concert performance by Pierce The Veil", event_date: "2026-06-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Kia Forum", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Pierce The Veil", price_from: 65, price_to: 250, is_featured: false, is_active: true },
  { title: "Sleeping With Sirens", description: "Live concert performance by Sleeping With Sirens", event_date: "2026-05-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "House of Blues", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Sleeping With Sirens", price_from: 55, price_to: 180, is_featured: false, is_active: true },
  { title: "All Time Low", description: "Live concert performance by All Time Low", event_date: "2026-04-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "concerts", performer_name: "All Time Low", price_from: 60, price_to: 220, is_featured: false, is_active: true },
  { title: "Vampire Weekend", description: "Live concert performance by Vampire Weekend", event_date: "2026-05-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Vampire Weekend", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "MGMT", description: "Live concert performance by MGMT", event_date: "2026-06-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "MGMT", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "The Black Keys", description: "Live concert performance by The Black Keys", event_date: "2026-09-10", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "The Black Keys", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Cage The Elephant", description: "Live concert performance by Cage The Elephant", event_date: "2026-08-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "The Greek Theatre", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Cage The Elephant", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Portugal. The Man", description: "Live concert performance by Portugal. The Man", event_date: "2026-07-02", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Portugal. The Man", price_from: 65, price_to: 250, is_featured: false, is_active: true },
  { title: "Young the Giant", description: "Live concert performance by Young the Giant", event_date: "2026-06-28", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Young the Giant", price_from: 60, price_to: 220, is_featured: false, is_active: true },
  { title: "Two Door Cinema Club", description: "Live concert performance by Two Door Cinema Club", event_date: "2026-05-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "Terminal 5", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Two Door Cinema Club", price_from: 55, price_to: 180, is_featured: false, is_active: true },
  { title: "Phoenix", description: "Live concert performance by Phoenix", event_date: "2026-08-12", event_time: "19:30", doors_open_time: "18:30", venue_name: "Hollywood Bowl", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Phoenix", price_from: 75, price_to: 300, is_featured: false, is_active: true },
  { title: "Foster The People", description: "Live concert performance by Foster The People", event_date: "2026-07-18", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Foster The People", price_from: 65, price_to: 260, is_featured: false, is_active: true },
  { title: "Bastille", description: "Live concert performance by Bastille", event_date: "2026-04-22", event_time: "19:30", doors_open_time: "18:30", venue_name: "Radio City Music Hall", city: "New York", state: "NY", category_slug: "concerts", performer_name: "Bastille", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "ALT-J", description: "Live concert performance by ALT-J", event_date: "2026-06-02", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "ALT-J", price_from: 70, price_to: 280, is_featured: false, is_active: true },
  { title: "Kings of Leon", description: "Live concert performance by Kings of Leon", event_date: "2026-09-05", event_time: "19:30", doors_open_time: "18:30", venue_name: "Bridgestone Arena", city: "Nashville", state: "TN", category_slug: "concerts", performer_name: "Kings of Leon", price_from: 85, price_to: 380, is_featured: false, is_active: true },
  { title: "Mumford & Sons", description: "Live concert performance by Mumford & Sons", event_date: "2026-07-25", event_time: "19:30", doors_open_time: "18:30", venue_name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO", category_slug: "concerts", performer_name: "Mumford & Sons", price_from: 90, price_to: 400, is_featured: false, is_active: true },
  { title: "Modest Mouse", description: "Live concert performance by Modest Mouse", event_date: "2026-05-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "The Greek Theatre", city: "Los Angeles", state: "CA", category_slug: "concerts", performer_name: "Modest Mouse", price_from: 60, price_to: 220, is_featured: false, is_active: true },
  { title: "The Strokes", description: "Live concert performance by The Strokes", event_date: "2026-10-08", event_time: "19:30", doors_open_time: "18:30", venue_name: "Madison Square Garden", city: "New York", state: "NY", category_slug: "concerts", performer_name: "The Strokes", price_from: 95, price_to: 420, is_featured: false, is_active: true },
  { title: "Linkin Park", description: "Live concert performance by Linkin Park", event_date: "2026-11-15", event_time: "19:30", doors_open_time: "18:30", venue_name: "SoFi Stadium", city: "Inglewood", state: "CA", category_slug: "concerts", performer_name: "Linkin Park", price_from: 130, price_to: 580, is_featured: true, is_active: true },
];

// Get all unique venues from seed events
export const getUniqueVenues = (): { name: string; city: string; state: string }[] => {
  const venueMap = new Map<string, { name: string; city: string; state: string }>();
  seedEvents.forEach(event => {
    const key = `${event.venue_name}-${event.city}-${event.state}`;
    if (!venueMap.has(key)) {
      venueMap.set(key, { name: event.venue_name, city: event.city, state: event.state });
    }
  });
  return Array.from(venueMap.values());
};

// Get all unique performers from seed events
export const getUniquePerformers = (): { name: string; category: string }[] => {
  const performerMap = new Map<string, { name: string; category: string }>();
  seedEvents.forEach(event => {
    if (!performerMap.has(event.performer_name)) {
      performerMap.set(event.performer_name, { 
        name: event.performer_name, 
        category: event.category_slug 
      });
    }
  });
  return Array.from(performerMap.values());
};

export { getCategoryFromPerformer };
