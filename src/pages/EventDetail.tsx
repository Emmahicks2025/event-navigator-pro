import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, HelpCircle, Filter, X, Flame } from 'lucide-react';
import { allEvents } from '@/data/mockData';
import { VenueMap, sections, Section } from '@/components/VenueMap';
import { PinnacleBankArenaMap, pinnacleSections } from '@/components/PinnacleBankArenaMap';
import { TicketListing, TicketListingItem } from '@/components/TicketListing';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Generate mock ticket listings
const generateListings = (): TicketListingItem[] => {
  const listings: TicketListingItem[] = [];
  const sectionNames = [
    'Upper Concourse 202', 'Upper Concourse 201', 'Upper Concourse 306',
    'Upper Concourse 312', 'Upper Concourse 302', 'Lower Level 112',
    'Lower Level 113', 'Lower Level 106', 'Floor A', 'Floor B', 'GA Pit'
  ];
  
  sectionNames.forEach((section, index) => {
    const numListings = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numListings; i++) {
      const isFloor = section.includes('Floor') || section.includes('GA');
      const isLower = section.includes('Lower');
      const basePrice = isFloor ? 250 : isLower ? 150 : 100;
      
      listings.push({
        id: `listing-${index}-${i}`,
        section,
        row: `${Math.floor(Math.random() * 15) + 1}`,
        seats: Math.floor(Math.random() * 4) + 1,
        price: basePrice + Math.floor(Math.random() * 50),
        isLowestPrice: i === 0 && Math.random() > 0.5,
        hasClearView: Math.random() > 0.7,
      });
    }
  });
  
  return listings.sort((a, b) => a.price - b.price);
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<Section | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [sortBy, setSortBy] = useState('price-low');
  const [ticketCount, setTicketCount] = useState(1);
  const [listings] = useState<TicketListingItem[]>(() => generateListings());

  const event = allEvents.find((e) => e.id === id);
  
  // Determine which venue map to use
  const isPinnacleArena = event?.venue === 'Pinnacle Bank Arena';
  const currentSections = isPinnacleArena ? pinnacleSections : sections;

  if (!event) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Event not found</h1>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const sortedListings = useMemo(() => {
    const filtered = listings.filter(l => l.seats >= ticketCount);
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [listings, sortBy, ticketCount]);

  const handleSelectListing = (listing: TicketListingItem) => {
    // Create seats from listing
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
    setSelectedSection(sectionId === selectedSection ? null : sectionId);
  };

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
                <Button variant="ghost" size="sm">
                  <X size={14} />
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
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
            <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg py-3 mb-4">
              <Flame size={18} className="text-amber-500" />
              <span className="text-sm font-medium text-amber-500">
                Tickets are selling fast! Secure yours now.
              </span>
            </div>

            {/* Ticket Listings */}
            <TicketListing 
              listings={sortedListings}
              onSelect={handleSelectListing}
            />
          </div>

          {/* Right Side - Map */}
          {showMap && (
            <div className="flex-1 max-w-xl sticky top-24 self-start">
              {/* Find Tickets Timer */}
              <div className="flex items-center justify-center gap-2 mb-4 bg-card rounded-lg p-3 border border-border">
                <span className="text-sm text-muted-foreground">Find Tickets</span>
                <HelpCircle size={14} className="text-muted-foreground" />
                <span className="text-2xl font-bold text-primary ml-2">06:40</span>
              </div>

              {/* Section Tooltip */}
              {hoveredSection && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-card border border-border rounded-lg p-3 shadow-xl">
                  <p className="font-bold text-foreground">{hoveredSection.available} listings</p>
                  <p className="text-sm text-muted-foreground">From ${hoveredSection.priceFrom}</p>
                </div>
              )}

              {/* Venue Map - Choose based on venue */}
              {isPinnacleArena ? (
                <PinnacleBankArenaMap
                  onSectionHover={setHoveredSection}
                  onSectionClick={handleSectionClick}
                  selectedSection={selectedSection}
                />
              ) : (
                <VenueMap
                  onSectionHover={setHoveredSection}
                  onSectionClick={handleSectionClick}
                  selectedSection={selectedSection}
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
