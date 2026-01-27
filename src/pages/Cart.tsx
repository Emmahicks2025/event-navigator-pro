import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { cartItems, removeFromCart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <main className="pt-32 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag size={40} className="text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any tickets yet. Browse our events to find your next experience!
            </p>
            <Button onClick={() => navigate('/')} className="ticket-button">
              Browse Events
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const serviceFee = getTotalPrice() * 0.15;
  const totalWithFees = getTotalPrice() + serviceFee;

  return (
    <main className="pt-32 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.eventId}
                className="bg-card rounded-xl border border-border p-4 flex gap-4"
              >
                <img
                  src={item.event.image}
                  alt={item.event.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.event.venue} • {item.event.date}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.eventId)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} ticket{item.quantity > 1 ? 's' : ''}: {' '}
                      {item.seats.map((s) => `${s.section} ${s.row}${s.number}`).join(', ')}
                    </p>
                    <p className="text-lg font-bold text-primary mt-1">
                      ${item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-28">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="text-foreground">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-4">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${totalWithFees.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full ticket-button py-6 text-lg flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight size={20} />
              </Button>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield size={14} className="text-success" />
                <span>Protected by 100% Buyer Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
