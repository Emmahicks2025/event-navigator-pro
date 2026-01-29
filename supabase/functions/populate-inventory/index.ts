import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedTicket {
  section: string;
  row?: string;
  price: number;
  quantity: number;
}

interface EventData {
  id: string;
  title: string;
  event_date: string;
  performer_name: string | null;
  venue_name: string | null;
  venue_id: string | null;
  city: string | null;
  state: string | null;
}

// Standard section templates for different venue types
const SECTION_TEMPLATES = {
  stadium: [
    { name: 'Field Level', section_type: 'floor', capacity: 200, sort_order: 1 },
    { name: 'Lower Level', section_type: 'lower', capacity: 500, sort_order: 2 },
    { name: 'Club Level', section_type: 'club', capacity: 300, sort_order: 3 },
    { name: 'Upper Level', section_type: 'upper', capacity: 800, sort_order: 4 },
    { name: 'Endzone', section_type: 'standard', capacity: 400, sort_order: 5 },
  ],
  arena: [
    { name: 'Floor', section_type: 'floor', capacity: 150, sort_order: 1 },
    { name: 'Lower Bowl', section_type: 'lower', capacity: 400, sort_order: 2 },
    { name: 'Club', section_type: 'club', capacity: 200, sort_order: 3 },
    { name: 'Upper Bowl', section_type: 'upper', capacity: 600, sort_order: 4 },
  ],
  theater: [
    { name: 'Orchestra', section_type: 'orchestra', capacity: 300, sort_order: 1 },
    { name: 'Front Mezzanine', section_type: 'mezzanine', capacity: 150, sort_order: 2 },
    { name: 'Rear Mezzanine', section_type: 'mezzanine', capacity: 200, sort_order: 3 },
    { name: 'Balcony', section_type: 'balcony', capacity: 250, sort_order: 4 },
  ],
  amphitheater: [
    { name: 'Pit', section_type: 'pit', capacity: 100, sort_order: 1 },
    { name: 'Orchestra', section_type: 'orchestra', capacity: 300, sort_order: 2 },
    { name: 'Pavilion', section_type: 'pavilion', capacity: 400, sort_order: 3 },
    { name: 'Lawn', section_type: 'lawn', capacity: 1000, sort_order: 4 },
  ],
  club: [
    { name: 'General Admission', section_type: 'ga', capacity: 500, sort_order: 1 },
    { name: 'VIP', section_type: 'vip', capacity: 50, sort_order: 2 },
    { name: 'Balcony', section_type: 'balcony', capacity: 100, sort_order: 3 },
  ],
};

// Price multipliers by section type
const SECTION_PRICE_MULTIPLIERS: Record<string, number> = {
  floor: 1.5,
  pit: 1.6,
  vip: 2.0,
  suite: 2.5,
  club: 1.4,
  orchestra: 1.3,
  lower: 1.2,
  mezzanine: 1.1,
  pavilion: 1.0,
  standard: 1.0,
  upper: 0.7,
  balcony: 0.8,
  lawn: 0.5,
  ga: 0.9,
  endzone: 0.85,
};

// Category-based base pricing (will be reduced by 50%)
const CATEGORY_BASE_PRICES: Record<string, { min: number; max: number }> = {
  concerts: { min: 75, max: 350 },
  sports: { min: 50, max: 400 },
  theater: { min: 80, max: 300 },
  comedy: { min: 40, max: 150 },
  festivals: { min: 100, max: 500 },
  default: { min: 50, max: 200 },
};

function getVenueType(venueName: string | null): keyof typeof SECTION_TEMPLATES {
  if (!venueName) return 'arena';
  const name = venueName.toLowerCase();
  
  if (name.includes('stadium') || name.includes('field') || name.includes('park')) {
    return 'stadium';
  }
  if (name.includes('theatre') || name.includes('theater') || name.includes('opera')) {
    return 'theater';
  }
  if (name.includes('amphitheatre') || name.includes('amphitheater') || name.includes('pavilion')) {
    return 'amphitheater';
  }
  if (name.includes('club') || name.includes('hall') || name.includes('house') || name.includes('room')) {
    return 'club';
  }
  return 'arena';
}

function getCategoryFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('concert') || lowerTitle.includes('tour')) return 'concerts';
  if (lowerTitle.includes('musical') || lowerTitle.includes('broadway') || lowerTitle.includes('opera')) return 'theater';
  if (lowerTitle.includes('comedy') || lowerTitle.includes('comedian')) return 'comedy';
  if (lowerTitle.includes('festival')) return 'festivals';
  if (
    lowerTitle.includes('nfl') || lowerTitle.includes('nba') || lowerTitle.includes('nhl') ||
    lowerTitle.includes('mlb') || lowerTitle.includes('mls') || lowerTitle.includes('vs') ||
    lowerTitle.includes(' at ') || lowerTitle.includes('game') || lowerTitle.includes('match')
  ) return 'sports';
  return 'default';
}

