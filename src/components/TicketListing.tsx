import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

export interface TicketListingItem {
  id: string;
  section: string;
  row: string;
  seats: number;
  price: number;
  isLowestPrice?: boolean;
  hasClearView?: boolean;
}

interface TicketListingProps {
  listings: TicketListingItem[];
  onSelect: (listing: TicketListingItem) => void;
}

export const TicketListing = ({ listings, onSelect }: TicketListingProps) => {
  return (
    <div className="space-y-3">
      {listings.map((listing) => (
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
    </div>
  );
};
