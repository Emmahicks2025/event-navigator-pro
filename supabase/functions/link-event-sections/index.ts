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

    const { event_id, generate_inventory = true, tickets_per_section = 10 } = await req.json();

    if (!event_id) {
      throw new Error('event_id is required');
    }

    // Get event and its venue
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, venue_id')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Get all sections for this venue that have svg_path (mappable sections)
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
        message: 'No sections with svg_path found for this venue. Run section sync first.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get existing event_sections
    const { data: existingEventSections, error: existingError } = await supabase
      .from('event_sections')
      .select('section_id, price')
      .eq('event_id', event_id);

    if (existingError) throw existingError;

    const existingSectionIds = new Set((existingEventSections || []).map(es => es.section_id));
    
    // Calculate base prices from existing sections
    const existingPrices = (existingEventSections || []).map(es => Number(es.price));
    const avgPrice = existingPrices.length > 0 
      ? existingPrices.reduce((a, b) => a + b, 0) / existingPrices.length 
      : 75;

    // Create event_sections for new mappable sections
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

      // Set price based on section type
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
        price: price,
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

      // Generate inventory for new sections
      if (generate_inventory && insertedSections) {
        const inventoryItems: Array<{
          event_section_id: string;
          price: number;
          quantity: number;
          row_name: string;
          status: string;
        }> = [];

        for (const es of insertedSections) {
          // Create a few inventory listings per section
          const numListings = Math.ceil(tickets_per_section / 4);
          for (let i = 0; i < numListings; i++) {
            const row = String.fromCharCode(65 + (i % 10)); // A-J
            const qty = Math.min(4, tickets_per_section - (i * 4));
            if (qty <= 0) break;

            inventoryItems.push({
              event_section_id: es.id,
              price: Number(es.price) + (Math.random() * 20 - 10), // Vary price a bit
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

          if (invError) {
            console.error('Inventory insert error:', invError);
          } else {
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
