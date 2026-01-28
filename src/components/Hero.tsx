import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ChevronDown, Music, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-stadium.jpg';
import { cities } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  type: 'event' | 'performer' | 'venue';
  subtitle?: string;
  image?: string;
}

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Washington DC');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const [eventsRes, performersRes, venuesRes] = await Promise.all([
          supabase
            .from('events')
            .select('id, title, event_date, venue:venues(name, city)')
            .ilike('title', `%${searchQuery}%`)
            .eq('is_active', true)
            .limit(4),
          supabase
            .from('performers')
            .select('id, name, image_url, category:categories(name)')
            .ilike('name', `%${searchQuery}%`)
            .limit(4),
          supabase
            .from('venues')
            .select('id, name, city, state')
            .ilike('name', `%${searchQuery}%`)
            .limit(3),
        ]);

        const searchResults: SearchResult[] = [];

        performersRes.data?.forEach((p: any) => {
          searchResults.push({
            id: p.id,
            name: p.name,
            type: 'performer',
            subtitle: p.category?.name || 'Artist',
            image: p.image_url,
          });
        });

        eventsRes.data?.forEach((e: any) => {
          const date = new Date(e.event_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          searchResults.push({
            id: e.id,
            name: e.title,
            type: 'event',
            subtitle: `${date} • ${e.venue?.name || 'TBA'}`,
          });
        });

        venuesRes.data?.forEach((v: any) => {
          searchResults.push({
            id: v.id,
            name: v.name,
            type: 'venue',
            subtitle: `${v.city}${v.state ? `, ${v.state}` : ''}`,
          });
        });

        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setSearchQuery('');
    
    switch (result.type) {
      case 'event':
        navigate(`/event/${result.id}`);
        break;
      case 'performer':
        navigate(`/search?q=${encodeURIComponent(result.name)}`);
        break;
      case 'venue':
        navigate(`/search?venue=${encodeURIComponent(result.name)}`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Enter') return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex]);
        } else if (searchQuery.length >= 2) {
          navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'performer':
        return <Music className="w-5 h-5 text-primary" />;
      case 'venue':
        return <MapPin className="w-5 h-5 text-muted-foreground" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'performer':
        return 'Artists & Teams';
      case 'venue':
        return 'Venues';
      case 'event':
        return 'Events';
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeOrder: SearchResult['type'][] = ['performer', 'event', 'venue'];

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Stadium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="absolute inset-0 bg-hero-pattern" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 glow-text animate-fade-in">
          Your Universe of Live Events
        </h1>

        {/* Search Bar with Autocomplete */}
        <div className="max-w-2xl mx-auto animate-slide-up relative">
          <div className="relative flex items-center bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden shadow-glow">
            <Search className="absolute left-5 text-muted-foreground" size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by team, artist, event or venue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && results.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full py-5 pl-14 pr-12 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setResults([]);
                  setIsOpen(false);
                }}
                className="absolute right-5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
            >
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : (
                <>
                  {typeOrder.map((type) => {
                    const items = groupedResults[type];
                    if (!items?.length) return null;

                    return (
                      <div key={type}>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/50">
                          {getTypeLabel(type)}
                        </div>
                        {items.map((result) => {
                          const globalIndex = results.indexOf(result);
                          return (
                            <button
                              key={`${result.type}-${result.id}`}
                              onClick={() => handleSelect(result)}
                              className={cn(
                                'w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors',
                                globalIndex === activeIndex && 'bg-muted/50'
                              )}
                            >
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                {result.image ? (
                                  <img
                                    src={result.image}
                                    alt={result.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  getIcon(result.type)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground truncate text-base">
                                  {result.name}
                                </div>
                                {result.subtitle && (
                                  <div className="text-sm text-muted-foreground truncate">
                                    {result.subtitle}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-muted/50 transition-colors border-t border-border"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* City Selector */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative inline-block">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin size={18} className="text-primary" />
              <span>Top Events in</span>
              <span className="text-primary font-semibold">{selectedCity}</span>
              <ChevronDown size={18} className={`transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCityDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-20">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-secondary transition-colors ${
                      selectedCity === city ? 'text-primary bg-secondary' : 'text-foreground'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
