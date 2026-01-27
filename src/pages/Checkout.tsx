import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    billingAddress: '',
    city: '',
    state: '',
    zip: '',
  });

  const serviceFee = getTotalPrice() * 0.15;
  const totalWithFees = getTotalPrice() + serviceFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    clearCart();
    toast.success('Order confirmed! Check your email for tickets.');
    navigate('/order-confirmation');
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <main className="pt-32 min-h-screen pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your tickets will be sent to this email address
              </p>
            </div>

            {/* Billing Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Billing Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
                <Input
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <Input
                name="billingAddress"
                placeholder="Billing address"
                value={formData.billingAddress}
                onChange={handleInputChange}
                required
                className="mt-4 bg-secondary border-border"
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
                <Input
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
                <Input
                  name="zip"
                  placeholder="ZIP"
                  value={formData.zip}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Payment</h2>
              </div>
              <Input
                name="cardNumber"
                placeholder="Card number"
                value={formData.cardNumber}
                onChange={handleInputChange}
                required
                className="bg-secondary border-border"
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  name="expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
                <Input
                  name="cvc"
                  placeholder="CVC"
                  value={formData.cvc}
                  onChange={handleInputChange}
                  required
                  className="bg-secondary border-border"
                />
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Lock size={14} />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-28">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.eventId} className="flex gap-3">
                    <img
                      src={item.event.image}
                      alt={item.event.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-foreground">{item.event.title}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} ticket{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      ${item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="text-foreground">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${totalWithFees.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full ticket-button py-6 text-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check size={20} />
                    Complete Purchase
                  </span>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By completing this purchase, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
