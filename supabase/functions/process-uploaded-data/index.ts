import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  doorsOpenTime: string;
  venueName: string;
  categoryName: string;
  performerName: string;
  imageUrl: string;
  priceFrom: number;
  priceTo: number;
  isFeatured: boolean;
  isActive: boolean;
}

// Normalize venue names for matching
function normalizeVenueName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\-]/g, ' ')
    .replace(/\.txt$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Find the best matching venue from the map files
function findMatchingVenue(eventVenueName: string, venueMapFiles: Map<string, string>): string | null {
  const normalizedEventVenue = normalizeVenueName(eventVenueName);
  
  // First try exact match
  for (const [fileName, svgContent] of venueMapFiles) {
    const normalizedFileName = normalizeVenueName(fileName);
    if (normalizedFileName === normalizedEventVenue) {
      console.log(`Exact match found: ${eventVenueName} -> ${fileName}`);
      return svgContent;
    }
  }
  
  // Try contains match
  for (const [fileName, svgContent] of venueMapFiles) {
    const normalizedFileName = normalizeVenueName(fileName);
    if (normalizedFileName.includes(normalizedEventVenue) || normalizedEventVenue.includes(normalizedFileName)) {
      console.log(`Contains match found: ${eventVenueName} -> ${fileName}`);
      return svgContent;
    }
  }
  
  // Try fuzzy match with key words
  const eventWords = normalizedEventVenue.split(' ').filter(w => w.length > 2);
  for (const [fileName, svgContent] of venueMapFiles) {
    const normalizedFileName = normalizeVenueName(fileName);
    const matchCount = eventWords.filter(word => normalizedFileName.includes(word)).length;
    if (matchCount >= 2 || (matchCount >= 1 && eventWords.length <= 2)) {
      console.log(`Fuzzy match found: ${eventVenueName} -> ${fileName} (${matchCount} words matched)`);
      return svgContent;
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventsData, venueMaps } = await req.json();
    
    if (!eventsData || !Array.isArray(eventsData)) {
      return new Response(
        JSON.stringify({ error: "eventsData array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${eventsData.length} events and ${Object.keys(venueMaps || {}).length} venue maps`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create venue maps Map
    const venueMapFiles = new Map<string, string>(Object.entries(venueMaps || {}));

    // Get existing categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, slug, name');
    
    const categoryMap = new Map(existingCategories?.map(c => [c.slug.toLowerCase(), c.id]) || []);
    console.log(`Found ${categoryMap.size} existing categories`);

    // Get existing performers
    const { data: existingPerformers } = await supabase
      .from('performers')
      .select('id, name');
    
    const performerMap = new Map(existingPerformers?.map(p => [p.name.toLowerCase(), p.id]) || []);
    console.log(`Found ${performerMap.size} existing performers`);

    // Get existing venues
    const { data: existingVenues } = await supabase
      .from('venues')
      .select('id, name, svg_map');
    
    const venueMap = new Map(existingVenues?.map(v => [v.name.toLowerCase(), { id: v.id, hasSvg: !!v.svg_map }]) || []);
    console.log(`Found ${venueMap.size} existing venues`);

    // Get existing events to avoid duplicates
    const { data: existingEvents } = await supabase
      .from('events')
      .select('title, event_date');
    
    const existingEventSet = new Set(existingEvents?.map(e => `${e.title}|${e.event_date}`) || []);
    console.log(`Found ${existingEventSet.size} existing events`);

    const results = {
      venuesCreated: 0,
      venuesUpdated: 0,
      eventsCreated: 0,
      eventsSkipped: 0,
      performersCreated: 0,
      mapsMatched: 0,
      errors: [] as string[],
    };

    // Process each event
    for (const eventData of eventsData) {
      if (!eventData.title || !eventData.venueName) continue;

      // Skip if event already exists
      const eventKey = `${eventData.title}|${eventData.eventDate}`;
      if (existingEventSet.has(eventKey)) {
        results.eventsSkipped++;
        continue;
      }

      try {
        // Handle venue
        let venueInfo = venueMap.get(eventData.venueName.toLowerCase());
        const svgMap = findMatchingVenue(eventData.venueName, venueMapFiles);
        
        if (!venueInfo) {
          // Create new venue
          const { data: newVenue, error: venueError } = await supabase
            .from('venues')
            .insert({
              name: eventData.venueName,
              city: 'Unknown',
              svg_map: svgMap,
            })
            .select('id')
            .single();

          if (venueError) {
            results.errors.push(`Failed to create venue ${eventData.venueName}: ${venueError.message}`);
            continue;
          }

          venueInfo = { id: newVenue.id, hasSvg: !!svgMap };
          venueMap.set(eventData.venueName.toLowerCase(), venueInfo);
          results.venuesCreated++;
          if (svgMap) results.mapsMatched++;
        } else if (svgMap && !venueInfo.hasSvg) {
          // Update existing venue with SVG map if it doesn't have one
          const { error: updateError } = await supabase
            .from('venues')
            .update({ svg_map: svgMap })
            .eq('id', venueInfo.id);

          if (!updateError) {
            venueInfo.hasSvg = true;
            results.venuesUpdated++;
            results.mapsMatched++;
          }
        }

        // Handle performer
        let performerId = performerMap.get(eventData.performerName?.toLowerCase());
        
        if (!performerId && eventData.performerName) {
          const { data: newPerformer, error: performerError } = await supabase
            .from('performers')
            .insert({
              name: eventData.performerName,
              image_url: eventData.imageUrl,
            })
            .select('id')
            .single();

          if (!performerError && newPerformer) {
            performerId = newPerformer.id;
            performerMap.set(eventData.performerName.toLowerCase(), performerId);
            results.performersCreated++;
          }
        }

        // Get category ID
        const categoryId = categoryMap.get(eventData.categoryName?.toLowerCase());

        // Create event
        const { error: eventError } = await supabase
          .from('events')
          .insert({
            title: eventData.title,
            description: eventData.description,
            event_date: eventData.eventDate,
            event_time: eventData.eventTime || null,
            doors_open_time: eventData.doorsOpenTime || null,
            venue_id: venueInfo.id,
            category_id: categoryId || null,
            performer_id: performerId || null,
            image_url: eventData.imageUrl,
            price_from: eventData.priceFrom || 0,
            price_to: eventData.priceTo || 0,
            is_featured: eventData.isFeatured || false,
            is_active: eventData.isActive !== false,
          });

        if (eventError) {
          results.errors.push(`Failed to create event ${eventData.title}: ${eventError.message}`);
        } else {
          results.eventsCreated++;
          existingEventSet.add(eventKey);
        }
      } catch (err) {
        results.errors.push(`Error processing ${eventData.title}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`Import complete:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error importing events:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to import events" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
