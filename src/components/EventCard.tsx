import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact';
}

export const EventCard = ({ event, variant = 'default' }: EventCardProps) => {
  const formatDate = (dateStr: string) => {
    if (dateStr === 'TBD') return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  };

  if (variant === 'compact') {
    return (
      <Link to={`/event/${event.id}`} className="flex gap-4 p-4 bg-card rounded-lg hover:bg-secondary/50 transition-colors group">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-1 left-1 bg-background/90 px-2 py-0.5 rounded text-xs font-semibold">
            {formatDate(event.date)}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin size={12} />
            {event.city}, {event.state}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock size={12} />
            {event.time}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/event/${event.id}`} className="event-card group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="event-card-overlay" />
        
        {/* Date Badge */}
        <div className="date-badge">
          {formatDate(event.date)}
        </div>

        {/* View Tickets Button */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="ticket-button">
            View Tickets
          </span>
        </div>
      </div>

      {/* Event Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{event.city}, {event.state}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{event.date === 'TBD' ? 'TBD' : `${event.date.split(',')[0]}, ${event.time}`}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          From <span className="text-primary font-semibold">${event.priceFrom}</span>
        </p>
      </div>
    </Link>
  );
};
