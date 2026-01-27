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
  
  // R&B
  "SZA": "/performers/singer-stage.jpg",
  "Mariah the Scientist": "/performers/singer-stage.jpg",
  "Usher": "/performers/singer-stage.jpg",
  "Beyoncé": "/performers/singer-stage.jpg",
  "Doja Cat": "/performers/singer-stage.jpg",
  "Lizzo": "/performers/singer-stage.jpg",
  "Sam Smith": "/performers/singer-stage.jpg",
  
  // Rock/Alternative
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
  
  // EDM/Electronic
  "Illenium": "/performers/edm-lights.jpg",
  "Fred Again": "/performers/edm-lights.jpg",
  "INZO": "/performers/dj-booth.jpg",
  
  // Legends
  "Elton John": "/performers/piano-concert.jpg",
  "Adele": "/performers/singer-stage.jpg",
  "Celine Dion": "/performers/singer-stage.jpg",
  "The Eagles": "/performers/rock-concert.jpg",
  "Journey": "/performers/rock-concert.jpg",
  "James Taylor": "/performers/concert-generic.jpg",
  "John Mellencamp": "/performers/rock-concert.jpg",
  
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
  "Chicago Bears": "/performers/sports-football.jpg",
  "Dallas Cowboys": "/performers/sports-football.jpg",
  "NY Giants": "/performers/sports-football.jpg",
  "SF 49ers": "/performers/sports-football.jpg",
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
  "Boston Bruins": "/performers/hockey-ice.jpg",
  "Chicago Blackhawks": "/performers/hockey-ice.jpg",
  "New Jersey Devils": "/performers/hockey-ice.jpg",
  "NY Rangers": "/performers/hockey-ice.jpg",
  "Vegas Golden Knights": "/performers/hockey-ice.jpg",
  "Seattle Kraken": "/performers/hockey-ice.jpg",
  "New York Yankees": "/performers/baseball-field.jpg",
  "LA Dodgers": "/performers/baseball-field.jpg",
  "Boston Red Sox": "/performers/baseball-field.jpg",
  "Chicago Cubs": "/performers/baseball-field.jpg",
  "Philadelphia Phillies": "/performers/baseball-field.jpg",
  "World Baseball Classic": "/performers/baseball-field.jpg",
  
  // Theater
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
  
  // Comedy
  "Nate Bargatze": "/performers/comedy-mic.jpg",
  "Shane Gillis": "/performers/comedy-mic.jpg",
  "Jo Koy": "/performers/comedy-mic.jpg",
  "Katt Williams": "/performers/comedy-mic.jpg",
  "Matt Rife": "/performers/comedy-mic.jpg",
  "Dancing with the Stars": "/performers/event-lights.jpg",
};

