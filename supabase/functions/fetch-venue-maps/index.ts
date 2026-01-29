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

// Format venue name for URL slug
function formatVenueSlug(name: string, city: string, state: string | null): string {
  const slug = `${name}-${city}${state ? `-${state}` : ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug;
}

// Extract SVG from HTML content - looks for interactive venue maps
function extractSvgFromHtml(html: string): string | null {
  if (!html) return null;
  
  // Multiple patterns to find SVG venue maps
  const patterns = [
    // SVG with viewBox containing section patterns
    /<svg[^>]*viewBox[^>]*>[\s\S]*?(?:section|group|row|seat)[\s\S]*?<\/svg>/gi,
    // SVG with map-related class
    /<svg[^>]*class="[^"]*(?:map|venue|seating)[^"]*"[^>]*>[\s\S]*?<\/svg>/gi,
    // Large SVG (likely venue map)
    /<svg[^>]*>[\s\S]{10000,}<\/svg>/gi,
    // Any SVG with id patterns for sections
    /<svg[^>]*>[\s\S]*?id="\d{1,3}"[\s\S]*?<\/svg>/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      // Return the largest SVG found (most likely to be the venue map)
      const largest = matches.reduce((a, b) => a.length > b.length ? a : b);
      
      // Validate it has section-like content
      if (
        largest.includes('-section') || 
        largest.includes('-group') || 
        /id="\d{1,3}"/.test(largest) ||
        largest.length > 5000
      ) {
        return sanitizeSvg(largest);
      }
    }
  }
  
  return null;
}

// Clean SVG content
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/<a[^>]*href="[^"]*"[^>]*>/gi, '<g>')
    .replace(/<\/a>/gi, '</g>');
}

// Parse SVG to extract section IDs
function extractSectionIds(svgContent: string): string[] {
  const ids: string[] = [];
  
  // Match patterns like id="101-group", id="101-section", id="A1"
  const idPattern = /id="([A-Za-z0-9]+)(?:-(?:group|section))?"/gi;
  let match;
  while ((match = idPattern.exec(svgContent)) !== null) {
    const id = match[1];
    if (!ids.includes(id) && /^[A-Z0-9]{1,4}$/i.test(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}

// Determine section type from ID
function getSectionType(sectionId: string): string {
  const num = parseInt(sectionId, 10);
  if (!isNaN(num)) {
    if (num < 100) return 'floor';
    if (num < 200) return 'lower';
    if (num < 300) return 'club';
    return 'upper';
  }
  
  const lower = sectionId.toLowerCase();
  if (lower.includes('floor') || lower.includes('pit') || lower.includes('ga')) return 'floor';
  if (lower.includes('vip') || lower.includes('suite') || lower.includes('box')) return 'vip';
  if (lower.includes('club') || lower.includes('premium')) return 'club';
  if (lower.includes('upper') || lower.includes('balcony')) return 'upper';
  if (lower.includes('lower')) return 'lower';
  
  return 'standard';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { venueIds, limit = 5, createSections = true, directUrls } = await req.json();

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
    const results: any[] = [];

    // Option 1: Use direct URLs provided
    if (directUrls && Array.isArray(directUrls)) {
      for (const { venueId, url } of directUrls) {
        try {
          console.log(`Scraping direct URL for venue ${venueId}: ${url}`);
          
          const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              formats: ['html'],
              waitFor: 3000,
            }),
          });

          if (!scrapeResponse.ok) {
            console.log(`Scrape failed for ${url}: ${scrapeResponse.status}`);
            results.push({ venueId, url, success: false, error: 'Scrape failed' });
            continue;
          }

          const scrapeData = await scrapeResponse.json();
          const html = scrapeData.data?.html || scrapeData.html;
          
          if (!html) {
            results.push({ venueId, url, success: false, error: 'No HTML returned' });
            continue;
          }

          const svg = extractSvgFromHtml(html);
          
          if (svg) {
            console.log(`Found SVG for venue ${venueId} (${svg.length} chars)`);
            
            const { error: updateError } = await supabase
              .from('venues')
              .update({ svg_map: svg })
              .eq('id', venueId);

            if (updateError) {
              results.push({ venueId, url, success: false, error: updateError.message });
            } else {
              results.push({ venueId, url, success: true, svgLength: svg.length });
              
              // Create sections if requested
              if (createSections) {
                const sectionIds = extractSectionIds(svg);
                if (sectionIds.length > 0) {
                  const { data: existingSections } = await supabase
                    .from('sections')
                    .select('svg_path')
                    .eq('venue_id', venueId);
                  
                  const existingPaths = new Set((existingSections || []).map(s => s.svg_path));
                  
                  const newSections = sectionIds
                    .filter(id => !existingPaths.has(`${id}-group`) && !existingPaths.has(id))
                    .map((id, index) => ({
                      venue_id: venueId,
                      name: `Section ${id}`,
                      svg_path: `${id}-group`,
                      section_type: getSectionType(id),
                      capacity: 100,
                      sort_order: index,
                    }));
                  
                  if (newSections.length > 0) {
                    await supabase.from('sections').insert(newSections);
                    console.log(`Created ${newSections.length} sections`);
                  }
                }
              }
            }
          } else {
            results.push({ venueId, url, success: false, error: 'No SVG found in page' });
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (err) {
          results.push({ venueId, url, success: false, error: String(err) });
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Option 2: Search and scrape venues by name
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
      return new Response(
        JSON.stringify({ success: false, error: venueError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${venues?.length || 0} venues`);

    for (const venue of venues || []) {
      try {
        console.log(`Searching for: ${venue.name}, ${venue.city}`);
        
        // Build gotickets.com URL directly
        const venueSlug = formatVenueSlug(venue.name, venue.city, venue.state);
        const searchQuery = `site:gotickets.com ${venue.name} ${venue.city} tickets`;
        
        // Search for venue pages
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 3,
          }),
        });

        if (!searchResponse.ok) {
          results.push({ venue: venue.name, success: false, error: 'Search failed' });
          continue;
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.data || [];
        
        let svgFound = false;
        
        for (const result of searchResults) {
          if (svgFound) break;
          
          const pageUrl = result.url;
          if (!pageUrl || !pageUrl.includes('gotickets.com')) continue;
          
          console.log(`Scraping: ${pageUrl}`);
          
          // Scrape the page for HTML
          const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: pageUrl,
              formats: ['html'],
              waitFor: 2000,
            }),
          });
          
          if (!scrapeResponse.ok) continue;
          
          const scrapeData = await scrapeResponse.json();
          const html = scrapeData.data?.html || scrapeData.html;
          
          if (!html) continue;
          
          const svg = extractSvgFromHtml(html);
          
          if (svg) {
            console.log(`Found SVG for ${venue.name} (${svg.length} chars)`);
            
            const { error: updateError } = await supabase
              .from('venues')
              .update({ svg_map: svg })
              .eq('id', venue.id);

            if (!updateError) {
              svgFound = true;
              results.push({ venue: venue.name, success: true, svgLength: svg.length });
              
              if (createSections) {
                const sectionIds = extractSectionIds(svg);
                if (sectionIds.length > 0) {
                  const { data: existingSections } = await supabase
                    .from('sections')
                    .select('svg_path')
                    .eq('venue_id', venue.id);
                  
                  const existingPaths = new Set((existingSections || []).map(s => s.svg_path));
                  
                  const newSections = sectionIds
                    .filter(id => !existingPaths.has(`${id}-group`))
                    .map((id, index) => ({
                      venue_id: venue.id,
                      name: `Section ${id}`,
                      svg_path: `${id}-group`,
                      section_type: getSectionType(id),
                      capacity: 100,
                      sort_order: index,
                    }));
                  
                  if (newSections.length > 0) {
                    await supabase.from('sections').insert(newSections);
                  }
                }
              }
            }
          }
        }

        if (!svgFound) {
          results.push({ venue: venue.name, success: false, error: 'No SVG map found' });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (venueErr) {
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
