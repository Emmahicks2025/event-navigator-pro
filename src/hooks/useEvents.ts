import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventWithRelations, transformDbEventToEvent } from '@/types/database';
import { Event } from '@/types/event';

// Fetch all active events with relations
export function useEvents(options?: { category?: string; limit?: number; featured?: boolean; homepageSection?: string }) {
  return useQuery({
    queryKey: ['events', options],
    queryFn: async (): Promise<Event[]> => {
      let query = supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          category:categories(*),
          performer:performers(*)
        `)
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (options?.featured) {
        query = query.eq('is_featured', true).order('display_order', { ascending: true });
      }

      if (options?.homepageSection) {
        query = query.contains('homepage_sections', [options.homepageSection]);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by category slug if provided
      let events = (data as EventWithRelations[]) || [];
      if (options?.category) {
        events = events.filter(e => e.category?.slug === options.category);
      }

      return events.map(transformDbEventToEvent);
    },
  });
}

// Fetch events for specific homepage section
export function useHomepageSectionEvents(section: 'top_events' | 'concerts' | 'sports', limit = 10) {
  return useEvents({ homepageSection: section, limit });
}

// Fetch featured events (top events section)
export function useFeaturedEvents(limit = 10) {
  return useHomepageSectionEvents('top_events', limit);
}

// Fetch events by category
export function useEventsByCategory(categorySlug: string) {
  return useEvents({ category: categorySlug });
}

// Fetch a single event by ID with all relations
export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          category:categories(*),
          performer:performers(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as EventWithRelations;
    },
    enabled: !!id,
  });
}

// Fetch event sections with pricing for an event
export function useEventSections(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-sections', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('event_sections')
        .select(`
          *,
          section:sections(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });
}

// Fetch available tickets for an event
export function useEventTickets(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-tickets', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      // First get event_section IDs for this event
      const { data: eventSections, error: esError } = await supabase
        .from('event_sections')
        .select('id')
        .eq('event_id', eventId);
      
      if (esError) throw esError;
      if (!eventSections || eventSections.length === 0) return [];

      const sectionIds = eventSections.map(es => es.id);

      // Then get tickets for those sections
      const { data, error } = await supabase
        .from('ticket_inventory')
        .select(`
          *,
          event_section:event_sections(
            *,
            section:sections(*)
          )
        `)
        .in('event_section_id', sectionIds)
        .eq('status', 'available')
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });
}

// Search events
export function useSearchEvents(query: string) {
  return useQuery({
    queryKey: ['search-events', query],
    queryFn: async (): Promise<Event[]> => {
      if (!query.trim()) {
        // Return all events if no query
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            venue:venues(*),
            category:categories(*),
            performer:performers(*)
          `)
          .eq('is_active', true)
          .order('event_date', { ascending: true });

        if (error) throw error;
        return ((data as EventWithRelations[]) || []).map(transformDbEventToEvent);
      }

      // Search with ilike on multiple fields
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          category:categories(*),
          performer:performers(*)
        `)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('event_date', { ascending: true });

      if (error) throw error;
      
      let events = ((data as EventWithRelations[]) || []).map(transformDbEventToEvent);
      
      // Also search by venue and city
      const lowerQuery = query.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(lowerQuery) ||
        e.venue.toLowerCase().includes(lowerQuery) ||
        e.city.toLowerCase().includes(lowerQuery) ||
        e.category.toLowerCase().includes(lowerQuery)
      );

      return events;
    },
  });
}
