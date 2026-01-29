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
    const { event_id, generate_inventory = true, tickets_per_section = 10 } = body;

    // If no event_id, process ALL events
    if (!event_id) {
      // Get all events with venues that have svg_maps
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, venue_id, venues!inner(id, svg_map)')
        .not('venue_id', 'is', null);

      if (eventsError) throw eventsError;

      const results: Array<{event: string; status: string; created?: number}> = [];
      let totalCreated = 0;

      for (const event of events || []) {
        try {
          // Get sections for this venue that have svg_path
          const { data: sections } = await supabase
            .from('sections')
            .select('id, name, svg_path, section_type, capacity')
            .eq('venue_id', event.venue_id)
            .not('svg_path', 'is', null);

          if (!sections || sections.length === 0) {
            results.push({ event: event.title, status: 'no_sections' });
            continue;
          }

          // Check existing event_sections
          const { data: existingEventSections } = await supabase
            .from('event_sections')
            .select('section_id, price')
            .eq('event_id', event.id);

          const existingSectionIds = new Set((existingEventSections || []).map(es => es.section_id));
          
          // Calculate base price
          const existingPrices = (existingEventSections || []).map(es => Number(es.price));
          const avgPrice = existingPrices.length > 0 
            ? existingPrices.reduce((a, b) => a + b, 0) / existingPrices.length 
            : 75;

          // Create new event_sections
          const newEventSections: Array<{
            event_id: string;
            section_id: string;
            price: number;
            service_fee: number;
            capacity: number;
            available_count: number;
          }> = [];

          for (const section of sections) {
            if (existingSectionIds.has(section.id)) continue;

            let price = avgPrice;
            if (section.section_type === 'floor' || section.section_type === 'premium') {
              price = avgPrice * 1.3;
            } else if (section.section_type === 'upper') {
              price = avgPrice * 0.7;
            }
            price = Math.round(price * 100) / 100;

            newEventSections.push({
              event_id: event.id,
              section_id: section.id,
              price,
              service_fee: Math.round(price * 0.15 * 100) / 100,
              capacity: section.capacity || 100,
              available_count: tickets_per_section,
            });
          }

          if (newEventSections.length > 0) {
            const { data: insertedSections, error: insertError } = await supabase
              .from('event_sections')
              .insert(newEventSections)
              .select('id, section_id, price');

            if (insertError) {
              results.push({ event: event.title, status: 'error', created: 0 });
              continue;
            }

            // Generate inventory
            if (generate_inventory && insertedSections) {
              const inventoryItems: Array<{
                event_section_id: string;
                price: number;
                quantity: number;
                row_name: string;
                status: string;
              }> = [];

              for (const es of insertedSections) {
                const numListings = Math.ceil(tickets_per_section / 4);
                for (let i = 0; i < numListings; i++) {
                  const row = String.fromCharCode(65 + (i % 10));
                  const qty = Math.min(4, tickets_per_section - (i * 4));
                  if (qty <= 0) break;

                  inventoryItems.push({
                    event_section_id: es.id,
                    price: Number(es.price) + (Math.random() * 20 - 10),
                    quantity: qty,
                    row_name: row,
                    status: 'available',
                  });
                }
              }

              if (inventoryItems.length > 0) {
                await supabase.from('ticket_inventory').insert(inventoryItems);
              }
            }

            totalCreated += insertedSections?.length || 0;
            results.push({ event: event.title, status: 'success', created: insertedSections?.length || 0 });
          } else {
            results.push({ event: event.title, status: 'already_linked' });
          }
        } catch (err) {
          console.error(`Error processing event ${event.title}:`, err);
          results.push({ event: event.title, status: 'error' });
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        total_events_processed: events?.length || 0,
        total_event_sections_created: totalCreated,
        results: results.slice(0, 50), // Only return first 50 for readability
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Single event processing (original logic)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, venue_id')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('id, name, svg_path, section_type, capacity')
      .eq('venue_id', event.venue_id)
      .not('svg_path', 'is', null)
      .order('name');

    if (sectionsError) throw sectionsError;

    if (!sections || sections.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No sections with svg_path found for this venue.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: existingEventSections, error: existingError } = await supabase
      .from('event_sections')
      .select('section_id, price')
      .eq('event_id', event_id);

    if (existingError) throw existingError;

    const existingSectionIds = new Set((existingEventSections || []).map(es => es.section_id));
    const existingPrices = (existingEventSections || []).map(es => Number(es.price));
    const avgPrice = existingPrices.length > 0 
      ? existingPrices.reduce((a, b) => a + b, 0) / existingPrices.length 
      : 75;

    const newEventSections: Array<{
      event_id: string;
      section_id: string;
      price: number;
      service_fee: number;
      capacity: number;
      available_count: number;
    }> = [];

    for (const section of sections) {
      if (existingSectionIds.has(section.id)) continue;

      let price = avgPrice;
      if (section.section_type === 'floor' || section.section_type === 'premium') {
        price = avgPrice * 1.3;
      } else if (section.section_type === 'upper') {
        price = avgPrice * 0.7;
      }
      price = Math.round(price * 100) / 100;

      newEventSections.push({
        event_id: event_id,
        section_id: section.id,
        price,
        service_fee: Math.round(price * 0.15 * 100) / 100,
        capacity: section.capacity || 100,
        available_count: tickets_per_section,
      });
    }

    let createdEventSections = 0;
    let createdInventory = 0;

    if (newEventSections.length > 0) {
      const { data: insertedSections, error: insertError } = await supabase
        .from('event_sections')
        .insert(newEventSections)
        .select('id, section_id, price');

      if (insertError) throw insertError;
      createdEventSections = insertedSections?.length || 0;

      if (generate_inventory && insertedSections) {
        const inventoryItems: Array<{
          event_section_id: string;
          price: number;
          quantity: number;
          row_name: string;
          status: string;
        }> = [];

        for (const es of insertedSections) {
          const numListings = Math.ceil(tickets_per_section / 4);
          for (let i = 0; i < numListings; i++) {
            const row = String.fromCharCode(65 + (i % 10));
            const qty = Math.min(4, tickets_per_section - (i * 4));
            if (qty <= 0) break;

            inventoryItems.push({
              event_section_id: es.id,
              price: Number(es.price) + (Math.random() * 20 - 10),
              quantity: qty,
              row_name: row,
              status: 'available',
            });
          }
        }

        if (inventoryItems.length > 0) {
          const { error: invError } = await supabase
            .from('ticket_inventory')
            .insert(inventoryItems);

          if (!invError) {
            createdInventory = inventoryItems.length;
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      event: event.title,
      total_mappable_sections: sections.length,
      already_linked: existingSectionIds.size,
      created_event_sections: createdEventSections,
      created_inventory_items: createdInventory,
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
