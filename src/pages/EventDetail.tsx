import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Share2, Heart, ChevronLeft } from 'lucide-react';
import { allEvents } from '@/data/mockData';
import { SeatMap } from '@/components/SeatMap';
import { useCart } from '@/context/CartContext';
import { Seat } from '@/types/event';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const event = allEvents.find((e) => e.id === id);

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

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    addToCart(event, selectedSeats);
    toast.success(`${selectedSeats.length} ticket(s) added to cart!`);
    navigate('/cart');
  };

  return (
    <main className="pt-24 min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Actions */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked ? 'bg-destructive text-destructive-foreground' : 'bg-background/80 hover:bg-background'
            }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl p-6 border border-border mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-3 capitalize">
                    {event.category}
                  </span>
                  <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <span>{event.venue}, {event.city}, {event.state}</span>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Experience an unforgettable night with {event.title} at {event.venue}. 
                  This event promises to be one of the most exciting performances of the year, 
                  featuring world-class entertainment in an incredible venue atmosphere.
                  Don't miss your chance to be part of this amazing experience!
                </p>
              </div>
            </div>

            {/* Seat Map */}
            <SeatMap eventId={event.id} onSeatsSelected={setSelectedSeats} />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-28">
              <h3 className="text-lg font-semibold text-foreground mb-4">Ticket Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Range</span>
                  <span className="text-foreground font-medium">
                    ${event.priceFrom} - ${event.priceTo}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats Selected</span>
                  <span className="text-foreground font-medium">{selectedSeats.length}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between text-sm border-t border-border pt-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-primary font-bold text-lg">
                      ${selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={selectedSeats.length === 0}
                className="w-full ticket-button py-6 text-lg"
              >
                {selectedSeats.length > 0 ? 'Add to Cart' : 'Select Seats'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                All sales are final. Tickets are transferable.
              </p>

              {/* Venue Info */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Venue</h4>
                <p className="text-sm text-muted-foreground">{event.venue}</p>
                <p className="text-sm text-muted-foreground">{event.city}, {event.state}</p>
                <button className="text-sm text-primary hover:underline mt-2">
                  View Venue Map →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EventDetail;
