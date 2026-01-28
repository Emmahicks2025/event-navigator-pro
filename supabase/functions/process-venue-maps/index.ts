import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Find matching venue from database
function findBestMatch(fileName: string, venues: { id: string; name: string }[]): { id: string; name: string } | null {
  const normalizedFileName = normalizeVenueName(fileName);
  
  // Exact match
  for (const venue of venues) {
    if (normalizeVenueName(venue.name) === normalizedFileName) {
      return venue;
    }
  }
  
  // Contains match
  for (const venue of venues) {
    const normalizedVenueName = normalizeVenueName(venue.name);
    if (normalizedVenueName.includes(normalizedFileName) || normalizedFileName.includes(normalizedVenueName)) {
      return venue;
    }
  }
  
  // Fuzzy match with key words
  const fileWords = normalizedFileName.split(' ').filter(w => w.length > 2);
  for (const venue of venues) {
    const normalizedVenueName = normalizeVenueName(venue.name);
    const matchCount = fileWords.filter(word => normalizedVenueName.includes(word)).length;
    if (matchCount >= 2 || (matchCount >= 1 && fileWords.length <= 2)) {
      return venue;
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let zipBuffer: ArrayBuffer;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const zipFile = formData.get('zipFile') as File;
      
      if (!zipFile) {
        return new Response(
          JSON.stringify({ error: "zipFile is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Processing zip file: ${zipFile.name}, size: ${zipFile.size}`);
      zipBuffer = await zipFile.arrayBuffer();
    } else {
      // JSON body with zipUrl
      const body = await req.json();
      if (!body.zipUrl) {
        return new Response(
          JSON.stringify({ error: "zipUrl or zipFile is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Fetching zip from URL: ${body.zipUrl}`);
      const response = await fetch(body.zipUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch zip: ${response.statusText}`);
      }
      zipBuffer = await response.arrayBuffer();
    }

    console.log(`Zip buffer size: ${zipBuffer.byteLength}`);
    
    const zip = new JSZip();
    await zip.loadAsync(zipBuffer);
    
    // Access files through the files() method and cast
    const filesMap = zip.files() as Record<string, any>;
    const allFileNames = Object.keys(filesMap);
    
    console.log(`Total files in zip: ${allFileNames.length}`);
    console.log(`Sample file names: ${allFileNames.slice(0, 15).join(', ')}`);
    
    const venueMapFiles = new Map<string, string>();
    
    // Process files
    for (const fileName of allFileNames) {
      const file = filesMap[fileName];
      
      if (file.dir) continue;
      
      const lowerName = fileName.toLowerCase();
      const isTextFile = lowerName.endsWith('.txt') || lowerName.endsWith('.svg') || lowerName.endsWith('.xml');
      
      if (isTextFile) {
        try {
          const content = await file.async('string');
          // Check for SVG content markers
          if (content.includes('<svg') || content.includes('<path') || content.includes('<g ') || content.includes('viewBox')) {
            const baseName = fileName.split('/').pop() || fileName;
            venueMapFiles.set(baseName, content);
            console.log(`Found SVG map: ${baseName} (${content.length} chars)`);
          } else {
            console.log(`File ${fileName} no SVG (first 50 chars: ${content.substring(0, 50).replace(/\n/g, ' ')})`);
          }
        } catch (e) {
          console.error(`Error reading ${fileName}: ${e}`);
        }
      } else {
        console.log(`Skipping non-text file: ${fileName}`);
      }
    }

    console.log(`Found ${venueMapFiles.size} venue map files in zip`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all venues
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('id, name, svg_map');
    
    if (venuesError) {
      throw new Error(`Failed to fetch venues: ${venuesError.message}`);
    }

    console.log(`Found ${venues?.length || 0} venues in database`);

    const results = {
      totalMaps: venueMapFiles.size,
      matched: 0,
      updated: 0,
      skipped: 0,
      unmatched: [] as string[],
      matches: [] as { fileName: string; venueName: string }[],
    };

    // Process each map file
    for (const [fileName, svgContent] of venueMapFiles) {
      const matchedVenue = findBestMatch(fileName, venues || []);
      
      if (matchedVenue) {
        results.matched++;
        results.matches.push({ fileName, venueName: matchedVenue.name });
        
        // Check if venue already has a map
        const existingVenue = venues?.find(v => v.id === matchedVenue.id);
        if (existingVenue?.svg_map) {
          results.skipped++;
          console.log(`Venue ${matchedVenue.name} already has map, skipping`);
          continue;
        }
        
        // Update venue with SVG map
        const { error: updateError } = await supabase
          .from('venues')
          .update({ svg_map: svgContent })
          .eq('id', matchedVenue.id);
        
        if (updateError) {
          console.error(`Failed to update ${matchedVenue.name}: ${updateError.message}`);
        } else {
          results.updated++;
          console.log(`Updated venue: ${matchedVenue.name}`);
        }
      } else {
        results.unmatched.push(fileName);
        console.log(`No match found for: ${fileName}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        venueMapFileNames: Array.from(venueMapFiles.keys()),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing venue maps:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to process venue maps" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
