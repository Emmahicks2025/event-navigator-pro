import { Hero } from '@/components/Hero';
import { EventsCarousel } from '@/components/EventsCarousel';
import { PerformersSection } from '@/components/PerformersSection';
import { featuredEvents, allEvents, categories } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, CreditCard } from 'lucide-react';

const Index = () => {
  const concertEvents = allEvents.filter((e) => e.category === 'concerts');
  const sportsEvents = allEvents.filter((e) => e.category === 'sports');

  return (
    <main className="pt-24">
      <Hero />
      
      {/* Featured Events */}
      <EventsCarousel
        events={featuredEvents}
        title="Top Events"
        subtitle="The hottest tickets in your area"
      />

      {/* Category Browse */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover-lift"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.count.toLocaleString()} events
                </p>
                <ArrowRight className="mt-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" size={20} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Performers Section */}
      <PerformersSection />

      {/* Concert Events */}
      <EventsCarousel
        events={concertEvents}
        title="Upcoming Concerts"
        subtitle="Don't miss your favorite artists live"
      />

      {/* Sports Events */}
      <EventsCarousel
        events={sportsEvents}
        title="Sports Events"
        subtitle="Experience the thrill of live sports"
      />

      {/* Trust Badges */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6">
              <div className="p-4 rounded-full bg-success/10 text-success">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">100% Buyer Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  Valid tickets or your money back
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Clock size={32} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">On-Time Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Tickets delivered before the event
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6">
              <div className="p-4 rounded-full bg-info/10 text-info">
                <CreditCard size={32} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Secure Checkout</h3>
                <p className="text-sm text-muted-foreground">
                  Your information is safe with us
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Never Miss a Show
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Subscribe to get exclusive presale access, deals, and updates on your favorite artists.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 search-input"
            />
            <button type="submit" className="ticket-button">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Index;
