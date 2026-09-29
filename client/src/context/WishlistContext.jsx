import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, openAuth } = useAuth();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('floset_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('floset_wishlist', JSON.stringify(wishlist));
      } catch {
        // ignore
      }
    }
  }, [wishlist, user]);

  useEffect(() => {
    if (!user) {
      setWishlist((prev) => (prev.length > 0 ? [] : prev));
      try {
        localStorage.removeItem('floset_wishlist');
      } catch {
        // ignore
      }
    }
  }, [user]);

  const isInWishlist = (id) => {
    if (!id || !user) return false;
    return wishlist.some((item) => (item._id || item.productId) === id);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      if (openAuth) openAuth();
      return false;
    }
    setWishlist((prev) => {
      const targetId = product._id || product.productId;
      const exists = prev.some((item) => (item._id || item.productId) === targetId);
      if (exists) {
        return prev.filter((item) => (item._id || item.productId) !== targetId);
      } else {
        return [...prev, product];
      }
    });
    return true;
  };

  const clearWishlist = () => {
    setWishlist([]);
    try {
      localStorage.removeItem('floset_wishlist');
    } catch {
      // ignore
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
