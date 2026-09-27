import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('floset_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      try {
        localStorage.removeItem('floset_cart');
      } catch {
        // ignore
      }
    } else {
      localStorage.setItem('floset_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = (rentalItem) => {
    // rentalItem contains { product, duration, startDate, endDate, rentalPrice, securityDeposit }
    setCartItems([rentalItem]); // Focus on 1 occasion booking at a time for clarity
    setIsCartOpen(true);
  };

  const removeFromCart = () => {
    setCartItems([]);
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('floset_cart');
    } catch {
      // ignore
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalRentalPrice = cartItems.reduce((sum, item) => sum + (item.rentalPrice || 0), 0);
  const totalDeposit = cartItems.reduce((sum, item) => sum + (item.securityDeposit || 0), 0);
  const grandTotal = totalRentalPrice + totalDeposit;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        clearCart,
        totalRentalPrice,
        totalDeposit,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
