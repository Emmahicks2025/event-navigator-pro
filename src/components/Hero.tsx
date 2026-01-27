import { useState } from 'react';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/hero-stadium.jpg';
import { cities } from '@/data/mockData';

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Washington DC');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Stadium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        <div className="absolute inset-0 bg-hero-pattern" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text animate-fade-in">
          Go See It Live
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-slide-up">
          <div className="relative flex items-center bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 overflow-hidden shadow-glow">
            <Search className="absolute left-5 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by team, artist, event or venue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-5 pl-14 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
            />
          </div>
        </form>

        {/* City Selector */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative inline-block">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin size={18} className="text-primary" />
              <span>Top Events in</span>
              <span className="text-primary font-semibold">{selectedCity}</span>
              <ChevronDown size={18} className={`transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showCityDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-20">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-secondary transition-colors ${
                      selectedCity === city ? 'text-primary bg-secondary' : 'text-foreground'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
