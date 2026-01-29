import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceVenueName, targetVenues } = await req.json();
    
    if (!sourceVenueName || !targetVenues || !Array.isArray(targetVenues)) {
      return new Response(
        JSON.stringify({ error: "sourceVenueName and targetVenues array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get source venue with SVG map URL
    const { data: sourceVenue, error: sourceError } = await supabase
      .from('venues')
      .select('id, name, svg_map')
      .ilike('name', `%${sourceVenueName}%`)
      .single();

    if (sourceError || !sourceVenue?.svg_map) {
      return new Response(
        JSON.stringify({ error: `Source venue not found or has no map: ${sourceVenueName}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Source venue: ${sourceVenue.name}, SVG URL: ${sourceVenue.svg_map}`);

    // Fetch the source SVG content
    const svgResponse = await fetch(sourceVenue.svg_map);
    if (!svgResponse.ok) {
      throw new Error(`Failed to fetch source SVG: ${svgResponse.statusText}`);
    }
    const sourceSvgContent = await svgResponse.text();
    console.log(`Fetched source SVG: ${sourceSvgContent.length} chars`);

    const results: { venueName: string; status: string; url?: string }[] = [];

    for (const targetVenueName of targetVenues) {
      try {
        // Find target venue
        const { data: targetVenue, error: targetError } = await supabase
          .from('venues')
          .select('id, name, svg_map')
          .ilike('name', `%${targetVenueName}%`)
          .single();

        if (targetError || !targetVenue) {
          results.push({ venueName: targetVenueName, status: 'not_found' });
          continue;
        }

        if (targetVenue.svg_map) {
          results.push({ venueName: targetVenue.name, status: 'already_has_map', url: targetVenue.svg_map });
          continue;
        }

        // Create a modified copy of the SVG for this venue
        // We'll keep the structure but update any venue-specific labels if found
        let modifiedSvg = sourceSvgContent;
        
        // Replace any text that mentions the source venue name with the target
        const sourceNamePattern = new RegExp(sourceVenue.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        modifiedSvg = modifiedSvg.replace(sourceNamePattern, targetVenue.name);

        // Generate a slug for the file name
        const slug = targetVenue.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const fileName = `${slug}.svg`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('venue-maps')
          .upload(fileName, modifiedSvg, {
            contentType: 'image/svg+xml',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${targetVenue.name}:`, uploadError);
          results.push({ venueName: targetVenue.name, status: 'upload_failed' });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('venue-maps')
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // Update venue record with the new SVG map URL
        const { error: updateError } = await supabase
          .from('venues')
          .update({ svg_map: publicUrl })
          .eq('id', targetVenue.id);

        if (updateError) {
          console.error(`Update error for ${targetVenue.name}:`, updateError);
          results.push({ venueName: targetVenue.name, status: 'db_update_failed', url: publicUrl });
          continue;
        }

        results.push({ venueName: targetVenue.name, status: 'success', url: publicUrl });
        console.log(`Successfully cloned map for ${targetVenue.name}: ${publicUrl}`);

      } catch (err) {
        console.error(`Error processing ${targetVenueName}:`, err);
        results.push({ venueName: targetVenueName, status: 'error' });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sourceVenue: sourceVenue.name,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error cloning venue maps:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to clone venue maps" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
