import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BookFormat, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (book: Book, format: BookFormat) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function priceForFormat(book: Book, format: BookFormat): number {
  if (format === 'physical') return book.pricePhysical;
  if (format === 'audio') return book.priceAudio;
  return book.priceEbook;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bookverse_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('bookverse_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book: Book, format: BookFormat) => {
    const id = `${book.id}_${format}`;
    const price = priceForFormat(book, format);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { id, book, format, price, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
