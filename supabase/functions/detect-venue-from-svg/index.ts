import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filename, svgContent, existingVenues } = await req.json();
    
    if (!filename) {
      return new Response(
        JSON.stringify({ error: "Filename is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Fall back to filename extraction if AI is not available
      const venueName = extractVenueNameFromFilename(filename);
      return new Response(
        JSON.stringify({ venueName, method: 'filename' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert at identifying venue names from SVG map files and filenames.
Your task is to:
1. Extract the likely venue name from the filename and SVG content
2. Match it to an existing venue if possible
3. Return the best venue name

Rules:
- Remove common suffixes like "map", "seating", "chart", "layout"
- Remove file extensions
- Convert underscores and dashes to spaces
- Capitalize properly (e.g., "Madison Square Garden" not "madison square garden")
- If the SVG contains text elements with venue names, prefer those
- If matching to existing venues, use the exact existing venue name

Return ONLY a JSON object with: { "venueName": "The Venue Name", "confidence": 0.0-1.0, "matchedExisting": true/false }`;

    const userPrompt = `Filename: ${filename}

Existing venues to match against:
${existingVenues?.slice(0, 50).join('\n') || 'None provided'}

SVG content (first 2000 chars):
${svgContent?.substring(0, 2000) || 'Not provided'}

Extract the venue name and try to match to an existing venue. Return only valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        // Rate limited or payment required - fall back to filename
        const venueName = extractVenueNameFromFilename(filename);
        return new Response(
          JSON.stringify({ venueName, method: 'filename_fallback' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      const result = JSON.parse(cleanContent);
      
      return new Response(
        JSON.stringify({ 
          venueName: result.venueName || extractVenueNameFromFilename(filename),
          confidence: result.confidence || 0.5,
          matchedExisting: result.matchedExisting || false,
          method: 'ai'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      // Fall back to filename extraction
      const venueName = extractVenueNameFromFilename(filename);
      return new Response(
        JSON.stringify({ venueName, method: 'filename_parse_fallback' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error detecting venue:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to detect venue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractVenueNameFromFilename(filename: string): string {
  // Remove .svg extension
  let name = filename.replace(/\.svg$/i, '');
  
  // Replace underscores and dashes with spaces
  name = name.replace(/[_-]/g, ' ');
  
  // Remove common suffixes
  name = name.replace(/\s*(map|seating|chart|layout|venue|arena|stadium|center|centre|theatre|theater)\s*$/i, '');
  
  // Capitalize first letter of each word
  name = name.split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name.trim();
}