// Default image by category
const categoryDefaultImages: Record<string, string> = {
  concerts: "/performers/concert-generic.jpg",
  sports: "/performers/sports-stadium.jpg",
  theater: "/performers/theater-stage.jpg",
  comedy: "/performers/comedy-mic.jpg",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results = {
      venues: { created: 0, existing: 0 },
      performers: { created: 0, existing: 0 },
      events: { created: 0, existing: 0 },
    };

    // Get existing categories
    const { data: categories } = await supabase
      .from("categories")
      .select("id, slug");
    
    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || []);

    // Seed venues
    const venues = [
      { name: "Pinnacle Bank Arena", city: "Lincoln", state: "NE" },
      { name: "Nebraska Memorial Stadium", city: "Lincoln", state: "NE" },
      { name: "The Arena at CHI Health Center Omaha", city: "Omaha", state: "NE" },
      { name: "Madison Square Garden", city: "New York", state: "NY" },
      { name: "MetLife Stadium", city: "East Rutherford", state: "NJ" },
      { name: "Barclays Center", city: "Brooklyn", state: "NY" },
      { name: "Radio City Music Hall", city: "New York", state: "NY" },
      { name: "SoFi Stadium", city: "Inglewood", state: "CA" },
      { name: "Kia Forum", city: "Inglewood", state: "CA" },
      { name: "Crypto.com Arena", city: "Los Angeles", state: "CA" },
      { name: "Soldier Field", city: "Chicago", state: "IL" },
      { name: "United Center", city: "Chicago", state: "IL" },
      { name: "TD Garden", city: "Boston", state: "MA" },
      { name: "Gillette Stadium", city: "Foxborough", state: "MA" },
      { name: "Fenway Park", city: "Boston", state: "MA" },
      { name: "Hard Rock Stadium", city: "Miami Gardens", state: "FL" },
      { name: "Kaseya Center", city: "Miami", state: "FL" },
      { name: "Lincoln Financial Field", city: "Philadelphia", state: "PA" },
      { name: "Climate Pledge Arena", city: "Seattle", state: "WA" },
      { name: "Ball Arena", city: "Denver", state: "CO" },
      { name: "Red Rocks Amphitheatre", city: "Morrison", state: "CO" },
      { name: "NRG Stadium", city: "Houston", state: "TX" },
      { name: "Toyota Center", city: "Houston", state: "TX" },
      { name: "State Farm Arena", city: "Atlanta", state: "GA" },
      { name: "Mercedes-Benz Stadium", city: "Atlanta", state: "GA" },
      { name: "State Farm Stadium", city: "Glendale", state: "AZ" },
      { name: "AT&T Stadium", city: "Arlington", state: "TX" },
      { name: "American Airlines Center", city: "Dallas", state: "TX" },
      { name: "Allegiant Stadium", city: "Las Vegas", state: "NV" },
      { name: "T-Mobile Arena", city: "Las Vegas", state: "NV" },
      { name: "MSG Sphere", city: "Las Vegas", state: "NV" },
      { name: "The Colosseum at Caesars", city: "Las Vegas", state: "NV" },
      { name: "Richard Rodgers Theatre", city: "New York", state: "NY" },
      { name: "Minskoff Theatre", city: "New York", state: "NY" },
      { name: "Gershwin Theatre", city: "New York", state: "NY" },
      { name: "Lyric Theatre", city: "New York", state: "NY" },
      { name: "Imperial Theatre", city: "New York", state: "NY" },
      { name: "Dodger Stadium", city: "Los Angeles", state: "CA" },
      { name: "Wrigley Field", city: "Chicago", state: "IL" },
      { name: "Levi's Stadium", city: "Santa Clara", state: "CA" },
    ];

    for (const venue of venues) {
      const { data: existing } = await supabase
        .from("venues")
        .select("id")
        .eq("name", venue.name)
        .single();

      if (!existing) {
        await supabase.from("venues").insert(venue);
        results.venues.created++;
      } else {
        results.venues.existing++;
      }
    }

    // Get venues map
    const { data: allVenues } = await supabase.from("venues").select("id, name");
    const venueMap = new Map(allVenues?.map(v => [v.name, v.id]) || []);

    // Seed performers with local images
    const performers = [
      { name: "Taylor Swift", category: "concerts" },
      { name: "Harry Styles", category: "concerts" },
      { name: "Drake", category: "concerts" },
      { name: "Beyoncé", category: "concerts" },
      { name: "BTS", category: "concerts" },
      { name: "Bruno Mars", category: "concerts" },
      { name: "The Weeknd", category: "concerts" },
      { name: "Bad Bunny", category: "concerts" },
      { name: "Lady Gaga", category: "concerts" },
      { name: "Billie Eilish", category: "concerts" },
      { name: "Coldplay", category: "concerts" },
      { name: "Ariana Grande", category: "concerts" },
      { name: "Justin Bieber", category: "concerts" },
      { name: "The Rolling Stones", category: "concerts" },
      { name: "U2", category: "concerts" },
      { name: "Metallica", category: "concerts" },
      { name: "Kendrick Lamar", category: "concerts" },
      { name: "Travis Scott", category: "concerts" },
      { name: "Adele", category: "concerts" },
      { name: "Elton John", category: "concerts" },
      { name: "The Eagles", category: "concerts" },
      { name: "Foo Fighters", category: "concerts" },
      { name: "Red Hot Chili Peppers", category: "concerts" },
      { name: "My Chemical Romance", category: "concerts" },
      { name: "Tame Impala", category: "concerts" },
      { name: "Chris Stapleton", category: "concerts" },
      { name: "Morgan Wallen", category: "concerts" },
      { name: "Zach Bryan", category: "concerts" },
      { name: "Cardi B", category: "concerts" },
      { name: "World Cup", category: "sports" },
      { name: "WWE", category: "sports" },
      { name: "UFC", category: "sports" },
      { name: "Chicago Bears", category: "sports" },
      { name: "Dallas Cowboys", category: "sports" },
      { name: "Hamilton", category: "theater" },
      { name: "The Lion King", category: "theater" },
      { name: "Wicked", category: "theater" },
      { name: "Cirque du Soleil", category: "theater" },
      { name: "Les Misérables", category: "theater" },
      { name: "Nate Bargatze", category: "theater" },
      { name: "Shane Gillis", category: "theater" },
    ];

    for (const performer of performers) {
      const { data: existing } = await supabase
        .from("performers")
        .select("id")
        .eq("name", performer.name)
        .single();

      if (!existing) {
        const imageUrl = performerImageMap[performer.name] || categoryDefaultImages[performer.category] || "/performers/concert-generic.jpg";
        const categoryId = categoryMap.get(performer.category);
        
        await supabase.from("performers").insert({
          name: performer.name,
          image_url: imageUrl,
          category_id: categoryId,
          slug: performer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        });
        results.performers.created++;
      } else {
        results.performers.existing++;
      }
    }

    // Get performers map
    const { data: allPerformers } = await supabase.from("performers").select("id, name");
    const performerMap = new Map(allPerformers?.map(p => [p.name, p.id]) || []);

    // Seed featured events
    const events = [
      { title: "Taylor Swift Concert", description: "Live concert performance by Taylor Swift", event_date: "2026-06-15", event_time: "19:00", venue_name: "Gillette Stadium", category_slug: "concerts", performer_name: "Taylor Swift", price_from: 180, price_to: 950, is_featured: true },
      { title: "Harry Styles Concert", description: "Live concert performance by Harry Styles", event_date: "2026-09-02", event_time: "20:00", venue_name: "Madison Square Garden", category_slug: "concerts", performer_name: "Harry Styles", price_from: 130, price_to: 580, is_featured: true },
      { title: "Drake Concert", description: "Live concert performance by Drake", event_date: "2026-07-22", event_time: "20:00", venue_name: "Madison Square Garden", category_slug: "concerts", performer_name: "Drake", price_from: 145, price_to: 680, is_featured: true },
      { title: "Beyoncé Concert", description: "Live concert performance by Beyoncé", event_date: "2026-09-18", event_time: "20:00", venue_name: "SoFi Stadium", category_slug: "concerts", performer_name: "Beyoncé", price_from: 220, price_to: 980, is_featured: true },
      { title: "BTS Concert", description: "Live concert performance by BTS", event_date: "2026-08-27", event_time: "20:00", venue_name: "Soldier Field", category_slug: "concerts", performer_name: "BTS", price_from: 155, price_to: 720, is_featured: true },
      { title: "Bruno Mars Concert", description: "Live concert performance by Bruno Mars", event_date: "2026-05-17", event_time: "19:30", venue_name: "Soldier Field", category_slug: "concerts", performer_name: "Bruno Mars", price_from: 120, price_to: 575, is_featured: true },
      { title: "Lady Gaga Concert", description: "Live concert performance by Lady Gaga", event_date: "2026-02-23", event_time: "20:00", venue_name: "Kia Forum", category_slug: "concerts", performer_name: "Lady Gaga", price_from: 135, price_to: 590, is_featured: true },
      { title: "Billie Eilish Concert", description: "Live concert performance by Billie Eilish", event_date: "2026-06-08", event_time: "19:30", venue_name: "Kia Forum", category_slug: "concerts", performer_name: "Billie Eilish", price_from: 125, price_to: 570, is_featured: true },
      { title: "Coldplay Concert", description: "Live concert performance by Coldplay", event_date: "2026-08-20", event_time: "20:00", venue_name: "MetLife Stadium", category_slug: "concerts", performer_name: "Coldplay", price_from: 135, price_to: 620, is_featured: true },
      { title: "The Weeknd Concert", description: "Live concert performance by The Weeknd", event_date: "2026-08-05", event_time: "20:00", venue_name: "SoFi Stadium", category_slug: "concerts", performer_name: "The Weeknd", price_from: 138, price_to: 640, is_featured: true },
      { title: "Bad Bunny Concert", description: "Live concert performance by Bad Bunny", event_date: "2026-05-10", event_time: "20:00", venue_name: "MetLife Stadium", category_slug: "concerts", performer_name: "Bad Bunny", price_from: 152, price_to: 710, is_featured: true },
      { title: "Ariana Grande Concert", description: "Live concert performance by Ariana Grande", event_date: "2026-06-30", event_time: "19:30", venue_name: "Madison Square Garden", category_slug: "concerts", performer_name: "Ariana Grande", price_from: 130, price_to: 590, is_featured: true },
      { title: "Justin Bieber Concert", description: "Live concert performance by Justin Bieber", event_date: "2026-08-28", event_time: "20:00", venue_name: "MetLife Stadium", category_slug: "concerts", performer_name: "Justin Bieber", price_from: 148, price_to: 690, is_featured: true },
      { title: "Adele Concert", description: "Live concert performance by Adele", event_date: "2026-05-28", event_time: "20:00", venue_name: "The Colosseum at Caesars", category_slug: "concerts", performer_name: "Adele", price_from: 225, price_to: 1100, is_featured: true },
      { title: "Elton John Farewell Tour", description: "Live concert performance by Elton John", event_date: "2026-06-15", event_time: "19:30", venue_name: "T-Mobile Arena", category_slug: "concerts", performer_name: "Elton John", price_from: 185, price_to: 950, is_featured: true },
      { title: "The Eagles Concert", description: "Live concert performance by The Eagles", event_date: "2026-01-31", event_time: "20:30", venue_name: "MSG Sphere", category_slug: "concerts", performer_name: "The Eagles", price_from: 195, price_to: 980, is_featured: true },
      { title: "Brazil vs Morocco - World Cup", description: "FIFA World Cup Match", event_date: "2026-06-13", event_time: "18:00", venue_name: "MetLife Stadium", category_slug: "sports", performer_name: "World Cup", price_from: 200, price_to: 800, is_featured: true },
      { title: "WWE WrestleMania 42", description: "WWE WrestleMania 42 event", event_date: "2026-04-18", event_time: "18:00", venue_name: "Allegiant Stadium", category_slug: "sports", performer_name: "WWE", price_from: 250, price_to: 1200, is_featured: true },
      { title: "UFC Fight Night Las Vegas", description: "UFC Mixed Martial Arts event", event_date: "2026-02-21", event_time: "18:00", venue_name: "T-Mobile Arena", category_slug: "sports", performer_name: "UFC", price_from: 120, price_to: 680, is_featured: true },
      { title: "Green Bay Packers at Chicago Bears", description: "NFL Football game", event_date: "2026-11-29", event_time: "13:00", venue_name: "Soldier Field", category_slug: "sports", performer_name: "Chicago Bears", price_from: 95, price_to: 520, is_featured: true },
      { title: "New York Giants at Dallas Cowboys", description: "NFL Football game", event_date: "2026-12-20", event_time: "13:00", venue_name: "AT&T Stadium", category_slug: "sports", performer_name: "Dallas Cowboys", price_from: 105, price_to: 570, is_featured: true },
      { title: "Hamilton Musical", description: "Broadway musical Hamilton", event_date: "2026-01-27", event_time: "19:00", venue_name: "Richard Rodgers Theatre", category_slug: "theater", performer_name: "Hamilton", price_from: 125, price_to: 500, is_featured: true },
      { title: "The Lion King Musical", description: "Disney's The Lion King Broadway musical", event_date: "2026-01-27", event_time: "19:00", venue_name: "Minskoff Theatre", category_slug: "theater", performer_name: "The Lion King", price_from: 110, price_to: 445, is_featured: true },
      { title: "Wicked Musical", description: "Wicked Broadway musical", event_date: "2026-03-10", event_time: "19:00", venue_name: "Gershwin Theatre", category_slug: "theater", performer_name: "Wicked", price_from: 145, price_to: 610, is_featured: true },
      { title: "Les Misérables", description: "Les Misérables musical", event_date: "2026-08-22", event_time: "19:00", venue_name: "Imperial Theatre", category_slug: "theater", performer_name: "Les Misérables", price_from: 125, price_to: 535, is_featured: true },
    ];

    for (const event of events) {
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("title", event.title)
        .eq("event_date", event.event_date)
        .single();

      if (!existing) {
        const venueId = venueMap.get(event.venue_name);
        const categoryId = categoryMap.get(event.category_slug);
        const performerId = performerMap.get(event.performer_name);
        const imageUrl = performerImageMap[event.performer_name] || categoryDefaultImages[event.category_slug] || "/performers/concert-generic.jpg";

        await supabase.from("events").insert({
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          event_time: event.event_time,
          venue_id: venueId,
          category_id: categoryId,
          performer_id: performerId,
          price_from: event.price_from,
          price_to: event.price_to,
          is_featured: event.is_featured,
          is_active: true,
          image_url: imageUrl,
        });
        results.events.created++;
      } else {
        results.events.existing++;
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error seeding data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
