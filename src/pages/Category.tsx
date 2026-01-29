import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, SortAsc, X, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEventsByCategory } from '@/hooks/useEvents';
import { useCategory } from '@/hooks/useCategories';
import { useUserLocation, getDistanceToCity } from '@/hooks/useUserLocation';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// FIFA World Cup 2026 participating countries
const FIFA_COUNTRIES = [
  'USA', 'Mexico', 'Canada', // Host nations
  'Argentina', 'Brazil', 'England', 'France', 'Germany', 'Spain', 'Portugal',
  'Netherlands', 'Belgium', 'Croatia', 'Morocco', 'Japan', 'Australia',
  'Ghana', 'Senegal', 'Colombia', 'Uruguay', 'Ecuador', 'South Korea',
  'Italy', 'Poland', 'Denmark', 'Switzerland', 'Serbia', 'Cameroon'
];

// Extract countries from event title
function extractCountriesFromTitle(title: string): string[] {
  const countries: string[] = [];
  const upperTitle = title.toUpperCase();
  
  for (const country of FIFA_COUNTRIES) {
    if (upperTitle.includes(country.toUpperCase())) {
      countries.push(country);
    }
  }
  
  return countries;
}

const Category = () => {
  const { slug } = useParams();
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'distance'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const { data: category } = useCategory(slug);
  const { data: events = [], isLoading } = useEventsByCategory(slug || '');
  const { data: userLocation, isLoading: loadingLocation } = useUserLocation();

  // Fetch unique cities from events
  const { data: availableCities = [] } = useQuery({
    queryKey: ['event-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('venues!inner(city)')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const cities = new Set<string>();
      data?.forEach((event: any) => {
        if (event.venues?.city) {
          cities.add(event.venues.city);
        }
      });
      
      return Array.from(cities).sort();
    }
  });

  const categoryName = category?.name || slug?.charAt(0).toUpperCase() + slug?.slice(1);
  const categoryIcon = category?.icon || '🎫';
  const isFifaWorldCup = slug === 'fifa-world-cup-2026';

  // Get countries that appear in current events
  const availableCountries = useMemo(() => {
    if (!isFifaWorldCup) return [];
    
    const countriesSet = new Set<string>();
    events.forEach(event => {
      const countries = extractCountriesFromTitle(event.title);
      countries.forEach(c => countriesSet.add(c));
    });
    
    return Array.from(countriesSet).sort();
  }, [events, isFifaWorldCup]);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const clearCountryFilters = () => {
    setSelectedCountries([]);
  };

  // Pre-calculate distances for all events
  const eventsWithDistance = useMemo(() => {
    if (!userLocation?.latitude || !userLocation?.longitude) {
      return events.map(event => ({ ...event, distance: null }));
    }
    
    return events.map(event => {
      const distance = getDistanceToCity(
        userLocation.latitude,
        userLocation.longitude,
        event.city
      );
      return { ...event, distance };
    });
  }, [events, userLocation]);

  const sortedEvents = useMemo(() => {
    let filtered = [...eventsWithDistance];

    // Filter by selected countries for FIFA World Cup
    if (isFifaWorldCup && selectedCountries.length > 0) {
      filtered = filtered.filter(event => {
        const eventCountries = extractCountriesFromTitle(event.title);
        return selectedCountries.some(c => eventCountries.includes(c));
      });
    }

    // Filter by selected city
    if (selectedCity) {
      filtered = filtered.filter(event => event.city === selectedCity);
    }

    // Sort
    if (sortBy === 'price') {
      filtered = filtered.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (sortBy === 'distance' && userLocation) {
      // Sort by distance first (closest first), then by date for same distance
      filtered = filtered.sort((a, b) => {
        const distA = a.distance ?? 10000;
        const distB = b.distance ?? 10000;
        if (distA !== distB) return distA - distB;
        // Secondary sort by date
        if (a.date === 'TBD') return 1;
        if (b.date === 'TBD') return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    } else {
      // Default to date sort
      filtered = filtered.sort((a, b) => {
        if (a.date === 'TBD') return 1;
        if (b.date === 'TBD') return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }

    return filtered;
  }, [eventsWithDistance, sortBy, selectedCountries, isFifaWorldCup, selectedCity, userLocation]);

  return (
    <main className="pt-32 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {categoryIcon} {categoryName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {userLocation && !loadingLocation && (
                <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <MapPin size={12} />
                  <span>Near {userLocation.city}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
              {selectedCountries.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCountries.length}
                </Badge>
              )}
            </Button>
            
            {/* Sort buttons */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={sortBy === 'distance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('distance')}
                className="rounded-none border-0"
                disabled={!userLocation}
              >
                <MapPin size={14} className="mr-1" />
                Nearest
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('date')}
                className="rounded-none border-0 border-l border-border"
              >
                Date
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('price')}
                className="rounded-none border-0 border-l border-border"
              >
                Price
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-slide-up">
            {/* Country Filter for FIFA World Cup */}
            {isFifaWorldCup && availableCountries.length > 0 && (
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Filter by Country</label>
                  {selectedCountries.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearCountryFilters}
                      className="text-xs text-muted-foreground hover:text-foreground h-auto py-1"
                    >
                      <X size={14} className="mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCountries.map((country) => (
                    <Badge
                      key={country}
                      variant={selectedCountries.includes(country) ? "default" : "outline"}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        selectedCountries.includes(country) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => toggleCountry(country)}
                    >
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Date Range
                </label>
                <select className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground">
                  <option>All Dates</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Next 3 Months</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Price Range
                </label>
                <select className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground">
                  <option>All Prices</option>
                  <option>Under $50</option>
                  <option>$50 - $100</option>
                  <option>$100 - $250</option>
                  <option>$250+</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Location
                </label>
                <select 
                  className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full ticket-button">Apply Filters</Button>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!isLoading && sortedEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {selectedCountries.length > 0 
                ? 'No events found for selected countries' 
                : 'No events found in this category'}
            </p>
            {selectedCountries.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearCountryFilters}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Category;
