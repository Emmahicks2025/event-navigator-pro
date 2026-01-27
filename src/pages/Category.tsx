import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, SortAsc } from 'lucide-react';
import { useEventsByCategory } from '@/hooks/useEvents';
import { useCategory } from '@/hooks/useCategories';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Category = () => {
  const { slug } = useParams();
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [showFilters, setShowFilters] = useState(false);

  const { data: category } = useCategory(slug);
  const { data: events = [], isLoading } = useEventsByCategory(slug || '');

  const categoryName = category?.name || slug?.charAt(0).toUpperCase() + slug?.slice(1);
  const categoryIcon = category?.icon || '🎫';

  const sortedEvents = useMemo(() => {
    let sorted = [...events];

    if (sortBy === 'price') {
      sorted = sorted.sort((a, b) => a.priceFrom - b.priceFrom);
    } else {
      sorted = sorted.sort((a, b) => {
        if (a.date === 'TBD') return 1;
        if (b.date === 'TBD') return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }

    return sorted;
  }, [events, sortBy]);

  return (
    <main className="pt-32 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {categoryIcon} {categoryName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? 'Loading...' : `${sortedEvents.length} events found`}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === 'date' ? 'price' : 'date')}
              className="flex items-center gap-2"
            >
              <SortAsc size={16} />
              Sort by {sortBy === 'date' ? 'Date' : 'Price'}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-slide-up">
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
                <select className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground">
                  <option>All Locations</option>
                  <option>New York</option>
                  <option>Los Angeles</option>
                  <option>Chicago</option>
                  <option>Washington DC</option>
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
            <p className="text-muted-foreground text-lg">No events found in this category</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Category;
