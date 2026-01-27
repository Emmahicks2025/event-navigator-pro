import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';

const cities = [
  { name: 'Atlanta', slug: 'atlanta' },
  { name: 'Boston', slug: 'boston' },
  { name: 'Chicago', slug: 'chicago' },
  { name: 'Dallas', slug: 'dallas' },
  { name: 'Denver', slug: 'denver' },
  { name: 'Detroit', slug: 'detroit' },
  { name: 'Houston', slug: 'houston' },
  { name: 'Las Vegas', slug: 'las-vegas' },
  { name: 'Los Angeles', slug: 'los-angeles' },
  { name: 'Miami', slug: 'miami' },
  { name: 'New York City', slug: 'new-york' },
  { name: 'Philadelphia', slug: 'philadelphia' },
  { name: 'Phoenix', slug: 'phoenix' },
  { name: 'San Francisco', slug: 'san-francisco' },
  { name: 'Seattle', slug: 'seattle' },
  { name: 'Tampa Bay', slug: 'tampa-bay' },
  { name: 'Toronto', slug: 'toronto' },
  { name: 'Washington DC', slug: 'washington-dc' },
];

const Cities = () => {
  return (
    <main className="pt-28 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MapPin className="text-primary" size={32} />
            Browse Events by City
          </h1>
          <p className="text-muted-foreground mt-2">
            Find the best events happening in cities across the country
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to={`/search?city=${encodeURIComponent(city.name)}`}
              className="group flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {city.name}
              </span>
              <ChevronRight 
                size={18} 
                className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" 
              />
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Can't find your city?
          </h2>
          <p className="text-muted-foreground">
            We're constantly expanding our coverage. Use our{' '}
            <Link to="/search" className="text-primary hover:underline">
              search feature
            </Link>{' '}
            to find events in any location, or{' '}
            <Link to="/sell" className="text-primary hover:underline">
              list your tickets
            </Link>{' '}
            if you have tickets to sell.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Cities;