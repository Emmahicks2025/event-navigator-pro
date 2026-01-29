import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Skew towards lower prices but still allow high outliers
const skewedRandom = () => Math.pow(Math.random(), 1.8);

function getSectionPriceMultiplier(sectionTypeRaw: string | null | undefined): number {
  const sectionType = (sectionTypeRaw || 'standard').toLowerCase();
  if (sectionType === 'floor' || sectionType === 'pit') return 1.4;
  if (sectionType === 'premium' || sectionType === 'vip' || sectionType === 'club') return 1.6;
  if (sectionType === 'upper') return 0.7;
  if (sectionType === 'lower') return 1.1;
  return 1;
}

function stableSectionJitter(sectionId: string): number {
  // deterministic-ish jitter per section in [0.9, 1.1]
  let hash = 0;
  for (let i = 0; i < sectionId.length; i++) hash = (hash * 31 + sectionId.charCodeAt(i)) >>> 0;
  const t = (hash % 1000) / 1000; // 0..0.999
  return 0.9 + t * 0.2;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { 
      discount_percent = 50,  // 50% off
      tickets_per_section = 20, // target tickets per section (used as a guide)
      clear_existing = false,
      event_id = null,  // Optional: process single event
      batch_size = 25,
      batch_offset = 0
    } = body;

    const discountMultiplier = (100 - discount_percent) / 100;

    // Get events with their sections (batchable to avoid timeouts)
    let eventsQuery = supabase
      .from('events')
      .select(`
        id, title, price_from, price_to,
        event_sections (
          id, section_id, price,
          sections (id, name, section_type, svg_path)
        )
      `)
      .not('venue_id', 'is', null);

    if (event_id) {
      eventsQuery = eventsQuery.eq('id', event_id);
    } else {
      // range() is inclusive, so subtract 1
      const size = clamp(Number(batch_size) || 25, 1, 100);
      const start = Math.max(0, Number(batch_offset) || 0);
      eventsQuery = eventsQuery.range(start, start + size - 1);
    }

    const { data: events, error: eventsError } = await eventsQuery;
    if (eventsError) throw eventsError;

    console.log(
      event_id
        ? `Processing 1 event (${event_id})`
        : `Processing batch: offset=${batch_offset}, size=${batch_size}, events=${events?.length || 0}`
    );

    let totalCreated = 0;
    let totalCleared = 0;
    const results: Array<{event: string; created: number; cleared?: number}> = [];

    for (const event of events || []) {
      const eventSections = event.event_sections || [];
      if (eventSections.length === 0) continue;

      // Calculate prices based on event's price range with discount.
      // Guardrails: many imported events can have unrealistic ranges (near zero).
      const sourceMin = Math.max(Number(event.price_from ?? 50), 40);
      const sourceMax = Math.max(Number(event.price_to ?? 150), sourceMin * 2);
      const basePriceMin = sourceMin * discountMultiplier;
      const basePriceMax = sourceMax * discountMultiplier;

      // Clear existing inventory if requested
      let clearedCount = 0;
      if (clear_existing) {
        const sectionIds = eventSections.map((es: { id: string }) => es.id);
        const { data: deleted } = await supabase
          .from('ticket_inventory')
          .delete()
          .in('event_section_id', sectionIds)
          .select('id');
        clearedCount = deleted?.length || 0;
        totalCleared += clearedCount;
      }

      // Create inventory for each section
      const inventoryItems: Array<{
        event_section_id: string;
        price: number;
        quantity: number;
        row_name: string;
        status: string;
      }> = [];

      for (const es of eventSections) {
        // deno-lint-ignore no-explicit-any
        const section = es.sections as any;
        if (!section) continue;

        const priceMultiplier = getSectionPriceMultiplier(section.section_type);
        const sectionJitter = stableSectionJitter(String(section.id || es.section_id || es.id));

        // Make listings feel "natural": variable # listings, variable quantities, varied rows
        // We keep a *target* per section but distribute it randomly.
        const targetTickets = clamp(
          randInt(Math.floor(tickets_per_section * 0.6), Math.ceil(tickets_per_section * 1.4)),
          6,
          80
        );

        const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const rowCountGuess = clamp(randInt(8, 22), 6, 26);
        const possibleRows = rowLetters.slice(0, rowCountGuess);

        const listingCount = clamp(randInt(6, 18), 4, 24);
        let remaining = targetTickets;

        for (let i = 0; i < listingCount && remaining > 0; i++) {
          const row = pick(possibleRows);
          // random group size 1-6, biased to smaller groups
          const qty = clamp(randInt(1, 6), 1, remaining);
          remaining -= qty;

          // Random price within the range, skewed towards low end, adjusted by section type
          const priceRange = Math.max(1, basePriceMax - basePriceMin);
          const factor = skewedRandom();
          let price = (basePriceMin + priceRange * factor) * priceMultiplier * sectionJitter;

          // Add slight row-based variability (front rows more expensive)
          const rowIndex = possibleRows.indexOf(row);
          const rowPremium = 1 + (Math.max(0, (rowCountGuess - 1 - rowIndex)) / Math.max(1, rowCountGuess - 1)) * 0.12;
          price *= rowPremium;

          const minFloor = Math.max(12, basePriceMin * 0.75);
          price = clamp(price, minFloor, 1200);
          // cents realism + avoid too many identical prices
          price = Math.round((price + Math.random() * 1.99) * 100) / 100;

          inventoryItems.push({
            event_section_id: es.id,
            price,
            quantity: qty,
            row_name: row,
            status: 'available',
          });
        }
      }

      if (inventoryItems.length > 0) {
        const { error: insertError } = await supabase
          .from('ticket_inventory')
          .insert(inventoryItems);

        if (insertError) {
          console.error(`Error inserting inventory for ${event.title}:`, insertError);
          results.push({ event: event.title, created: 0, cleared: clearedCount });
        } else {
          totalCreated += inventoryItems.length;
          results.push({ event: event.title, created: inventoryItems.length, cleared: clearedCount });
        }
      }

      // Update event price range with discounted prices
      const { error: updateError } = await supabase
        .from('events')
        .update({
          price_from: Math.round(basePriceMin * 100) / 100,
          price_to: Math.round(basePriceMax * 100) / 100,
        })
        .eq('id', event.id);

      if (updateError) {
        console.error(`Error updating prices for ${event.title}:`, updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_events_processed: events?.length || 0,
      total_inventory_created: totalCreated,
      total_inventory_cleared: totalCleared,
      discount_applied: `${discount_percent}%`,
      sample_results: results.slice(0, 20),
    }), {
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
