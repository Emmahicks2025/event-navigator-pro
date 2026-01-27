import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

// Fetch event sections for a specific event
export function useEventSections(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-sections', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('event_sections')
        .select(`
          *,
          section:sections(id, name, capacity, section_type)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

// Create a single event section
export function useCreateEventSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventSection: TablesInsert<'event_sections'>) => {
      const { data, error } = await supabase
        .from('event_sections')
        .insert(eventSection)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-sections', variables.event_id] });
    },
  });
}

// Auto-generate event sections from venue sections
export function useAutoGenerateEventSections() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      eventId, 
      venueId, 
      basePrice = 50, 
      serviceFee = 10 
    }: { 
      eventId: string; 
      venueId: string; 
      basePrice?: number; 
      serviceFee?: number;
    }) => {
      // First, get all venue sections
      const { data: venueSections, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('venue_id', venueId)
        .order('sort_order', { ascending: true });
      
      if (sectionsError) throw sectionsError;
      if (!venueSections || venueSections.length === 0) {
        throw new Error('No sections found for this venue');
      }
      
      // Check for existing event sections
      const { data: existingEventSections } = await supabase
        .from('event_sections')
        .select('section_id')
        .eq('event_id', eventId);
      
      const existingSectionIds = new Set(existingEventSections?.map(es => es.section_id) || []);
      
      // Create event sections for each venue section that doesn't exist
      const newEventSections = venueSections
        .filter(section => !existingSectionIds.has(section.id))
        .map(section => {
          // Price scaling based on section type
          let priceMultiplier = 1;
          const sectionType = section.section_type?.toLowerCase() || '';
          const sectionName = section.name?.toLowerCase() || '';
          
          if (sectionType === 'vip' || sectionName.includes('vip') || sectionName.includes('suite')) {
            priceMultiplier = 3;
          } else if (sectionType === 'floor' || sectionName.includes('floor') || sectionName.includes('pit')) {
            priceMultiplier = 2.5;
          } else if (sectionName.includes('lower') || sectionName.includes('100')) {
            priceMultiplier = 1.8;
          } else if (sectionName.includes('club')) {
            priceMultiplier = 2;
          } else if (sectionName.includes('upper') || sectionName.includes('300')) {
            priceMultiplier = 0.8;
          }
          
          const capacity = section.capacity || 100;
          
          return {
            event_id: eventId,
            section_id: section.id,
            price: Math.round(basePrice * priceMultiplier * 100) / 100,
            service_fee: serviceFee,
            capacity: capacity,
            available_count: capacity,
            is_sold_out: false,
          };
        });
      
      if (newEventSections.length === 0) {
        throw new Error('All sections already exist for this event');
      }
      
      const { data, error } = await supabase
        .from('event_sections')
        .insert(newEventSections)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-sections', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Auto-generate inventory tickets for an event
export function useAutoGenerateInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      eventId,
      minTickets = 1,
      maxTickets = 500,
      priceVariation = 0.2, // 20% variation
    }: { 
      eventId: string;
      minTickets?: number;
      maxTickets?: number;
      priceVariation?: number;
    }) => {
      // Get all event sections
      const { data: eventSections, error: sectionsError } = await supabase
        .from('event_sections')
        .select(`
          *,
          section:sections(id, name, row_count, seats_per_row, is_general_admission)
        `)
        .eq('event_id', eventId);
      
      if (sectionsError) throw sectionsError;
      if (!eventSections || eventSections.length === 0) {
        throw new Error('No sections found. Please generate event sections first.');
      }
      
      // Calculate total tickets to distribute
      const totalTickets = Math.floor(Math.random() * (maxTickets - minTickets + 1)) + minTickets;
      
      // Distribute tickets across sections proportionally by capacity
      const totalCapacity = eventSections.reduce((sum, es) => sum + (es.capacity || 100), 0);
      
      const inventoryItems: any[] = [];
      let remainingTickets = totalTickets;
      
      for (let i = 0; i < eventSections.length; i++) {
        const eventSection = eventSections[i];
        const section = eventSection.section;
        const isLast = i === eventSections.length - 1;
        
        // Calculate proportional tickets for this section
        const proportionalTickets = isLast 
          ? remainingTickets 
          : Math.floor((eventSection.capacity / totalCapacity) * totalTickets);
        
        const sectionTickets = Math.max(0, Math.min(proportionalTickets, remainingTickets));
        remainingTickets -= sectionTickets;
        
        if (sectionTickets <= 0) continue;
        
        // Generate ticket listings
        const rowCount = section?.row_count || 10;
        const seatsPerRow = section?.seats_per_row || 20;
        const isGA = section?.is_general_admission || false;
        const basePrice = Number(eventSection.price) || 50;
        
        // Create multiple listings for variety
        const numListings = Math.max(1, Math.ceil(sectionTickets / 4));
        let ticketsAssigned = 0;
        
        for (let j = 0; j < numListings && ticketsAssigned < sectionTickets; j++) {
          const remaining = sectionTickets - ticketsAssigned;
          const quantity = Math.min(remaining, Math.floor(Math.random() * 4) + 1);
          
          // Random row letter/number
          const rowNum = Math.floor(Math.random() * rowCount) + 1;
          const rowName = isGA ? null : (rowNum <= 26 ? String.fromCharCode(64 + rowNum) : String(rowNum));
          
          // Random seat numbers
          const startSeat = Math.floor(Math.random() * (seatsPerRow - quantity)) + 1;
          const seatNumbers = isGA 
            ? null 
            : quantity === 1 
              ? String(startSeat)
              : `${startSeat}-${startSeat + quantity - 1}`;
          
          // Price with variation
          const variation = 1 + (Math.random() * priceVariation * 2 - priceVariation);
          const price = Math.round(basePrice * variation * 100) / 100;
          
          inventoryItems.push({
            event_section_id: eventSection.id,
            price: price,
            quantity: quantity,
            row_name: rowName,
            seat_numbers: seatNumbers,
            status: 'available',
            is_resale: Math.random() > 0.8, // 20% resale
            is_lowest_price: false,
            has_clear_view: Math.random() > 0.3, // 70% clear view
          });
          
          ticketsAssigned += quantity;
        }
      }
      
      if (inventoryItems.length === 0) {
        throw new Error('No inventory items could be generated');
      }
      
      // Insert all inventory items
      const { data, error } = await supabase
        .from('ticket_inventory')
        .insert(inventoryItems)
        .select();
      
      if (error) throw error;
      
      // Mark lowest price tickets per section
      const sectionPrices = new Map<string, number>();
      for (const item of data || []) {
        const currentMin = sectionPrices.get(item.event_section_id) ?? Infinity;
        if (item.price < currentMin) {
          sectionPrices.set(item.event_section_id, item.price);
        }
      }
      
      // Update lowest price flags
      for (const [sectionId, minPrice] of sectionPrices) {
        await supabase
          .from('ticket_inventory')
          .update({ is_lowest_price: true })
          .eq('event_section_id', sectionId)
          .eq('price', minPrice);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Delete all event sections for an event
export function useDeleteEventSections() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('event_sections')
        .delete()
        .eq('event_id', eventId);
      
      if (error) throw error;
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-sections', eventId] });
    },
  });
}