async function scrapeGoTickets(
  firecrawlApiKey: string,
  performer: string,
  venue: string,
  city: string,
  eventDate: string
): Promise<ScrapedTicket[] | null> {
  try {
    // Build search query
    const searchQuery = `site:gotickets.com ${performer} ${venue} ${city} tickets`;
    console.log(`Searching gotickets.com: ${searchQuery}`);

    // First, search for the event
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
      }),
    });

    if (!searchResponse.ok) {
      console.log('Search failed:', await searchResponse.text());
      return null;
    }

    const searchData = await searchResponse.json();
    if (!searchData.success || !searchData.data || searchData.data.length === 0) {
      console.log('No results found on gotickets.com');
      return null;
    }

    // Find the best matching URL
    const eventUrl = searchData.data.find((r: any) => 
      r.url && r.url.includes('gotickets.com') && 
      (r.url.includes('/tickets/') || r.url.includes('/events/'))
    )?.url;

    if (!eventUrl) {
      console.log('No valid event URL found');
      return null;
    }

    console.log(`Found event URL: ${eventUrl}`);

    // Scrape the event page for ticket listings
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: eventUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      console.log('Scrape failed:', await scrapeResponse.text());
      return null;
    }

    const scrapeData = await scrapeResponse.json();
    if (!scrapeData.success || !scrapeData.data) {
      return null;
    }

    const content = scrapeData.data.markdown || scrapeData.data.html || '';
    
    // Parse ticket listings from the content
    const tickets = parseTicketListings(content);
    
    if (tickets.length > 0) {
      console.log(`Found ${tickets.length} ticket listings`);
      return tickets;
    }

    return null;
  } catch (error) {
    console.error('Error scraping gotickets:', error);
    return null;
  }
}

function parseTicketListings(content: string): ScrapedTicket[] {
  const tickets: ScrapedTicket[] = [];
  
  // Common patterns for ticket listings
  // Pattern: Section XXX, Row YY - $ZZZ
  const sectionRowPricePattern = /(?:section|sec\.?)\s*([A-Z0-9]+(?:\s*[A-Z0-9]+)?)[,\s]+(?:row|rw\.?)\s*([A-Z0-9]+)[^\$]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
  
  // Pattern: Just section with price
  const sectionPricePattern = /(?:section|sec\.?|area)\s*([A-Z0-9\s]+)[^\$]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
  
  // Pattern: Price ranges
  const priceRangePattern = /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*[-–]\s*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;

  let match;

  // Try section + row + price pattern first
  while ((match = sectionRowPricePattern.exec(content)) !== null) {
    const price = parseFloat(match[3].replace(',', ''));
    if (price > 0 && price < 10000) {
      tickets.push({
        section: match[1].trim(),
        row: match[2].trim(),
        price,
        quantity: Math.floor(Math.random() * 4) + 1,
      });
    }
  }

  // If no detailed listings, try section + price
  if (tickets.length === 0) {
    while ((match = sectionPricePattern.exec(content)) !== null) {
      const price = parseFloat(match[2].replace(',', ''));
      if (price > 0 && price < 10000) {
        tickets.push({
          section: match[1].trim().substring(0, 30),
          price,
          quantity: Math.floor(Math.random() * 6) + 2,
        });
      }
    }
  }

  // Extract price ranges for fallback pricing
  if (tickets.length === 0) {
    while ((match = priceRangePattern.exec(content)) !== null) {
      const minPrice = parseFloat(match[1].replace(',', ''));
      const maxPrice = parseFloat(match[2].replace(',', ''));
      if (minPrice > 0 && maxPrice < 10000) {
        // Create synthetic sections based on price range
        tickets.push(
          { section: 'Lower Level', price: maxPrice * 0.8, quantity: 4 },
          { section: 'Mid Level', price: (minPrice + maxPrice) / 2, quantity: 6 },
          { section: 'Upper Level', price: minPrice * 1.2, quantity: 8 },
        );
        break;
      }
    }
  }

  return tickets;
}

