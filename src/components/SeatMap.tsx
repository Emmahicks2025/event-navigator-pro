import { useState } from 'react';
import { Seat } from '@/types/event';

interface SeatMapProps {
  eventId: string;
  onSeatsSelected: (seats: Seat[]) => void;
}

const generateSeats = (): Seat[] => {
  const sections = ['Floor', 'Lower', 'Upper'];
  const seats: Seat[] = [];
  let id = 1;

  sections.forEach((section, sectionIndex) => {
    const rows = section === 'Floor' ? 5 : section === 'Lower' ? 8 : 6;
    const seatsPerRow = section === 'Floor' ? 10 : 15;
    const basePrice = section === 'Floor' ? 250 : section === 'Lower' ? 150 : 75;

    for (let r = 0; r < rows; r++) {
      for (let s = 1; s <= seatsPerRow; s++) {
        const isUnavailable = Math.random() < 0.3;
        seats.push({
          id: `${id++}`,
          row: String.fromCharCode(65 + r),
          number: s,
          section,
          price: basePrice + Math.floor(Math.random() * 50),
          status: isUnavailable ? 'unavailable' : 'available',
        });
      }
    }
  });

  return seats;
};

export const SeatMap = ({ eventId, onSeatsSelected }: SeatMapProps) => {
  const [seats] = useState<Seat[]>(() => generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [activeSection, setActiveSection] = useState<string>('Floor');

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'unavailable') return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    
    if (isSelected) {
      const newSelection = selectedSeats.filter((s) => s.id !== seat.id);
      setSelectedSeats(newSelection);
      onSeatsSelected(newSelection);
    } else {
      const newSelection = [...selectedSeats, { ...seat, status: 'selected' as const }];
      setSelectedSeats(newSelection);
      onSeatsSelected(newSelection);
    }
  };

  const sections = ['Floor', 'Lower', 'Upper'];
  const filteredSeats = seats.filter((s) => s.section === activeSection);
  
  const seatsByRow = filteredSeats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-xl font-bold text-foreground mb-6">Select Your Seats</h3>

      {/* Stage */}
      <div className="w-full bg-primary/20 text-center py-4 rounded-lg mb-8 border border-primary/30">
        <span className="text-primary font-semibold">STAGE</span>
      </div>

      {/* Section Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeSection === section
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="seat-available" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-selected" />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-unavailable" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-1">
            <span className="w-6 text-xs text-muted-foreground text-right">{row}</span>
            <div className="flex gap-1">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.some((s) => s.id === seat.id);
                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'unavailable'}
                    className={`w-6 h-6 rounded-sm text-[10px] font-medium transition-all ${
                      seat.status === 'unavailable'
                        ? 'seat-unavailable'
                        : isSelected
                        ? 'seat-selected'
                        : 'seat-available hover:ring-2 hover:ring-primary'
                    }`}
                    title={`Row ${seat.row}, Seat ${seat.number} - $${seat.price}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-xs text-muted-foreground">{row}</span>
          </div>
        ))}
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-foreground">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedSeats.map((s) => `${s.section} ${s.row}${s.number}`).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">
                ${selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
