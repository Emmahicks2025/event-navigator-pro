import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { allEvents } from '@/data/mockData';
import { EventCard } from '@/components/EventCard';

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const searchResults = useMemo(() => {
    if (!query.trim()) return allEvents;

    const lowerQuery = query.toLowerCase();
    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.venue.toLowerCase().includes(lowerQuery) ||
        event.city.toLowerCase().includes(lowerQuery) ||
        event.category.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

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
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} 
            {query && ` for "${query}"`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {searchResults.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">
                No events found for "{query}"
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