function generateRealisticInventory(
  sections: Array<{ id: string; name: string; section_type: string; capacity: number }>,
  category: string
): Array<{ section_id: string; section_name: string; price: number; tickets: number }> {
  const basePricing = CATEGORY_BASE_PRICES[category] || CATEGORY_BASE_PRICES.default;
  const inventory: Array<{ section_id: string; section_name: string; price: number; tickets: number }> = [];

  for (const section of sections) {
    const multiplier = SECTION_PRICE_MULTIPLIERS[section.section_type] || 1.0;
    
    // Calculate base price within the range
    const basePrice = basePricing.min + (Math.random() * (basePricing.max - basePricing.min));
    
    // Apply section multiplier and 50% discount
    const finalPrice = Math.round((basePrice * multiplier * 0.5) * 100) / 100;
    
    // Generate 2-8 ticket listings per section
    const numListings = Math.floor(Math.random() * 7) + 2;
    
    for (let i = 0; i < numListings; i++) {
      // Vary price slightly for each listing
      const variance = 0.9 + (Math.random() * 0.2); // 90% to 110% of base
      const listingPrice = Math.round((finalPrice * variance) * 100) / 100;
      const quantity = Math.floor(Math.random() * 6) + 1; // 1-6 tickets
      
      inventory.push({
        section_id: section.id,
        section_name: section.name,
        price: listingPrice,
        tickets: quantity,
      });
    }
  }

  return inventory;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlApiKey) {
      console.warn('FIRECRAWL_API_KEY not set - will use generated inventory only');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { eventIds, limit = 50 } = await req.json().catch(() => ({}));

    // Get events without inventory
    let eventsQuery = supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        venue_id,
        performer:performers(name),
        venue:venues(id, name, city, state),
        category:categories(slug)
      `)
      .eq('is_active', true)
      .order('event_date', { ascending: true });

    if (eventIds && eventIds.length > 0) {
      eventsQuery = eventsQuery.in('id', eventIds);
    }

    const { data: events, error: eventsError } = await eventsQuery.limit(limit);

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    console.log(`Processing ${events?.length || 0} events`);

    const results = {
      processed: 0,
      scraped: 0,
      generated: 0,
      errors: [] as string[],
    };

    for (const event of events || []) {
      try {
        const venueId = event.venue_id || (event.venue as any)?.id;
        const venueName = (event.venue as any)?.name;
        const city = (event.venue as any)?.city;
        const state = (event.venue as any)?.state;
        const performerName = (event.performer as any)?.name;
        const categorySlug = (event.category as any)?.slug || getCategoryFromTitle(event.title);

        if (!venueId) {
          console.log(`Skipping ${event.title} - no venue`);
          continue;
        }

        // Check if venue has sections, create if not
        const { data: existingSections } = await supabase
          .from('sections')
          .select('id, name, section_type, capacity')
          .eq('venue_id', venueId);

        let sections = existingSections || [];

        if (sections.length === 0) {
          // Create sections for this venue
          const venueType = getVenueType(venueName);
          const template = SECTION_TEMPLATES[venueType];
          
          const sectionsToInsert = template.map(s => ({
            venue_id: venueId,
            ...s,
          }));

          const { data: newSections, error: sectionsError } = await supabase
            .from('sections')
            .insert(sectionsToInsert)
            .select('id, name, section_type, capacity');

          if (sectionsError) {
            console.error(`Error creating sections for ${venueName}:`, sectionsError);
            results.errors.push(`Sections error for ${event.title}: ${sectionsError.message}`);
            continue;
          }

          sections = newSections || [];
          console.log(`Created ${sections.length} sections for ${venueName}`);
        }

        // Check if event_sections exist
        const { data: existingEventSections } = await supabase
          .from('event_sections')
          .select('id, section_id')
          .eq('event_id', event.id);

        let eventSections = existingEventSections || [];

        if (eventSections.length === 0) {
          // Create event_sections
          const basePricing = CATEGORY_BASE_PRICES[categorySlug] || CATEGORY_BASE_PRICES.default;
          const basePrice = basePricing.min + (Math.random() * (basePricing.max - basePricing.min));

          const eventSectionsToInsert = sections.map(section => {
            const multiplier = SECTION_PRICE_MULTIPLIERS[section.section_type] || 1.0;
            const price = Math.round((basePrice * multiplier * 0.5) * 100) / 100; // 50% discount
            
            return {
              event_id: event.id,
              section_id: section.id,
              price,
              capacity: section.capacity,
              available_count: Math.floor(section.capacity * (0.3 + Math.random() * 0.5)), // 30-80% available
              service_fee: Math.round(price * 0.15 * 100) / 100, // 15% service fee
            };
          });

          const { data: newEventSections, error: esError } = await supabase
            .from('event_sections')
            .insert(eventSectionsToInsert)
            .select('id, section_id');

          if (esError) {
            console.error(`Error creating event_sections for ${event.title}:`, esError);
            results.errors.push(`Event sections error for ${event.title}: ${esError.message}`);
            continue;
          }

          eventSections = newEventSections || [];
          console.log(`Created ${eventSections.length} event_sections for ${event.title}`);
        }

        // Check if ticket inventory exists
        const eventSectionIds = eventSections.map(es => es.id);
        const { data: existingInventory, error: invCheckError } = await supabase
          .from('ticket_inventory')
          .select('id')
          .in('event_section_id', eventSectionIds)
          .limit(1);

        if (existingInventory && existingInventory.length > 0) {
          console.log(`Inventory already exists for ${event.title}`);
          results.processed++;
          continue;
        }

        // Try to scrape gotickets.com first
        let scrapedTickets: ScrapedTicket[] | null = null;
        
        if (firecrawlApiKey && performerName && venueName && city) {
          scrapedTickets = await scrapeGoTickets(
            firecrawlApiKey,
            performerName,
            venueName,
            city,
            event.event_date
          );
        }

        // Build section lookup map
        const sectionMap = new Map(sections.map(s => [s.id, s]));
        const eventSectionMap = new Map(eventSections.map(es => {
          const section = sectionMap.get(es.section_id);
          return [section?.name?.toLowerCase() || '', es.id];
        }));

        const inventoryToInsert: any[] = [];

        if (scrapedTickets && scrapedTickets.length > 0) {
          // Use scraped data with 50% discount
          for (const ticket of scrapedTickets) {
            // Try to match to an event section
            let eventSectionId = eventSectionMap.get(ticket.section.toLowerCase());
            
            // If no exact match, try partial match or use first section
            if (!eventSectionId) {
              for (const [name, id] of eventSectionMap.entries()) {
                if (name.includes(ticket.section.toLowerCase()) || 
                    ticket.section.toLowerCase().includes(name)) {
                  eventSectionId = id;
                  break;
                }
              }
            }
            
            if (!eventSectionId && eventSections.length > 0) {
              // Assign to random section
              eventSectionId = eventSections[Math.floor(Math.random() * eventSections.length)].id;
            }

            if (eventSectionId) {
              const discountedPrice = Math.round((ticket.price * 0.5) * 100) / 100;
              inventoryToInsert.push({
                event_section_id: eventSectionId,
                price: discountedPrice,
                quantity: ticket.quantity,
                row_name: ticket.row || `Row ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                status: 'available',
                has_clear_view: Math.random() > 0.3,
                is_lowest_price: false,
              });
            }
          }
          results.scraped++;
        } else {
          // Generate realistic inventory
          const sectionsWithIds = sections.map(s => {
            const es = eventSections.find(es => es.section_id === s.id);
            return { ...s, id: es?.id || s.id };
          });
          
          const generated = generateRealisticInventory(
            eventSections.map(es => {
              const section = sectionMap.get(es.section_id);
              return {
                id: es.id,
                name: section?.name || 'General',
                section_type: section?.section_type || 'standard',
                capacity: section?.capacity || 100,
              };
            }),
            categorySlug
          );

          for (const item of generated) {
            inventoryToInsert.push({
              event_section_id: item.section_id,
              price: item.price,
              quantity: item.tickets,
              row_name: `Row ${String.fromCharCode(65 + Math.floor(Math.random() * 20))}`,
              status: 'available',
              has_clear_view: Math.random() > 0.25,
              is_lowest_price: false,
            });
          }
          results.generated++;
        }

        // Insert inventory in batches
        if (inventoryToInsert.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < inventoryToInsert.length; i += batchSize) {
            const batch = inventoryToInsert.slice(i, i + batchSize);
            const { error: insertError } = await supabase
              .from('ticket_inventory')
              .insert(batch);

            if (insertError) {
              console.error(`Error inserting inventory for ${event.title}:`, insertError);
              results.errors.push(`Inventory insert error for ${event.title}: ${insertError.message}`);
            }
          }

          // Mark lowest price tickets per section
          for (const es of eventSections) {
            try {
              // Get the lowest priced ticket in this section and mark it
              const { data: lowestTicket } = await supabase
                .from('ticket_inventory')
                .select('id')
                .eq('event_section_id', es.id)
                .eq('status', 'available')
                .order('price', { ascending: true })
                .limit(1)
                .single();
              
              if (lowestTicket) {
                await supabase
                  .from('ticket_inventory')
                  .update({ is_lowest_price: true })
                  .eq('id', lowestTicket.id);
              }
            } catch {
              // Ignore errors
            }
          }

          console.log(`Inserted ${inventoryToInsert.length} inventory items for ${event.title}`);
        }

        // Update event price_from and price_to
        if (inventoryToInsert.length > 0) {
          const prices = inventoryToInsert.map(i => i.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);

          await supabase
            .from('events')
            .update({ price_from: minPrice, price_to: maxPrice })
            .eq('id', event.id);
        }

        results.processed++;
      } catch (error) {
        console.error(`Error processing event ${event.title}:`, error);
        results.errors.push(`${event.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in populate-inventory:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
