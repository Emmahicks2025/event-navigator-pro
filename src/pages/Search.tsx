import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useSearchEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults = [], isLoading } = useSearchEvents(debouncedQuery);

  return (
    <main className="pt-32 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-foreground text-center mb-6">
            Find Your Next Experience
          </h1>
          <div className="relative">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event, artist, team, or venue..."
              className="search-input pl-14 text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-muted-foreground mb-6">
            {isLoading ? 'Searching...' : (
              <>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} 
                {debouncedQuery && ` for "${debouncedQuery}"`}
              </>
            )}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {!isLoading && searchResults.length === 0 && debouncedQuery && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                No events found for "{debouncedQuery}"
              </p>
              <p className="text-muted-foreground">
                Try searching for something else or browse our categories
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Search;
