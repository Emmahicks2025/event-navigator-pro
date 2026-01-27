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
    const { svgContent } = await req.json();
    
    if (!svgContent) {
      return new Response(
        JSON.stringify({ error: "SVG content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert at parsing SVG venue/arena maps. Your task is to extract all section elements from the SVG that represent seating sections.

Look for elements with IDs that represent venue sections such as:
- Floor sections (e.g., "floor_a", "floor-1", "FLOOR_A")
- Bowl sections (e.g., "section_101", "sec-101", "BOWL_A")
- GA/Pit areas (e.g., "ga_pit", "general_admission", "PIT")
- VIP sections (e.g., "vip_1", "VIP-SECTION")
- Suite sections (e.g., "suite_1", "SUITE-A")

For each section, determine:
1. The element ID (svg_path) - exactly as it appears in the SVG
2. A human-friendly name derived from the ID
3. The section_type: one of "floor", "lower", "upper", "pit", "vip", "suite", "standard"
4. Estimated capacity based on context (default to 100)
5. Whether it's general admission (no assigned seats)

Return ONLY valid JSON array. No markdown, no explanation.`;

    const userPrompt = `Parse this SVG and extract all seating sections. Return a JSON array of objects with these fields:
- svg_path: the exact element ID from the SVG
- name: human-friendly section name
- section_type: "floor" | "lower" | "upper" | "pit" | "vip" | "suite" | "standard"
- capacity: estimated number (default 100)
- is_general_admission: boolean (true for GA/pit areas)

SVG Content:
${svgContent}

Return ONLY the JSON array, nothing else.`;

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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let sections = [];
    try {
      // Clean up the response - remove markdown code blocks if present
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
      
      sections = JSON.parse(cleanContent);
      
      if (!Array.isArray(sections)) {
        sections = [sections];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fall back to regex extraction of IDs from SVG
      const idMatches = svgContent.matchAll(/id="([^"]+)"/g);
      const ids = [...idMatches].map(m => m[1]).filter(id => 
        !id.includes('style') && 
        !id.includes('defs') && 
        !id.includes('svg') &&
        id.length < 50
      );
      
      sections = ids.slice(0, 50).map((id, index) => ({
        svg_path: id,
        name: id.replace(/[_-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        section_type: 'standard',
        capacity: 100,
        is_general_admission: false,
        sort_order: index,
      }));
    }

    // Add sort_order if not present
    sections = sections.map((s: any, i: number) => ({
      ...s,
      sort_order: s.sort_order ?? i,
      capacity: s.capacity || 100,
      row_count: s.row_count || 10,
      seats_per_row: s.seats_per_row || 10,
    }));

    return new Response(
      JSON.stringify({ sections }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing SVG:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse SVG" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
