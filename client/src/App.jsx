import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { api } from './services/api';
import { demoProducts } from './data/demoProducts';

// Layout Components
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import SearchModal from './components/common/SearchModal';
import AuthModal from './components/common/AuthModal';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ListOutfitPage from './pages/ListOutfitPage';
import HostDashboardPage from './pages/HostDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookingsPage from './pages/BookingsPage';
import WishlistPage from './pages/WishlistPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import JournalPage from './pages/JournalPage';
import JournalArticlePage from './pages/JournalArticlePage';
import PolicyPages from './pages/PolicyPages';
import ShopkeeperPage from './pages/ShopkeeperPage';

const parseInitialRoute = () => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (path === 'shopkeeper' || path === 'shopkeeper/register') return 'host-dashboard';
  if (path === 'shop') return 'shop';
  if (path === 'list-outfit') return 'list-outfit';
  if (path === 'about') return 'about';
  if (path === 'contact') return 'contact';
  if (path === 'journal') return 'journal';
  if (path === 'bookings') return 'bookings';
  if (path === 'wishlist') return 'wishlist';
  if (path === 'host-dashboard') return 'host-dashboard';
  if (path === 'admin') return 'admin';
  return 'home';
};

function AppContent() {
  const { user, loading, isAuthOpen, openAuth, closeAuth } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(parseInitialRoute);
  const [routeParams, setRouteParams] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [products, setProducts] = useState(demoProducts);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseInitialRoute();
      setCurrentRoute(parsed);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected route guard: Throw to home if guest attempts protected pages or logs out
  useEffect(() => {
    if (!loading && !user) {
      const protectedRoutes = ['wishlist', 'bookings', 'host-dashboard', 'admin'];
      if (protectedRoutes.includes(currentRoute)) {
        setCurrentRoute('home');
        setRouteParams({});
        openAuth();
      }
    }
  }, [user, loading, currentRoute, openAuth]);

  // Fetch public products on mount
  useEffect(() => {
    api.products.getAll()
      .then((data) => {
        if (data.products?.length) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  const navigate = (route, params = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    try {
      const targetPath = route === 'home' ? '/' : `/${route}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    navigate('product', { id: product.productId || product._id });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-noir">
      {/* Top Announcement Ribbon */}
      <AnnouncementBar onNavigate={navigate} onOpenListOutfit={() => navigate('list-outfit')} />

      {/* Main Sticky Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={() => openAuth()}
        onOpenListOutfit={() => navigate('list-outfit')}
      />

      {/* Main Page Routing */}
      <main className="flex-grow">
        {currentRoute === 'home' && (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
            onOpenListOutfit={() => navigate('list-outfit')}
          />
        )}

        {currentRoute === 'shop' && (
          <ShopPage
            initialFilters={routeParams}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'shopkeeper' && (
          <ShopkeeperPage
            onNavigate={navigate}
            onOpenAuth={openAuth}
          />
        )}

        {currentRoute === 'product' && (
          <ProductDetailPage
            product={selectedProduct || products[0]}
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
            onOpenAuth={() => openAuth()}
          />
        )}

        {currentRoute === 'list-outfit' && (
          <ListOutfitPage
            onNavigate={navigate}
            onOpenAuth={() => openAuth()}
          />
        )}

        {currentRoute === 'host-dashboard' && (
          <HostDashboardPage
            onNavigate={navigate}
            onOpenListOutfit={() => navigate('list-outfit')}
            onOpenAuth={() => openAuth()}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboardPage
            onNavigate={navigate}
            onOpenAuth={() => openAuth()}
          />
        )}

        {currentRoute === 'bookings' && (
          <BookingsPage
            onNavigate={navigate}
            onOpenAuth={() => openAuth()}
          />
        )}

        {currentRoute === 'wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onNavigate={navigate}
            onOpenAuth={() => openAuth()}
          />
        )}

        {currentRoute === 'about' && (
          <AboutPage
            onNavigate={navigate}
            onOpenListOutfit={() => navigate('list-outfit')}
          />
        )}

        {currentRoute === 'contact' && (
          <ContactPage />
        )}

        {currentRoute === 'journal' && (
          <JournalPage onNavigate={navigate} />
        )}

        {currentRoute === 'journal-article' && (
          <JournalArticlePage
            key={routeParams.slug}
            slug={routeParams.slug}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'policy' && (
          <PolicyPages
            policyType={routeParams.type}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onNavigate={navigate}
        onOpenAuth={() => openAuth()}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        onNavigate={navigate}
      />

      {/* Quick Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
        onLoginSuccess={(userData) => {
          if (userData?.role === 'shopkeeper' || userData?.role === 'host') {
            navigate('host-dashboard');
          } else if (userData?.role === 'admin') {
            navigate('admin');
          } else if (currentRoute === 'shopkeeper') {
            navigate('host-dashboard');
          }
        }}
      />

      {/* Global Footer */}
      <Footer
        onNavigate={navigate}
        onOpenListOutfit={() => navigate('list-outfit')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
