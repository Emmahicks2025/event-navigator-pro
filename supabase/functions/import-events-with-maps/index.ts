import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";

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

interface VenueMapData {
  venueName: string;
  svgContent: string;
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
      return svgContent;
    }
  }
  
  // Try contains match
  for (const [fileName, svgContent] of venueMapFiles) {
    const normalizedFileName = normalizeVenueName(fileName);
    if (normalizedFileName.includes(normalizedEventVenue) || normalizedEventVenue.includes(normalizedFileName)) {
      return svgContent;
    }
  }
  
  // Try fuzzy match with key words
  const eventWords = normalizedEventVenue.split(' ').filter(w => w.length > 2);
  for (const [fileName, svgContent] of venueMapFiles) {
    const normalizedFileName = normalizeVenueName(fileName);
    const matchCount = eventWords.filter(word => normalizedFileName.includes(word)).length;
    if (matchCount >= 2 || (matchCount >= 1 && eventWords.length <= 2)) {
      return svgContent;
    }
  }
  
  return null;
}

// Parse Excel data from JSON format
function parseEventRow(row: string[]): EventData | null {
  if (!row || row.length < 12 || !row[0] || row[0] === 'title') return null;
  
  return {
    title: row[0] || '',
    description: row[1] || '',
    eventDate: row[2] || '',
    eventTime: row[3] || '',
    doorsOpenTime: row[4] || '',
    venueName: row[5] || '',
    categoryName: row[6] || '',
    performerName: row[7] || '',
    imageUrl: (row[8] || '').replace(/<|>/g, ''),
    priceFrom: parseFloat(row[9]) || 0,
    priceTo: parseFloat(row[10]) || 0,
    isFeatured: row[11]?.toUpperCase() === 'TRUE',
    isActive: row[12]?.toUpperCase() !== 'FALSE',
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const zipFile = formData.get('zipFile') as File;
    const eventsJson = formData.get('eventsData') as string;
    
    if (!zipFile || !eventsJson) {
      return new Response(
        JSON.stringify({ error: "Both zipFile and eventsData are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the events data
    const eventsData: string[][] = JSON.parse(eventsJson);
    
    // Extract venue maps from zip
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = new JSZip();
    await zip.loadAsync(zipBuffer);
    
    const venueMapFiles = new Map<string, string>();
    
    for (const [fileName, file] of Object.entries(zip.files)) {
      if (!file.dir && fileName.endsWith('.txt')) {
        const content = await file.async('string');
        if (content.includes('<svg') || content.includes('<path')) {
          venueMapFiles.set(fileName.split('/').pop() || fileName, content);
        }
      }
    }

    console.log(`Found ${venueMapFiles.size} venue map files in zip`);
    console.log(`Processing ${eventsData.length} event rows`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get existing categories
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, slug, name');
    
    const categoryMap = new Map(existingCategories?.map(c => [c.slug.toLowerCase(), c.id]) || []);

    // Get existing performers
    const { data: existingPerformers } = await supabase
      .from('performers')
      .select('id, name');
    
    const performerMap = new Map(existingPerformers?.map(p => [p.name.toLowerCase(), p.id]) || []);

    // Get existing venues
    const { data: existingVenues } = await supabase
      .from('venues')
      .select('id, name');
    
    const venueMap = new Map(existingVenues?.map(v => [v.name.toLowerCase(), v.id]) || []);

    const results = {
      venuesCreated: 0,
      venuesUpdated: 0,
      eventsCreated: 0,
      performersCreated: 0,
      mapsMatched: 0,
      errors: [] as string[],
    };

    // Process each event
    for (const row of eventsData) {
      const eventData = parseEventRow(row);
      if (!eventData) continue;

      try {
        // Handle venue
        let venueId = venueMap.get(eventData.venueName.toLowerCase());
        const svgMap = findMatchingVenue(eventData.venueName, venueMapFiles);
        
        if (!venueId) {
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

          venueId = newVenue.id;
          venueMap.set(eventData.venueName.toLowerCase(), venueId);
          results.venuesCreated++;
          if (svgMap) results.mapsMatched++;
        } else if (svgMap) {
          // Update existing venue with SVG map if it doesn't have one
          const { error: updateError } = await supabase
            .from('venues')
            .update({ svg_map: svgMap })
            .eq('id', venueId)
            .is('svg_map', null);

          if (!updateError) {
            results.venuesUpdated++;
            results.mapsMatched++;
          }
        }

        // Handle performer
        let performerId = performerMap.get(eventData.performerName.toLowerCase());
        
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
        const categoryId = categoryMap.get(eventData.categoryName.toLowerCase());

        // Create event
        const { error: eventError } = await supabase
          .from('events')
          .insert({
            title: eventData.title,
            description: eventData.description,
            event_date: eventData.eventDate,
            event_time: eventData.eventTime,
            doors_open_time: eventData.doorsOpenTime,
            venue_id: venueId,
            category_id: categoryId,
            performer_id: performerId,
            image_url: eventData.imageUrl,
            price_from: eventData.priceFrom,
            price_to: eventData.priceTo,
            is_featured: eventData.isFeatured,
            is_active: eventData.isActive,
          });

        if (eventError) {
          results.errors.push(`Failed to create event ${eventData.title}: ${eventError.message}`);
        } else {
          results.eventsCreated++;
        }
      } catch (err) {
        results.errors.push(`Error processing ${eventData.title}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        venueMapFilesFound: venueMapFiles.size,
        venueMapFileNames: Array.from(venueMapFiles.keys()),
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
