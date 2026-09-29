import React, { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Sparkles, Truck, RefreshCw, Ruler, Check, AlertCircle, Share2, Zap, Calendar, Clock, MessageCircle } from 'lucide-react';
import AvailabilityCalendar from '../components/common/AvailabilityCalendar';
import ProductCard from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { buildWhatsAppQuickInquiryUrl } from '../config';

export default function ProductDetailPage({ product, onSelectProduct, onNavigate, onOpenAuth }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState('3_days');
  const [selectedSize, setSelectedSize] = useState(product?.size || 'M');
  const [dateSelection, setDateSelection] = useState({
    startDate: '',
    endDate: '',
    isAvailable: true
  });
  const [activeTab, setActiveTab] = useState('description');
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    const activeSizes = (product?.availableSizes && product.availableSizes.length > 0)
      ? product.availableSizes
      : (product?.size ? [product.size] : ['M']);
    setSelectedSize(activeSizes[0] || 'M');

    // Fetch related products
    if (product?.category) {
      api.products.getAll({ category: product.category })
        .then((data) => {
          const others = (data.products || []).filter(
            (p) => (p._id || p.productId) !== (product._id || product.productId)
          );
          setRelatedProducts(others.slice(0, 4));
        })
        .catch(() => {});
    }
  }, [product]);

  if (!product) return null;

  const getPriceForDuration = (dur) => {
    if (!product.pricing) return 999;
    switch (dur) {
      case '3_hours': return product.pricing.duration3h;
      case '1_day': return product.pricing.duration1d;
      case '3_days': return product.pricing.duration3d;
      case '5_days': return product.pricing.duration5d;
      case '7_days': return product.pricing.duration7d;
      default: return product.pricing.duration3d;
    }
  };

  const currentPrice = getPriceForDuration(selectedDuration);
  const isLiked = isInWishlist(product._id || product.productId);

  const handleRentNow = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }

    if (!dateSelection.startDate || !dateSelection.endDate) {
      alert('Please select your preferred dates on the calendar.');
      return;
    }

    if (!dateSelection.isAvailable) {
      alert('This outfit is not available for the selected dates. Please choose another date range on the calendar.');
      return;
    }

    addToCart({
      product,
      size: selectedSize,
      duration: selectedDuration,
      startDate: dateSelection.startDate,
      endDate: dateSelection.endDate,
      rentalPrice: currentPrice,
      securityDeposit: product.securityDeposit || 1000,
      type: 'BOOKING',
      quantity: 1,
      isExpressOrder: false
    });
  };

  const handleOrderNow = () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }

    if (!dateSelection.isAvailable) {
      alert('This outfit is already booked for the selected dates. Please pick open dates on the calendar.');
      return;
    }

    // Use calendar's selected dates
    const startDate = dateSelection.startDate || new Date().toISOString().split('T')[0];
    const endDate = dateSelection.endDate || (() => {
      const end = new Date(startDate);
      let days = 3;
      if (selectedDuration === '3_hours') days = 0;
      else if (selectedDuration === '1_day') days = 1;
      else if (selectedDuration === '3_days') days = 3;
      else if (selectedDuration === '5_days') days = 5;
      else if (selectedDuration === '7_days') days = 7;
      if (days > 0) end.setDate(end.getDate() + days);
      return end.toISOString().split('T')[0];
    })();

    addToCart({
      product,
      size: selectedSize,
      duration: selectedDuration,
      startDate,
      endDate,
      rentalPrice: currentPrice,
      securityDeposit: product.securityDeposit || 1000,
      type: 'ORDER',
      quantity: 1,
      isExpressOrder: true,
      deliverySpeed: 'Express 90-Min / Same-Day Rush'
    });
  };

  const handleAddRental = (type) => {
    if (type === 'ORDER') {
      handleOrderNow();
    } else {
      handleRentNow();
    }
  };

  const durationOptions = [
    { id: '3_hours', label: '3 Hours', desc: 'Photoshoots & Quick Events' },
    { id: '1_day', label: '1 Day', desc: 'Evening Parties & Dinners' },
    { id: '3_days', label: '3 Days', desc: 'Standard Weekend Occasions' },
    { id: '5_days', label: '5 Days', desc: 'Multi-day Festivities' },
    { id: '7_days', label: '7 Days', desc: 'Destination Weddings' }
  ];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-[11px] font-bold tracking-wider text-ash uppercase mb-6 flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:text-noir transition-colors">Home</button>
        <span>&gt;</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-noir transition-colors">Rentals</button>
        <span>&gt;</span>
        <span className="text-noir">{product.name}</span>
      </div>

      {/* Main Grid: Gallery on Left + Sticky Booking Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Gallery (Left: 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Photo */}
          <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden bg-sand relative shadow-sm border border-black/5">
            <img
              src={product.images?.[activeImageIndex] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-top"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-noir shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden bg-sand border-2 transition-all flex-shrink-0 ${
                    idx === activeImageIndex
                      ? 'border-noir shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Mobile Accordion Details */}
          <div className="pt-6 border-t border-black/10 space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-black/10 pb-2 text-xs font-bold uppercase tracking-wider overflow-x-auto">
              {[
                { id: 'description', label: 'Description & Styling' },
                { id: 'measurements', label: 'Measurements & Fit' },
                { id: 'hygiene', label: 'Hygiene Guarantee' },
                { id: 'accessories', label: 'Accessories' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-noir text-white'
                      : 'text-ash hover:text-noir'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-4 bg-cream/30 rounded-2xl border border-black/5 text-xs text-noir/80 leading-relaxed min-h-[120px]">
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 text-[11px]">
                    <div><strong>Brand/Curation:</strong> {product.brand || 'FLOSET Vault'}</div>
                    <div><strong>Color:</strong> {product.colour}</div>
                    <div><strong>Condition:</strong> {product.condition}</div>
                    <div><strong>Occasions:</strong> {product.occasions?.join(', ')}</div>
                  </div>
                </div>
              )}

              {activeTab === 'measurements' && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-white rounded-xl border border-black/5">
                      <span className="text-[10px] text-ash uppercase font-bold block">Bust / Chest</span>
                      <strong className="text-sm">{product.measurements?.bustChest || 'Standard'}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-black/5">
                      <span className="text-[10px] text-ash uppercase font-bold block">Waist</span>
                      <strong className="text-sm">{product.measurements?.waist || 'Standard'}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-black/5">
                      <span className="text-[10px] text-ash uppercase font-bold block">Hips</span>
                      <strong className="text-sm">{product.measurements?.hips || 'Standard'}</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-black/5">
                      <span className="text-[10px] text-ash uppercase font-bold block">Length</span>
                      <strong className="text-sm">{product.measurements?.length || 'Standard'}</strong>
                    </div>
                  </div>
                  {product.measurements?.fitNotes && (
                    <p className="text-[11px] text-ash italic pt-1">
                      Note: {product.measurements.fitNotes}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'hygiene' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>5-Step Hospital Grade Sanitization</span>
                  </div>
                  <p className="text-ash leading-relaxed">
                    {product.cleaningInfo || 'Every outfit undergoes specialized solvent dry cleaning, steam-pressing, and UV-C disinfection before being vacuum sealed in a garment bag.'}
                  </p>
                </div>
              )}

              {activeTab === 'accessories' && (
                <div className="space-y-2">
                  <p className="font-bold text-noir">Included with this rental:</p>
                  {product.includedAccessories?.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1 text-ash">
                      {product.includedAccessories.map((acc, i) => (
                        <li key={i}>{acc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ash">Garment bag and matching hanger included.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-framer-md">
            {/* Header / ID / Category */}
            <div>
              <div className="flex items-center justify-between text-xs text-ash mb-1">
                <span className="font-bold tracking-widest text-noir/50 uppercase">
                  FLOSET • ID: {product.productId}
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                  {product.condition}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-noir tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-ash mt-1">
                Occasion: <strong className="text-noir">{product.occasions?.join(', ')}</strong>
              </p>
            </div>

            {/* Dynamic Price Display */}
            <div className="p-4 bg-cream/60 rounded-2xl border border-black/5 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-ash font-bold uppercase tracking-wider block">
                  Rental Price ({selectedDuration.replace('_', ' ')})
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-3xl font-black text-noir">
                    ₹{currentPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-ash font-medium">
                    / {selectedDuration.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-ash font-bold uppercase tracking-wider block">
                  Refundable Deposit
                </span>
                <span className="text-sm font-bold text-noir">
                  ₹{product.securityDeposit?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Duration Selector Chips */}
            <div>
              <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-2">
                Select Rental Duration
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDuration(opt.id)}
                    className={`py-2 px-1 rounded-xl text-center transition-all ${
                      selectedDuration === opt.id
                        ? 'bg-noir text-white font-bold shadow-sm'
                        : 'bg-cream/60 hover:bg-cream text-noir/80 text-xs font-semibold'
                    }`}
                  >
                    <span className="block text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector with Live In-Stock Availability Guard */}
            {(() => {
              const availableSizes = (product?.availableSizes && product.availableSizes.length > 0)
                ? product.availableSizes
                : (product?.size ? [product.size] : ['M']);

              const allPossibleSizes = availableSizes.includes('Free Size') && availableSizes.length === 1
                ? ['Free Size']
                : availableSizes.includes('Free Size')
                ? ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
                : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-ash uppercase tracking-wider">
                        Select Size
                      </label>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {availableSizes.length === 1 ? `Only ${availableSizes[0]} In Stock` : `${availableSizes.join(', ')} In Stock`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMeasurementModal(true)}
                      className="text-[11px] font-bold text-noir hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size & Measurements Guide</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {allPossibleSizes.map((sz) => {
                      const isAvailable = availableSizes.includes(sz);
                      const isSelected = selectedSize === sz;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setSelectedSize(sz)}
                          title={isAvailable ? `Select Size ${sz}` : `Size ${sz} is not available for this outfit`}
                          className={`flex-1 min-w-[48px] py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                            !isAvailable
                              ? 'bg-neutral-100 text-ash/40 border border-black/5 cursor-not-allowed line-through opacity-40'
                              : isSelected
                              ? 'bg-noir text-white shadow-md ring-2 ring-emerald-500/40 scale-105'
                              : 'bg-white border border-black/15 text-noir hover:border-noir hover:bg-cream/50 shadow-2xs'
                          }`}
                        >
                          <span>{sz}</span>
                          {!isAvailable && (
                            <span className="text-[8px] font-semibold text-ash/60 tracking-tighter no-underline -mt-0.5">
                              Out
                            </span>
                          )}
                          {isAvailable && isSelected && (
                            <span className="text-[8px] text-emeraldRent -mt-0.5">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Date Picker & Double-Booking Availability Guard */}
            <AvailabilityCalendar
              productId={product._id || product.productId}
              duration={selectedDuration}
              onDatesChange={(dates) => setDateSelection(dates)}
            />

            {/* Express Rush Delivery Callout */}
            <div className="p-3.5 bg-sand/40 border border-black/10 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-noir text-white flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-200" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-noir">
                    Express Same-Day Dispatch
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-noir text-white rounded-full">
                    90-Min Rush
                  </span>
                </div>
                <p className="text-[11px] text-ash mt-0.5 leading-snug">
                  Need it urgently? Select <strong>Order Now</strong> for priority same-day concierge delivery.
                </p>
              </div>
            </div>

            {/* CTAs: Order Now, Book for Occasion, Wishlist */}
            <div className="space-y-2.5 pt-1">
              {/* Primary: ORDER NOW */}
              <button
                type="button"
                onClick={handleOrderNow}
                className="w-full py-3.5 px-6 bg-noir hover:bg-obsidian text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-transparent"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {!user ? 'Sign In & Order Now (Express)' : 'Order Now — Same-Day Express'}
                </span>
              </button>

              {/* Secondary: BOOK FOR OCCASION */}
              <button
                type="button"
                onClick={handleRentNow}
                disabled={user && !dateSelection.isAvailable}
                className="w-full py-3.5 px-6 bg-white hover:bg-cream border border-noir/20 hover:border-noir text-noir text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all shadow-2xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-noir/70" />
                <span>
                  {!user
                    ? 'Sign In to Book for Date'
                    : dateSelection.isAvailable
                      ? 'Book for Occasion Date'
                      : 'Unavailable on Selected Dates'}
                </span>
              </button>

              {/* Wishlist CTA */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`w-full py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isLiked
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-black/10 hover:bg-cream text-noir/80'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isLiked ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {/* Instant WhatsApp Order / Inquiry */}
              <a
                href={buildWhatsAppQuickInquiryUrl({
                  product,
                  size: selectedSize,
                  duration: selectedDuration,
                  startDate: dateSelection.startDate,
                  endDate: dateSelection.endDate,
                  user
                })}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Order Directly on WhatsApp</span>
              </a>
            </div>

            {/* Delivery & Hygiene Guarantees */}
            <div className="pt-4 border-t border-black/10 space-y-2 text-[11px] text-ash">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-noir/70" />
                <span>Free Doorstep Delivery & Return Pickup in Mumbai</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-noir/70" />
                <span>Professionally dry-cleaned, sanitized & steam-pressed</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-noir/70" />
                <span>Full security deposit refund upon swift return inspection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Measurement Guide Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-black/10 pb-3">
              <h3 className="font-display text-lg font-bold text-noir">
                Outfit Sizing & Exact Measurements
              </h3>
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="p-1 rounded-full hover:bg-cream"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-ash">
              This piece is tailored to standard Indian sizing specifications:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-ash">Bust / Chest:</span>
                <strong className="text-noir">{product.measurements?.bustChest || '36 - 38 inches'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-ash">Waist:</span>
                <strong className="text-noir">{product.measurements?.waist || '30 - 32 inches'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-ash">Hips:</span>
                <strong className="text-noir">{product.measurements?.hips || '40 - 42 inches'}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5">
                <span className="text-ash">Length:</span>
                <strong className="text-noir">{product.measurements?.length || '43 inches'}</strong>
              </div>
            </div>
            <button
              onClick={() => setShowMeasurementModal(false)}
              className="w-full py-2.5 bg-noir text-white text-xs font-bold rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-black/10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-noir tracking-tight mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p._id || p.productId}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
