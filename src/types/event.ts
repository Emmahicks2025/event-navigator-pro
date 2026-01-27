export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
  category: 'concerts' | 'sports' | 'theater' | 'comedy';
  image: string;
  priceFrom: number;
  priceTo: number;
  description?: string;
  isFeatured?: boolean;
}

export interface Performer {
  id: string;
  name: string;
  image: string;
  category: 'concerts' | 'sports' | 'theater' | 'comedy';
  eventsCount: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  image?: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
  status: 'available' | 'selected' | 'unavailable';
}

export interface CartItem {
  eventId: string;
  event: Event;
  seats: Seat[];
  quantity: number;
  totalPrice: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}
