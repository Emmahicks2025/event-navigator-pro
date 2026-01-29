import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, HelpCircle, Filter, X, Flame, Loader2 } from 'lucide-react';
import { useEvent, useEventSections, useEventTickets } from '@/hooks/useEvents';
import { DynamicVenueMap } from '@/components/DynamicVenueMap';
import { VirtualizedTicketList, TicketListingItem } from '@/components/VirtualizedTicketList';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { transformDbEventToEvent } from '@/types/database';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<any>(null);
  const [showMap, setShowMap] = useState(true);
  const [sortBy, setSortBy] = useState('price-low');
  const [ticketCount, setTicketCount] = useState(1);

  // Fetch data from database
  const { data: dbEvent, isLoading: loadingEvent } = useEvent(id);
  const { data: eventSections = [], isLoading: loadingSections } = useEventSections(id);
  const { data: tickets = [], isLoading: loadingTickets } = useEventTickets(id);

  // Transform to legacy format for compatibility
  const event = dbEvent ? transformDbEventToEvent(dbEvent) : null;

  // Transform tickets to TicketListingItem format
  // NOTE: we also keep sectionId to make filtering reliable (don’t match by display name).
  const listings = useMemo(() => {
    return tickets.map((ticket: any) => ({
      id: ticket.id,
      sectionId: ticket.event_section?.section_id as string | undefined,
      section: ticket.event_section?.section?.name || 'Unknown Section',
      row: ticket.row_name || 'GA',
      seats: ticket.quantity,
      price: Number(ticket.price),
      isLowestPrice: ticket.is_lowest_price || false,
      hasClearView: ticket.has_clear_view || false,
    }));
  }, [tickets]);

  // Calculate actual inventory count per section from tickets (inventory-driven availability)
  const { sectionInventoryMap, ticketInventoryMap } = useMemo(() => {
    const sectionMap = new Map<string, { count: number; minPrice: number }>();
    const inventoryMap = new Map<string, number>(); // section_id -> count for map component
    
    tickets.forEach((ticket: any) => {
      const sectionId = ticket.event_section?.section_id;
      if (sectionId) {
        const existing = sectionMap.get(sectionId) || { count: 0, minPrice: Infinity };
        const newCount = existing.count + (ticket.quantity || 1);
        sectionMap.set(sectionId, {
          count: newCount,
          minPrice: Math.min(existing.minPrice, Number(ticket.price) || Infinity),
        });
        inventoryMap.set(sectionId, newCount);
      }
    });
    return { sectionInventoryMap: sectionMap, ticketInventoryMap: inventoryMap };
  }, [tickets]);

  // Get sections from event sections with real inventory counts
  const sections = useMemo(() => {
    return eventSections.map((es: any) => es.section).filter(Boolean);
  }, [eventSections]);

  // Enhance event sections with real inventory data
  const enrichedEventSections = useMemo(() => {
    return eventSections.map((es: any) => {
      const inventoryData = sectionInventoryMap.get(es.section_id);
      const hasInventory = inventoryData && inventoryData.minPrice !== Infinity;
      return {
        ...es,
        available_count: inventoryData?.count || 0,
        price: hasInventory ? inventoryData.minPrice : es.price,
      };
    });
  }, [eventSections, sectionInventoryMap]);

  // Sort and filter listings
  const sortedListings = useMemo(() => {
    let filtered = listings.filter((l: any) => l.seats >= ticketCount);

    if (selectedSectionId) {
      filtered = filtered.filter((l: any) => l.sectionId === selectedSectionId);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [listings, sortBy, ticketCount, selectedSectionId]);

  const handleSelectListing = (listing: TicketListingItem) => {
    if (!event) return;
    
    const seats = Array.from({ length: listing.seats }, (_, i) => ({
      id: `${listing.id}-seat-${i}`,
      row: listing.row,
      number: i + 1,
      section: listing.section,
      price: listing.price,
      status: 'selected' as const,
    }));
    
    addToCart(event, seats);
    toast.success(`${listing.seats} ticket(s) added to cart!`);
    navigate('/cart');
  };

  const handleSectionClick = (sectionId: string) => {
    setSelectedSectionId((prev) => {
      const next = sectionId === prev ? null : sectionId;
      console.log('[EventDetail] handleSectionClick', { sectionId, prev, next });
      return next;
    });
  };

  const handleSectionHover = (section: any, eventSection?: any) => {
    if (section && eventSection) {
      setHoveredSection({
        name: section.name,
        available: eventSection.available_count,
        priceFrom: Number(eventSection.price),
      });
    } else {
      setHoveredSection(null);
    }
  };

  // Loading state
  if (loadingEvent) {
    return (
      <main className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="container mx-auto px-4 pb-12">
          <div className="flex gap-6">
            <div className="flex-1 max-w-2xl space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <div className="flex-1 max-w-xl">
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!event || !dbEvent) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event not found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const hasVenueMap = dbEvent.venue?.svg_map;

  return (
    <main className="pt-20 min-h-screen bg-background">
      {/* Header Banner */}
      <div className="bg-primary/10 border-b border-border py-2">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Secure resale marketplace. Ticket prices may be above or below face value.
        </div>
      </div>

      {/* Event Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-primary">{event.title}</h1>
              <HelpCircle size={16} className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{event.date}</span>
              </div>
              <span>·</span>
              <span>{event.time}</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{event.venue} · {event.city}, {event.state}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Left Side - Listings */}
          <div className="flex-1 max-w-2xl">
            {/* Filters Bar */}
            <div className="flex items-center justify-between mb-4 bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={14} />
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {ticketCount}
                  </span>
                </Button>
                {selectedSectionId && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSectionId(null)}>
                    <X size={14} className="mr-1" />
                    Clear filter
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {hasVenueMap && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showMap}
                      onCheckedChange={setShowMap}
                      id="show-map"
                    />
                    <label htmlFor="show-map" className="text-sm text-muted-foreground cursor-pointer">
                      Map
                    </label>
                  </div>
                )}
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-transparent border-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Urgency Banner */}
            {listings.length > 0 && (
              <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg py-3 mb-4">
                <Flame size={18} className="text-amber-500" />
                <span className="text-sm font-medium text-amber-500">
                  Tickets are selling fast! Secure yours now.
                </span>
              </div>
            )}

            {/* Ticket Listings */}
            {loadingTickets ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : sortedListings.length > 0 ? (
              <VirtualizedTicketList 
                listings={sortedListings}
                onSelect={handleSelectListing}
                pageSize={15}
              />
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">
                  {selectedSectionId 
                    ? 'No tickets available in this section. Try another section.' 
                    : 'No tickets available for this event yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Map */}
          {showMap && hasVenueMap && (
            <div className="flex-1 max-w-xl sticky top-24 self-start">
              {/* Section Tooltip */}
              {hoveredSection && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-card border border-border rounded-lg p-3 shadow-xl">
                  <p className="font-bold text-foreground">{hoveredSection.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {hoveredSection.available} available from ${hoveredSection.priceFrom}
                  </p>
                </div>
              )}

              {loadingSections ? (
                <Skeleton className="h-96 rounded-lg" />
              ) : (
                <DynamicVenueMap
                  svgMap={dbEvent.venue.svg_map}
                  viewBox={dbEvent.venue.map_viewbox}
                  sections={sections}
                  eventSections={enrichedEventSections}
                  selectedSectionId={selectedSectionId}
                  onSectionClick={handleSectionClick}
                  onSectionHover={handleSectionHover}
                  ticketInventory={ticketInventoryMap}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default EventDetail;
