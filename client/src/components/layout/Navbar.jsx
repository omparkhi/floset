import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingBag, User, PlusCircle, Menu, X, Shield, Sparkles, LogOut, ChevronDown, ChevronRight, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar({
  onOpenSearch,
  onOpenAuth,
  onOpenListOutfit,
  currentRoute,
  onNavigate
}) {
  const { user, logout } = useAuth();
  const { cartItems, openCart, clearCart } = useCart();
  const { wishlist, clearWishlist } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleSignOut = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      if (clearWishlist) clearWishlist();
      if (clearCart) clearCart();
    } catch (err) {
      console.error('Logout cache purge error:', err);
    }
    logout();
    if (onNavigate) {
      onNavigate('home');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      window.location.replace(window.location.origin);
    }, 50);
  };

  // Navbar is transparent ONLY on the home page when not scrolled
  const isTransparent = currentRoute === 'home' && !isScrolled && !mobileMenuOpen;

  const shopCategories = [
    { label: 'All Collection', query: {} },
    { label: 'Bridal & Lehengas', query: { category: 'Lehengas' } },
    { label: 'Silk Sarees', query: { category: 'Sarees' } },
    { label: 'Evening Gowns', query: { category: 'Gowns' } },
    { label: 'Italian Tuxedos', query: { category: 'Tuxedos' } },
    { label: 'Royal Sherwanis', query: { category: 'Sherwanis' } }
  ];

  const handleMobileNavigate = (route) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  const handleMobileSearch = () => {
    setMobileMenuOpen(false);
    onOpenSearch();
  };

  const handleMobileCart = () => {
    setMobileMenuOpen(false);
    openCart();
  };

  const handleMobileListOutfit = () => {
    setMobileMenuOpen(false);
    onOpenListOutfit();
  };

  const handleMobileAuth = () => {
    setMobileMenuOpen(false);
    onOpenAuth();
  };

  const handleMobileLogout = () => {
    handleSignOut();
  };

  return (
    <header
      className={`sticky top-0 z-40 relative transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent text-white border-b border-transparent py-4'
          : mobileMenuOpen
            ? 'bg-white text-noir border-b border-transparent py-5'
            : 'bg-white/95 backdrop-blur-md text-noir border-b border-black/5 shadow-sm py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group flex items-center gap-1.5 focus:outline-none select-none"
            >
              <span
                className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
                  isTransparent ? 'text-white' : 'text-noir'
                }`}
              >
                FLOSET
              </span>
              <span
                className={`text-lg font-bold leading-none transition-colors duration-300 ${
                  isTransparent ? 'text-white' : 'text-noir'
                }`}
              >
                ✽
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wider uppercase">
              {/* Shop Link with Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <button
                  onClick={() => onNavigate('shop')}
                  className={`relative py-1 flex items-center gap-1 transition-colors duration-300 ${
                    isTransparent ? 'text-white hover:text-white/80' : 'text-noir/80 hover:text-noir'
                  }`}
                >
                  <span>SHOP</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {shopDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="bg-white rounded-xl shadow-xl border border-black/10 py-2 text-noir">
                      {shopCategories.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => {
                            setShopDropdownOpen(false);
                            onNavigate('shop', cat.query);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-noir/80 hover:text-noir hover:bg-neutral-100 transition-colors"
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onNavigate('journal')}
                className={`relative py-1 transition-colors duration-300 ${
                  isTransparent ? 'text-white hover:text-white/80' : 'text-noir/80 hover:text-noir'
                }`}
              >
                <span>JOURNAL</span>
              </button>

              <button
                onClick={() => onNavigate('about')}
                className={`relative py-1 transition-colors duration-300 ${
                  isTransparent ? 'text-white hover:text-white/80' : 'text-noir/80 hover:text-noir'
                }`}
              >
                <span>ABOUT</span>
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className={`relative py-1 transition-colors duration-300 ${
                  isTransparent ? 'text-white hover:text-white/80' : 'text-noir/80 hover:text-noir'
                }`}
              >
                <span>CONTACT</span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className={`hidden lg:inline-flex p-2 rounded-full transition-colors duration-300 ${
                isTransparent ? 'text-white hover:bg-white/15' : 'text-noir/80 hover:text-noir hover:bg-black/5'
              }`}
              title="Search catalogue"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* User Account / Profile */}
            <div className="relative" ref={userDropdownRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border text-xs font-medium transition-colors ${
                    isTransparent
                      ? 'border-white/30 text-white bg-white/10 hover:bg-white/20'
                      : 'border-black/10 text-noir bg-cream/50 hover:border-black/30'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-noir text-white text-[10px] flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isTransparent ? 'text-white hover:bg-white/15' : 'text-noir/80 hover:text-noir hover:bg-black/5'
                  }`}
                  title="Sign In / Register"
                  aria-label="Account"
                >
                  <User className="w-4 h-4" />
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-black/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-noir"
                >
                  <div className="px-4 py-2 border-b border-black/5">
                    <p className="text-xs font-bold text-noir truncate">{user.name}</p>
                    <p className="text-[11px] text-ash truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cream uppercase tracking-wider text-noir/70">
                      {user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('bookings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 text-noir/80 font-medium"
                  >
                    My Rental Bookings
                  </button>

                  {(user.isHost || user.hasListings || user.role === 'admin' || user.role === 'host' || user.role === 'shopkeeper') && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('host-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 text-noir/80 font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {user.role === 'shopkeeper' ? 'Shopkeeper Dashboard' : 'Host Listings & Earnings'}
                    </button>
                  )}

                  {user.role === 'customer' && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('host-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 font-semibold"
                    >
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      Partner as Shopkeeper
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 font-semibold"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-700" />
                      Admin Control Portal
                    </button>
                  )}

                  <div className="border-t border-black/5 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Trigger with Badge */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  onNavigate('wishlist');
                }
              }}
              className={`hidden lg:flex p-2 rounded-full transition-colors duration-300 relative items-center ${
                isTransparent ? 'text-white hover:bg-white/15' : 'text-noir/80 hover:text-noir hover:bg-black/5'
              }`}
              title={user ? "Saved wishlist" : "Sign in to view wishlist"}
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {user && wishlist.length > 0 && (
                <span className="text-[10px] font-bold ml-1 leading-none">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger with Badge */}
            <button
              onClick={openCart}
              className={`hidden lg:flex p-2 rounded-full transition-colors duration-300 relative items-center ${
                isTransparent ? 'text-white hover:bg-white/15' : 'text-noir/80 hover:text-noir hover:bg-black/5'
              }`}
              title="View rental cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px] font-bold ml-1 leading-none">
                {cartItems.length}
              </span>
            </button>

            {/* List Your Outfit CTA */}
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  onOpenListOutfit();
                }
              }}
              className={`hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
                isTransparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-noir/80 hover:text-noir hover:bg-black/5'
              }`}
              title="List your outfit"
              aria-label="List your outfit"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors duration-300 ${
                isTransparent ? 'text-white hover:bg-white/15' : 'text-noir hover:bg-black/5'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full h-[calc(100dvh-72px)] bg-white text-noir px-8 pb-8 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="flex min-h-full flex-col justify-between gap-10">
              <div>
                <div className="mt-8 border-y border-black/10 py-2">
                  <button
                    onClick={handleMobileSearch}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-noir"
                  >
                    <span className="flex items-center gap-3">
                      <Search className="h-5 w-5" />
                      Search catalogue
                    </span>
                    <ChevronRight className="h-5 w-5 text-noir/35" />
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (!user) {
                        onOpenAuth();
                      } else {
                        onNavigate('wishlist');
                      }
                    }}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-noir"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="h-5 w-5" />
                      Wishlist
                    </span>
                    {user && (
                      <span className="text-sm text-noir/50">{wishlist.length}</span>
                    )}
                  </button>

                  <button
                    onClick={handleMobileCart}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-noir"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5" />
                      Rental cart
                    </span>
                    <span className="text-sm text-noir/50">{cartItems.length}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (!user) {
                        onOpenAuth();
                      } else {
                        onOpenListOutfit();
                      }
                    }}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-noir"
                  >
                    <span className="flex items-center gap-3">
                      <PlusCircle className="h-5 w-5" />
                      List your outfit
                    </span>
                    <ChevronRight className="h-5 w-5 text-noir/35" />
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {user ? (
                    <>
                      <div className="pb-3">
                        <p className="text-sm font-bold text-noir">{user.name}</p>
                        <p className="text-xs text-noir/45">{user.email}</p>
                      </div>

                      <button
                        onClick={() => handleMobileNavigate('bookings')}
                        className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-noir/75"
                      >
                        My Rental Bookings
                        <ChevronRight className="h-4 w-4 text-noir/30" />
                      </button>

                      {user.role === 'customer' && (
                        <button
                          type="button"
                          onClick={() => handleMobileNavigate('host-dashboard')}
                          className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-emerald-800"
                        >
                          <span className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-emerald-600" />
                            Partner as Shopkeeper
                          </span>
                          <ChevronRight className="h-4 w-4 text-emerald-700/50" />
                        </button>
                      )}

                      {(user.isHost || user.hasListings || user.role === 'admin' || user.role === 'host' || user.role === 'shopkeeper') && (
                        <button
                          type="button"
                          onClick={() => handleMobileNavigate('host-dashboard')}
                          className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-noir/75"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            {user.role === 'shopkeeper' ? 'Shopkeeper Dashboard' : 'Host Listings & Earnings'}
                          </span>
                          <ChevronRight className="h-4 w-4 text-noir/30" />
                        </button>
                      )}

                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleMobileNavigate('admin')}
                          className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-emerald-800"
                        >
                          <span className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-700" />
                            Admin Control Portal
                          </span>
                          <ChevronRight className="h-4 w-4 text-emerald-700/50" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleMobileLogout}
                        className="flex w-full items-center gap-2 py-3 text-left text-sm font-semibold text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleMobileAuth}
                      className="flex w-full items-center justify-between rounded-full bg-noir px-5 py-3.5 text-left text-sm font-bold text-white"
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Sign In / Register
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/70" />
                    </button>
                  )}
                </div>
              </div>

              <span />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
