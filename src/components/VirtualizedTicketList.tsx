import { useState, useEffect, useRef, useCallback, forwardRef, type MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Info, Loader2 } from 'lucide-react';

export interface TicketListingItem {
  id: string;
  /** Database section id (used for reliable filtering when a map section is clicked) */
  sectionId?: string;
  section: string;
  row: string;
  seats: number;
  price: number;
  isLowestPrice?: boolean;
  hasClearView?: boolean;
}

interface VirtualizedTicketListProps {
  listings: TicketListingItem[];
  onSelect: (listing: TicketListingItem) => void;
  pageSize?: number;
}

export const VirtualizedTicketList = forwardRef<HTMLDivElement, VirtualizedTicketListProps>(function VirtualizedTicketList(
  {
    listings,
    onSelect,
    pageSize = 15,
  }: VirtualizedTicketListProps,
  ref,
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (!ref) return;
      if (typeof ref === 'function') ref(node);
      else (ref as MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  const visibleListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + pageSize, listings.length));
      setIsLoading(false);
    }, 150);
  }, [isLoading, hasMore, pageSize, listings.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { 
        root: null, 
        rootMargin: '100px', 
        threshold: 0.1 
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Reset visible count when listings change
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [listings, pageSize]);

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">No tickets available.</p>
      </div>
    );
  }

  return (
    <div ref={setContainerRef} className="space-y-3">
      {visibleListings.map((listing) => (
        <div
          key={listing.id}
          className="flex items-center justify-between bg-card border-l-4 border-l-primary border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex-1">
            <h4 className="font-semibold text-foreground text-lg">
              {listing.section}
            </h4>
            <p className="text-sm text-muted-foreground">
              Row {listing.row} | {listing.seats} Ticket{listing.seats > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {listing.isLowestPrice && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded">
                  LOWEST PRICE IN SECTION
                </span>
              )}
              {listing.hasClearView && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Info size={12} />
                  Clear view
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xl font-bold text-foreground">${listing.price}</span>
              <span className="text-sm text-muted-foreground ml-1">ea</span>
            </div>
            <Button
              onClick={() => onSelect(listing)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Select
            </Button>
          </div>
        </div>
      ))}

      {/* Loading trigger / Load more section */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more tickets...</span>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadMore}
              className="text-muted-foreground"
            >
              Load {Math.min(pageSize, listings.length - visibleCount)} more of {listings.length - visibleCount} remaining
            </Button>
          )}
        </div>
      )}

      {/* Count indicator */}
      <div className="text-center text-xs text-muted-foreground py-2">
        Showing {visibleListings.length} of {listings.length} tickets
      </div>
    </div>
  );
});

export default VirtualizedTicketList;
