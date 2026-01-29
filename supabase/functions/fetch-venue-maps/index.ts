import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VenueData {
  id: string;
  name: string;
  city: string;
  state: string | null;
}

// Build search query for gotickets.com
function buildSearchQuery(venue: VenueData): string {
  const parts = [venue.name];
  if (venue.city) parts.push(venue.city);
  if (venue.state) parts.push(venue.state);
  return `site:gotickets.com ${parts.join(' ')} tickets`;
}

// Extract SVG from HTML content
function extractSvgFromHtml(html: string): string | null {
  // Look for SVG with class patterns common on gotickets
  const svgPatterns = [
    /<svg[^>]*class="[^"]*interactive[^"]*"[^>]*>[\s\S]*?<\/svg>/gi,
    /<svg[^>]*class="[^"]*zoom-transition[^"]*"[^>]*>[\s\S]*?<\/svg>/gi,
    /<svg[^>]*id="[^"]*map[^"]*"[^>]*>[\s\S]*?<\/svg>/gi,
    /<svg[^>]*viewBox[^>]*>[\s\S]*?<\/svg>/gi,
  ];

  for (const pattern of svgPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      // Find the largest SVG (likely the venue map)
      const largest = matches.reduce((a, b) => a.length > b.length ? a : b);
      // Only accept if it has section-like IDs
      if (largest.includes('-section') || largest.includes('-group') || /id="\d{1,3}"/.test(largest)) {
        return largest;
      }
    }
  }
  return null;
}

// Parse SVG to extract section IDs for creating sections
function extractSectionIds(svgContent: string): string[] {
  const ids: string[] = [];
  
  // Match patterns like id="101-group", id="101-section", id="A1-group"
  const idPattern = /id="([A-Za-z0-9]+)(?:-(?:group|section))"/gi;
  let match;
  while ((match = idPattern.exec(svgContent)) !== null) {
    const id = match[1];
    // Only add unique IDs
    if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}

// Determine section type from ID
function getSectionType(sectionId: string): string {
  // Check if numeric
  const num = parseInt(sectionId, 10);
  if (!isNaN(num)) {
    if (num < 100) return 'floor';
    if (num < 200) return 'lower';
    if (num < 300) return 'club';
    return 'upper';
  }
  
  // Text-based IDs
  const lower = sectionId.toLowerCase();
  if (lower.includes('floor') || lower.includes('pit') || lower.includes('ga')) return 'floor';
  if (lower.includes('vip') || lower.includes('suite') || lower.includes('box')) return 'vip';
  if (lower.includes('club') || lower.includes('premium')) return 'club';
  if (lower.includes('upper') || lower.includes('balcony')) return 'upper';
  if (lower.includes('lower') || lower.includes('100')) return 'lower';
  
  return 'standard';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { venueIds, limit = 10, createSections = true } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get venues needing SVG maps
    let query = supabase
      .from('venues')
      .select('id, name, city, state')
      .is('svg_map', null)
      .limit(limit);

    if (venueIds && venueIds.length > 0) {
      query = supabase
        .from('venues')
        .select('id, name, city, state')
        .in('id', venueIds)
        .limit(limit);
    }

    const { data: venues, error: venueError } = await query;

    if (venueError) {
      console.error('Error fetching venues:', venueError);
      return new Response(
        JSON.stringify({ success: false, error: venueError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${venues?.length || 0} venues`);

    const results: any[] = [];

    for (const venue of venues || []) {
      try {
        console.log(`Searching for SVG map: ${venue.name}`);
        
        // Search for the venue on gotickets.com
        const searchQuery = buildSearchQuery(venue);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 3,
            scrapeOptions: {
              formats: ['html'],
            },
          }),
        });

        if (!searchResponse.ok) {
          console.log(`Search failed for ${venue.name}: ${searchResponse.status}`);
          results.push({ venue: venue.name, success: false, error: 'Search failed' });
          continue;
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.data || [];

        let svgFound = false;

        for (const result of searchResults) {
          if (svgFound) break;
          
          const html = result.html || result.rawHtml;
          if (!html) continue;

          const svg = extractSvgFromHtml(html);
          
          if (svg) {
            console.log(`Found SVG for ${venue.name} (${svg.length} chars)`);
            
            // Update venue with SVG
            const { error: updateError } = await supabase
              .from('venues')
              .update({ svg_map: svg })
              .eq('id', venue.id);

            if (updateError) {
              console.error(`Error updating venue ${venue.name}:`, updateError);
              results.push({ venue: venue.name, success: false, error: updateError.message });
            } else {
              svgFound = true;
              
              // Create sections from SVG if requested
              if (createSections) {
                const sectionIds = extractSectionIds(svg);
                console.log(`Found ${sectionIds.length} sections in SVG for ${venue.name}`);
                
                if (sectionIds.length > 0) {
                  // Check existing sections
                  const { data: existingSections } = await supabase
                    .from('sections')
                    .select('svg_path')
                    .eq('venue_id', venue.id);
                  
                  const existingPaths = new Set((existingSections || []).map(s => s.svg_path));
                  
                  const newSections = sectionIds
                    .filter(id => !existingPaths.has(`${id}-group`) && !existingPaths.has(id))
                    .map((id, index) => ({
                      venue_id: venue.id,
                      name: `Section ${id}`,
                      svg_path: `${id}-group`,
                      section_type: getSectionType(id),
                      capacity: 100,
                      sort_order: index,
                    }));
                  
                  if (newSections.length > 0) {
                    const { error: sectionError } = await supabase
                      .from('sections')
                      .insert(newSections);
                    
                    if (sectionError) {
                      console.error(`Error creating sections for ${venue.name}:`, sectionError);
                    } else {
                      console.log(`Created ${newSections.length} sections for ${venue.name}`);
                    }
                  }
                }
              }
              
              results.push({ 
                venue: venue.name, 
                success: true, 
                svgLength: svg.length,
                sectionsCreated: createSections ? extractSectionIds(svg).length : 0,
              });
            }
          }
        }

        if (!svgFound) {
          console.log(`No SVG found for ${venue.name}`);
          results.push({ venue: venue.name, success: false, error: 'No SVG map found' });
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (venueErr) {
        console.error(`Error processing venue ${venue.name}:`, venueErr);
        results.push({ venue: venue.name, success: false, error: String(venueErr) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Completed: ${successCount}/${results.length} venues updated`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        updated: successCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-venue-maps:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
