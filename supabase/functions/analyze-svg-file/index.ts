import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileName, content, instructions, venueNames } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing file: ${fileName} (${content.length} chars)`);
    console.log(`Instructions provided: ${instructions ? 'Yes' : 'No'}`);
    console.log(`Venue names to match: ${venueNames?.length || 0}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.log("LOVABLE_API_KEY not configured, using fallback extraction");
      return new Response(
        JSON.stringify(fallbackExtraction(content, fileName, venueNames)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the AI prompt
    const systemPrompt = `You are an expert at parsing venue seating chart files. Your job is to:
1. Extract the complete SVG content from a text file that may contain metadata headers
2. Identify the venue name from the file content or metadata
3. Match the venue name to one of the provided database venue names

The files may have various formats:
- Pure SVG files starting with <svg>
- Text files with metadata headers like "Venue:", "Title:", "URL:" followed by SVG content
- Files with comments or documentation before/after the SVG

IMPORTANT RULES:
1. Extract ONLY the SVG content (from <svg to </svg>), nothing else
2. The SVG must be complete and valid
3. Look for venue name in metadata headers first, then in the SVG content itself
4. Match to the closest venue name from the provided list

${instructions ? `\nADDITIONAL INSTRUCTIONS FROM USER:\n${instructions}\n` : ''}`;

    const userPrompt = `Analyze this file and extract the SVG content and venue information.

FILE NAME: ${fileName}

FILE CONTENT (first 50000 chars):
${content.substring(0, 50000)}

AVAILABLE VENUE NAMES TO MATCH:
${venueNames?.slice(0, 100).join('\n') || 'No venues provided'}

Respond with a JSON object containing:
{
  "svgContent": "the complete SVG from <svg> to </svg> or null if not found",
  "extractedVenueName": "the venue name found in the file metadata or null",
  "matchedVenueName": "the best matching venue name from the provided list or null",
  "error": "any error message or null"
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or explanations.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Fallback to regex extraction
      console.log("Using fallback extraction due to AI error");
      return new Response(
        JSON.stringify(fallbackExtraction(content, fileName, venueNames)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.log("No AI response, using fallback");
      return new Response(
        JSON.stringify(fallbackExtraction(content, fileName, venueNames)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received:", aiResponse.substring(0, 500));

    // Parse AI response
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validate SVG content
      if (parsed.svgContent) {
        if (!parsed.svgContent.includes('<svg') || !parsed.svgContent.includes('</svg>')) {
          parsed.svgContent = null;
          parsed.error = "Invalid SVG content from AI";
        }
      }
      
      console.log(`AI extraction result - SVG: ${parsed.svgContent ? `${parsed.svgContent.length} chars` : 'null'}, Venue: ${parsed.extractedVenueName}, Match: ${parsed.matchedVenueName}`);
      
      return new Response(
        JSON.stringify(parsed),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify(fallbackExtraction(content, fileName, venueNames)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in analyze-svg-file:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback regex-based extraction
function fallbackExtraction(content: string, fileName: string, venueNames: string[]): {
  svgContent: string | null;
  extractedVenueName: string | null;
  matchedVenueName: string | null;
  error: string | null;
} {
  console.log("Using fallback regex extraction");
  
  // Extract venue name from metadata
  let extractedVenueName: string | null = null;
  
  const venueMatch = content.match(/Venue:\s*(.+?)(?:\n|$)/i);
  if (venueMatch) {
    extractedVenueName = venueMatch[1].trim();
  }
  
  if (!extractedVenueName) {
    const titleMatch = content.match(/Title:\s*(.+?)(?:\s*-\s*|\n|$)/i);
    if (titleMatch) {
      extractedVenueName = titleMatch[1].trim();
    }
  }
  
  // Find SVG content
  const svgOpenMatch = content.match(/<svg[^>]*>/i);
  if (!svgOpenMatch) {
    return {
      svgContent: null,
      extractedVenueName,
      matchedVenueName: null,
      error: "No <svg> tag found in file"
    };
  }
  
  const svgStartIndex = content.indexOf(svgOpenMatch[0]);
  const svgEndIndex = content.lastIndexOf('</svg>');
  
  if (svgEndIndex === -1) {
    return {
      svgContent: null,
      extractedVenueName,
      matchedVenueName: null,
      error: "No closing </svg> tag found"
    };
  }
  
  const svgContent = content.substring(svgStartIndex, svgEndIndex + 6);
  
  // Try to match venue name
  let matchedVenueName: string | null = null;
  if (extractedVenueName && venueNames?.length > 0) {
    const normalizedExtracted = extractedVenueName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    for (const venueName of venueNames) {
      const normalizedVenue = venueName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (normalizedVenue === normalizedExtracted || 
          normalizedVenue.includes(normalizedExtracted) || 
          normalizedExtracted.includes(normalizedVenue)) {
        matchedVenueName = venueName;
        break;
      }
    }
  }
  
  console.log(`Fallback result - SVG: ${svgContent.length} chars, Venue: ${extractedVenueName}, Match: ${matchedVenueName}`);
  
  return {
    svgContent,
    extractedVenueName,
    matchedVenueName,
    error: null
  };
}
