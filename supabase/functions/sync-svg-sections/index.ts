import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract section IDs from SVG content - only pick meaningful sections
function extractSectionIds(svgContent: string): string[] {
  const sectionIds: string[] = [];
  
  // Match all id attributes in the SVG
  const idMatches = svgContent.matchAll(/\bid=["']([^"']+)["']/gi);
  
  for (const match of idMatches) {
    const id = match[1];
    
    // Skip common non-section IDs
    const skipPatterns = [
      /^svg$/i, /^defs$/i, /^clip/i, /^mask/i, /^gradient/i, /^pattern/i,
      /^filter/i, /^g\d*$/i, /^layer/i, /^path\d*$/i, /^rect\d*$/i,
      /^text\d*$/i, /^tspan/i, /^use\d*$/i, /^symbol/i, /^image/i,
      /^style/i, /^metadata/i, /^namedview/i, /^sodipodi/i, /^parent/i,
      /^sections$/i, /^background/i, /^stage/i, /^court/i, /^field/i,
      /^ice/i, /^arena/i, /^border/i, /^outline/i,
    ];
    
    if (skipPatterns.some(pattern => pattern.test(id))) continue;
    
    // Only include -group IDs (they contain the sections)
    // This avoids duplicates like "101", "101-group", "101-section"
    if (id.endsWith('-group')) {
      const sectionKey = id.replace(/-group$/i, '');
      // Include numeric sections (101, 102), alphanumeric (A1, L4, F25), and named sections
      if (/^\d{1,3}$/.test(sectionKey) ||
          /^[A-Z]\d{0,2}$/i.test(sectionKey) ||
          /^(floor|pit|ga|vip|club|premium|box|suite|terrace|orchestra|mezzanine|balcony|loge)/i.test(sectionKey)) {
        sectionIds.push(id);
      }
    }
  }
  
  return [...new Set(sectionIds)];
}

// Categorize section by its ID pattern
function categorizeSectionType(sectionId: string): string {
  const id = sectionId.toLowerCase().replace(/-group$/i, '');
  
  if (/^(floor|pit|ga|f\d+)$/i.test(id)) return 'floor';
  if (/^(vip|premium|club|suite|box|l\d+)$/i.test(id)) return 'premium';
  if (/^(balcony|upper|2\d{2})$/i.test(id)) return 'upper';
  if (/^(orchestra|mezzanine|loge|lower|1\d{2})$/i.test(id)) return 'lower';
  if (/^[a-z]\d*$/i.test(id)) return 'standard';
  
  return 'standard';
}

// Generate human-readable section name
function generateSectionName(svgId: string): string {
  const core = svgId.replace(/-group$/i, '');
  
  // Keep numeric sections as-is
  if (/^\d{1,3}$/.test(core)) return `Section ${core}`;
  
  // Format alphanumeric (F25 -> Floor 25, L4 -> Loge 4, A1 -> Section A1)
  const prefixMatch = core.match(/^([a-z])(\d+)$/i);
  if (prefixMatch) {
    const prefix = prefixMatch[1].toUpperCase();
    const num = prefixMatch[2];
    const prefixMap: Record<string, string> = {
      'F': 'Floor', 'L': 'Loge', 'A': 'Section A', 'B': 'Section B',
      'C': 'Section C', 'D': 'Section D',
    };
    return prefixMap[prefix] ? `${prefixMap[prefix]} ${num}` : `Section ${prefix}${num}`;
  }
  
  // Title case for named sections
  return core.charAt(0).toUpperCase() + core.slice(1).replace(/([A-Z])/g, ' $1').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { venue_id, replace_sections = false } = await req.json();

    let query = supabase.from('venues').select('id, name, svg_map');
    if (venue_id) {
      query = query.eq('id', venue_id);
    } else {
      query = query.not('svg_map', 'is', null);
    }
    
    const { data: venues, error: venuesError } = await query;
    if (venuesError) throw venuesError;

    const results: unknown[] = [];

    for (const venue of venues || []) {
      if (!venue.svg_map) continue;

      try {
        // Fetch SVG content
        const svgResponse = await fetch(venue.svg_map);
        if (!svgResponse.ok) {
          results.push({ venue: venue.name, status: 'error', message: 'Failed to fetch SVG' });
          continue;
        }
        
        const svgContent = await svgResponse.text();
        const svgSectionIds = extractSectionIds(svgContent);
        
        console.log(`Venue: ${venue.name}, Found ${svgSectionIds.length} section IDs`);

        // Get existing sections for this venue
        const { data: existingSections, error: sectionsError } = await supabase
          .from('sections')
          .select('id, name, svg_path')
          .eq('venue_id', venue.id);

        if (sectionsError) throw sectionsError;

        const updates: Array<{ id: string; svg_path: string }> = [];
        const newSections: Array<{
          venue_id: string;
          name: string;
          svg_path: string;
          section_type: string;
          capacity: number;
        }> = [];

        // Check if we need to add detailed sections
        const hasDetailedSections = svgSectionIds.length > 0;
        const hasOnlyGenericSections = existingSections?.every(s => 
          ['club', 'floor', 'lower bowl', 'upper bowl', 'orchestra', 'mezzanine', 'balcony']
            .includes(s.name.toLowerCase())
        );

        if (hasDetailedSections && (replace_sections || hasOnlyGenericSections)) {
          // Create new sections from SVG
          for (const svgId of svgSectionIds) {
            const sectionName = generateSectionName(svgId);
            const sectionType = categorizeSectionType(svgId);
            
            // Check if a section with this svg_path already exists
            const existing = existingSections?.find(s => 
              s.svg_path?.toLowerCase() === svgId.toLowerCase()
            );
            
            if (!existing) {
              newSections.push({
                venue_id: venue.id,
                name: sectionName,
                svg_path: svgId,
                section_type: sectionType,
                capacity: 100,
              });
            }
          }
        } else {
          // Try to match existing sections to SVG elements by name
          for (const section of existingSections || []) {
            if (section.svg_path) continue; // Already linked
            
            // Try to find a matching SVG ID
            const normalizedName = section.name.toLowerCase().replace(/\s+/g, '');
            const matchingSvgId = svgSectionIds.find(svgId => {
              const normalizedSvgId = svgId.toLowerCase().replace(/-group$/i, '');
              return normalizedSvgId === normalizedName || 
                     normalizedSvgId.includes(normalizedName) ||
                     normalizedName.includes(normalizedSvgId);
            });
            
            if (matchingSvgId) {
              updates.push({ id: section.id, svg_path: matchingSvgId });
            }
          }
        }

        // Apply updates
        if (updates.length > 0) {
          for (const update of updates) {
            await supabase
              .from('sections')
              .update({ svg_path: update.svg_path })
              .eq('id', update.id);
          }
        }

        // Insert new sections
        if (newSections.length > 0) {
          const { error: insertError } = await supabase.from('sections').insert(newSections);
          if (insertError) {
            console.error('Insert error:', insertError);
          }
        }

        results.push({
          venue: venue.name,
          venue_id: venue.id,
          status: 'success',
          svg_sections_found: svgSectionIds.length,
          existing_sections: existingSections?.length || 0,
          updated: updates.length,
          created: newSections.length,
          had_only_generic: hasOnlyGenericSections,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        results.push({
          venue: venue.name,
          status: 'error',
          message: errorMessage,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
