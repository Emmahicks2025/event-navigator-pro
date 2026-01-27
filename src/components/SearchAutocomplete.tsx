import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, MapPin, Users, Calendar, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  type: 'event' | 'performer' | 'venue';
  subtitle?: string;
  image?: string;
}

export const SearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Search events, performers, and venues in parallel
        const [eventsRes, performersRes, venuesRes] = await Promise.all([
          supabase
            .from('events')
            .select('id, title, event_date, venue:venues(name, city)')
            .ilike('title', `%${query}%`)
            .eq('is_active', true)
            .limit(5),
          supabase
            .from('performers')
            .select('id, name, image_url, category:categories(name)')
            .ilike('name', `%${query}%`)
            .limit(5),
          supabase
            .from('venues')
            .select('id, name, city, state')
            .ilike('name', `%${query}%`)
            .limit(5),
        ]);

        const searchResults: SearchResult[] = [];

        // Add performers
        performersRes.data?.forEach((p: any) => {
          searchResults.push({
            id: p.id,
            name: p.name,
            type: 'performer',
            subtitle: p.category?.name || 'Artist',
            image: p.image_url,
          });
        });

        // Add events
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

        // Add venues
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
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
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
    if (!isOpen) return;

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
        } else if (query.length >= 2) {
          navigate(`/search?q=${encodeURIComponent(query)}`);
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
        return <Music className="w-4 h-4 text-primary" />;
      case 'venue':
        return <MapPin className="w-4 h-4 text-muted-foreground" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'performer':
        return 'Artist / Team';
      case 'venue':
        return 'Venue';
      case 'event':
        return 'Event';
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeOrder: SearchResult['type'][] = ['performer', 'event', 'venue'];

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search events, artists, venues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 bg-card/50 border-border/50 focus:border-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
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
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                      {getTypeLabel(type)}s
                    </div>
                    {items.map((result) => {
                      const globalIndex = results.indexOf(result);
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors',
                            globalIndex === activeIndex && 'bg-muted/50'
                          )}
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                            <div className="font-medium text-foreground truncate">
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

              {/* View all results */}
              <button
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-sm text-primary hover:bg-muted/50 transition-colors border-t border-border"
              >
                View all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
