import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { name: 'FIFA World Cup 2026', href: '/category/fifa-world-cup-2026', highlight: true },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Concert', href: '/category/concerts' },
  { name: 'Theater', href: '/category/theater' },
  { name: 'Cities', href: '/cities' },
  { name: 'Sell Tickets', href: '/sell' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartItems } = useCart();
  const { user, isAdmin, signOut, loading } = useAuth();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      {/* Top bar */}
      <div className="bg-primary/10 py-1.5 text-center text-sm text-muted-foreground">
        Secure resale marketplace. Ticket prices may be above or below face value.
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-primary">Tix</span>
            <span className="text-2xl font-bold text-foreground">Orbit</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`nav-link ${location.pathname === link.href ? 'nav-link-active' : ''} ${
                  link.highlight 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-md' 
                    : ''
                }`}
              >
                {link.highlight && '⚽ '}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link to="/support" className="hidden md:block nav-link">
              Support
            </Link>

            <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="p-2 text-primary hover:text-primary/80 transition-colors"
                        title="Admin Dashboard"
                      >
                        <Shield size={20} />
                      </Link>
                    )}
                    <Link to="/account" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <User size={20} />
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Sign Out"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <Link to="/auth" className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                    <LogIn size={20} />
                    <span className="hidden md:inline text-sm font-medium">Sign In</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-up">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`nav-link text-lg py-2 ${
                  link.highlight 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-semibold inline-flex items-center gap-2' 
                    : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.highlight && '⚽ '}
                {link.name}
              </Link>
            ))}
            <Link
              to="/support"
              className="nav-link text-lg py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
