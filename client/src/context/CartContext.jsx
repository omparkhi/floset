import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

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
  const [isCartHydrated, setIsCartHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setIsCartHydrated(false);
      try {
        localStorage.removeItem('floset_cart');
      } catch {
        // ignore
      }
    } else {
      let active = true;
      api.cart.get()
        .then(({ items }) => {
          if (!active || !items?.length) return;
          setCartItems(items.map((item) => ({
            ...item,
            product: {
              _id: item.productId,
              productId: item.productCode,
              name: item.productName,
              images: item.image ? [item.image] : [],
              image: item.image
            },
            duration: item.rentalDuration,
            securityDeposit: 0,
            type: item.type
          })));
        })
        .catch(() => {})
        .finally(() => {
          if (active) setIsCartHydrated(true);
        });
      return () => { active = false; };
    }
  }, [user]);

  useEffect(() => {
    if (!user || !isCartHydrated) return;
    localStorage.setItem('floset_cart', JSON.stringify(cartItems));
    api.cart.save(cartItems.map((item) => ({
      productId: item.product?._id,
      productCode: item.product?.productId,
      productName: item.product?.name,
      image: item.product?.images?.[0] || item.product?.image || '',
      rentalPrice: item.rentalPrice,
      quantity: item.quantity || 1,
      type: item.type === 'BOOKING' ? 'BOOKING' : 'ORDER',
      startDate: item.startDate,
      endDate: item.endDate,
      rentalDuration: item.duration,
      storeId: item.product?.ownerId || null
    }))).catch(() => {});
  }, [cartItems, user, isCartHydrated]);

  const addToCart = (rentalItem) => {
    const itemId = rentalItem.product?._id || rentalItem.product?.productId;
    setCartItems((items) => {
      const existingIndex = items.findIndex((item) =>
        (item.product?._id || item.product?.productId) === itemId &&
        item.type === rentalItem.type &&
        item.startDate === rentalItem.startDate &&
        item.endDate === rentalItem.endDate &&
        item.duration === rentalItem.duration
      );
      if (existingIndex === -1) return [...items, { ...rentalItem, quantity: rentalItem.quantity || 1 }];
      return items.map((item, index) => index === existingIndex
        ? { ...item, quantity: (item.quantity || 1) + (rentalItem.quantity || 1) }
        : item);
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemIndex) => {
    if (itemIndex === undefined) {
      setCartItems([]);
      return;
    }
    setCartItems((items) => items.filter((_, index) => index !== itemIndex));
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) api.cart.clear().catch(() => {});
    try {
      localStorage.removeItem('floset_cart');
    } catch {
      // ignore
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalRentalPrice = cartItems.reduce((sum, item) => sum + (item.rentalPrice || 0) * (item.quantity || 1), 0);
  const totalDeposit = cartItems.reduce((sum, item) => sum + (item.securityDeposit || 0) * (item.quantity || 1), 0);
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
