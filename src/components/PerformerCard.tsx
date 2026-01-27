import { Link } from 'react-router-dom';
import { Performer } from '@/types/event';

interface PerformerCardProps {
  performer: Performer;
}

export const PerformerCard = ({ performer }: PerformerCardProps) => {
  return (
    <Link
      to={`/performer/${performer.id}`}
      className="group flex flex-col items-center text-center"
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-3 ring-2 ring-border group-hover:ring-primary transition-all duration-300">
        <img
          src={performer.image}
          alt={performer.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
        {performer.name}
      </h3>
      <p className="text-sm text-muted-foreground">
        {performer.eventsCount} events
      </p>
    </Link>
  );
};
