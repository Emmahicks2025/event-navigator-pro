import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      tickets_per_section = 20,
      clear_existing = false,
      event_id = null  // Optional: process single event
    } = body;

    const discountMultiplier = (100 - discount_percent) / 100;

    // Get events with their sections
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
    }

    const { data: events, error: eventsError } = await eventsQuery;
    if (eventsError) throw eventsError;

    console.log(`Processing ${events?.length || 0} events`);

    let totalCreated = 0;
    let totalCleared = 0;
    const results: Array<{event: string; created: number; cleared?: number}> = [];

    for (const event of events || []) {
      const eventSections = event.event_sections || [];
      if (eventSections.length === 0) continue;

      // Calculate prices based on event's price range with discount
      const basePriceMin = (event.price_from || 50) * discountMultiplier;
      const basePriceMax = (event.price_to || 150) * discountMultiplier;

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

        // Adjust price based on section type
        let priceMultiplier = 1;
        const sectionType = (section.section_type || 'standard').toLowerCase();
        
        if (sectionType === 'floor' || sectionType === 'pit') {
          priceMultiplier = 1.4;
        } else if (sectionType === 'premium' || sectionType === 'vip' || sectionType === 'club') {
          priceMultiplier = 1.6;
        } else if (sectionType === 'upper') {
          priceMultiplier = 0.7;
        } else if (sectionType === 'lower') {
          priceMultiplier = 1.1;
        }

        // Create multiple listings per section with varied pricing
        const numListings = Math.ceil(tickets_per_section / 4);
        
        for (let i = 0; i < numListings; i++) {
          const row = String.fromCharCode(65 + (i % 20)); // A-T
          const qty = Math.min(4, tickets_per_section - (i * 4));
          if (qty <= 0) break;

          // Random price within the range, adjusted by section type
          const priceRange = basePriceMax - basePriceMin;
          const randomFactor = Math.random();
          let price = (basePriceMin + (priceRange * randomFactor)) * priceMultiplier;
          
          // Ensure price is reasonable
          price = Math.max(10, Math.min(500, price));
          price = Math.round(price * 100) / 100;

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
