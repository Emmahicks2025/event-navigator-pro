// Database types that map Supabase tables to frontend-friendly formats
import { Tables } from '@/integrations/supabase/types';

// Base database types
export type DbEvent = Tables<'events'>;
export type DbVenue = Tables<'venues'>;
export type DbCategory = Tables<'categories'>;
export type DbPerformer = Tables<'performers'>;
export type DbSection = Tables<'sections'>;
export type DbEventSection = Tables<'event_sections'>;
export type DbTicketInventory = Tables<'ticket_inventory'>;
export type DbOrder = Tables<'orders'>;
export type DbOrderItem = Tables<'order_items'>;

// Joined/enriched types for frontend use
export interface EventWithRelations extends DbEvent {
  venue?: DbVenue | null;
  category?: DbCategory | null;
  performer?: DbPerformer | null;
}

export interface EventSectionWithDetails extends DbEventSection {
  section?: DbSection | null;
}

export interface TicketWithDetails extends DbTicketInventory {
  event_section?: EventSectionWithDetails | null;
}

export interface CategoryWithCount extends DbCategory {
  events_count?: number;
}

export interface PerformerWithCount extends DbPerformer {
  events_count?: number;
}

// Transform database event to legacy Event format for backward compatibility
export function transformDbEventToEvent(dbEvent: EventWithRelations): import('@/types/event').Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    date: dbEvent.event_date 
      ? new Date(dbEvent.event_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : 'TBD',
    time: dbEvent.event_time 
      ? formatTime(dbEvent.event_time)
      : 'TBD',
    venue: dbEvent.venue?.name || 'TBD',
    city: dbEvent.venue?.city || '',
    state: dbEvent.venue?.state || '',
    category: (dbEvent.category?.slug as 'concerts' | 'sports' | 'theater' | 'comedy') || 'concerts',
    image: dbEvent.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    priceFrom: Number(dbEvent.price_from) || 0,
    priceTo: Number(dbEvent.price_to) || 0,
    description: dbEvent.description || undefined,
    isFeatured: dbEvent.is_featured || false,
  };
}

function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

// Transform database category to legacy Category format
export function transformDbCategoryToCategory(dbCategory: CategoryWithCount): import('@/types/event').Category {
  return {
    id: dbCategory.slug,
    name: dbCategory.name,
    icon: dbCategory.icon || '🎫',
    count: dbCategory.events_count || 0,
  };
}

// Transform database performer to legacy Performer format
export function transformDbPerformerToPerformer(dbPerformer: PerformerWithCount): import('@/types/event').Performer {
  return {
    id: dbPerformer.id,
    name: dbPerformer.name,
    image: dbPerformer.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    category: 'concerts', // Will be updated when we have category relation
    eventsCount: dbPerformer.events_count || 0,
  };
}
