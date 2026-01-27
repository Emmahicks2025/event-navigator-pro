import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Event, Seat } from '@/types/event';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (event: Event, seats: Seat[]) => void;
  removeFromCart: (eventId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (event: Event, seats: Seat[]) => {
    const existingItem = cartItems.find((item) => item.eventId === event.id);
    const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.eventId === event.id
            ? {
                ...item,
                seats: [...item.seats, ...seats],
                quantity: item.quantity + seats.length,
                totalPrice: item.totalPrice + totalPrice,
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          eventId: event.id,
          event,
          seats,
          quantity: seats.length,
          totalPrice,
        },
      ]);
    }
  };

  const removeFromCart = (eventId: string) => {
    setCartItems(cartItems.filter((item) => item.eventId !== eventId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
