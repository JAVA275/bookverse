import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BookFormat, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (book: Book, format: BookFormat) => void;
  removeFromCart: (bookId: string, format: BookFormat) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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
    const unitPrice =
      format === 'ebook'
        ? book.priceEbook
        : format === 'physical'
        ? book.pricePhysical
        : book.priceAudio;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id && item.format === format);
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id && item.format === format
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { book, format, quantity: 1, unitPrice }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (bookId: string, format: BookFormat) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.book.id === bookId && item.format === format))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

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
