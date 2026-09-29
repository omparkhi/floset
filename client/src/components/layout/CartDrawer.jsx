import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, Truck, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Zap, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { buildWhatsAppOrderConfirmationUrl } from '../../config';

export default function CartDrawer({ onNavigate, onOpenAuth }) {
  const { cartItems, isCartOpen, closeCart, removeFromCart, clearCart, totalRentalPrice, totalDeposit, grandTotal } = useCart();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Address state
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.savedAddresses?.[0]?.street || 'A-402, Oberoi Sky City, Borivali East',
    city: user?.savedAddresses?.[0]?.city || 'Mumbai',
    state: 'Maharashtra',
    pincode: '400066'
  });

  if (!isCartOpen) return null;

  const handleBooking = async () => {
    setError('');

    if (!user) {
      setError('Please sign in to complete your rental booking.');
      onOpenAuth();
      return;
    }

    if (!cartItems.length) return;
    const item = cartItems[0];

    setLoading(true);
    try {
      const res = await api.bookings.create({
        productId: item.product._id || item.product.productId,
        rentalDuration: item.duration,
        startDate: item.startDate,
        endDate: item.endDate,
        deliveryAddress: {
          name: address.name || user.name,
          phone: address.phone || user.phone || '+91 91234 56789',
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        }
      });

      setSuccessBooking(res.booking);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      clearCart();

      // Automatically launch WhatsApp with prefilled booking details
      try {
        const waUrl = buildWhatsAppOrderConfirmationUrl(res.booking);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Auto-open WhatsApp blocked by browser popup setting:', e);
      }
    } catch (err) {
      setError(err.message || 'Failed to place booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-framer-drawer flex flex-col justify-between overflow-y-auto">
          {/* Drawer Header */}
          <div className="p-6 border-b border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-extrabold tracking-tight text-noir">
                Your Rental Bag
              </span>
              <span className="text-xs font-bold text-ash">
                ({cartItems.length} {cartItems.length === 1 ? 'outfit' : 'outfits'})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-full text-noir/60 hover:text-noir hover:bg-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 flex-grow space-y-6">
            {successBooking ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-display text-xl font-bold text-noir">
                  Rental Booking Confirmed!
                </h3>
                <p className="text-xs text-ash leading-relaxed max-w-xs mx-auto">
                  Booking ID: <strong className="text-noir">{successBooking.bookingId}</strong>.
                  Our concierge team has initiated dry-cleaning & sanitization for doorstep delivery.
                </p>

                {/* 1-Tap WhatsApp Concierge Notification */}
                <div className="p-4 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl text-left space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs font-bold text-emerald-950">
                      WhatsApp Concierge Dispatched
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    Opening WhatsApp with your booking reference. If your browser blocked the automatic tab, click below to open your chat:
                  </p>
                  <a
                    href={buildWhatsAppOrderConfirmationUrl(successBooking)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp Chat Now</span>
                  </a>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      closeCart();
                      setSuccessBooking(null);
                      onNavigate('bookings');
                    }}
                    className="w-full py-3 bg-noir text-white text-xs font-bold rounded-xl hover:bg-obsidian transition-colors shadow-sm cursor-pointer"
                  >
                    Track Live Booking Status
                  </button>
                  <button
                    onClick={() => {
                      closeCart();
                      setSuccessBooking(null);
                      onNavigate('shop');
                    }}
                    className="w-full py-2.5 border border-black/15 text-noir text-xs font-semibold rounded-xl hover:bg-cream transition-colors cursor-pointer"
                  >
                    Continue Browsing Outfits
                  </button>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm font-bold text-noir">Your rental bag is empty</p>
                <p className="text-xs text-ash">
                  Explore designer dresses, lehengas, sherwanis and tuxedos ready for your next event.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('shop');
                  }}
                  className="mt-4 px-6 py-2.5 bg-noir text-white text-xs font-bold rounded-full hover:bg-obsidian transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <>
                {/* Outfit Summary Card */}
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-cream/50 border border-black/10 flex gap-4 relative"
                  >
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-xl bg-sand flex-shrink-0"
                    />

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold text-ash uppercase">
                            {item.product.category} • Size {item.size || item.product.size}
                          </span>
                          <button
                            onClick={removeFromCart}
                            className="text-noir/40 hover:text-red-500 p-0.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-display text-xs font-bold text-noir line-clamp-1 mt-0.5">
                          {item.product.name}
                        </h4>
                      </div>

                      {item.isExpressOrder && (
                        <div className="mt-2 px-2.5 py-1 bg-sand/60 border border-black/10 rounded-lg flex items-center gap-1.5 text-noir text-[10px] font-bold">
                          <Zap className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span className="uppercase tracking-wider">Express Dispatch — Priority Delivery</span>
                        </div>
                      )}

                      <div className="text-[11px] text-ash/90 space-y-0.5 mt-2 bg-white/70 p-2 rounded-lg border border-black/5">
                        <div className="flex items-center gap-1 font-semibold text-noir">
                          <Calendar className="w-3 h-3 text-noir/70" />
                          <span>Duration: {item.duration.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[10px] text-ash">
                          {item.startDate} to {item.endDate}
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-black/5">
                        <span className="text-xs text-ash">Rental Fee:</span>
                        <span className="text-xs font-bold text-noir">
                          ₹{item.rentalPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Address Form */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-noir uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" /> Doorstep Delivery Details
                    </span>
                    <span className="text-[10px] text-ash font-medium">Mumbai Metro</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Delivery Street Address"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none focus:border-noir"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none focus:border-noir"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none focus:border-noir"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-black/10 text-xs">
                  <div className="flex justify-between text-ash">
                    <span>Outfit Rental Charge:</span>
                    <span className="font-semibold text-noir">₹{totalRentalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-ash">
                    <span className="flex items-center gap-1">
                      Refundable Security Deposit:
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span className="font-semibold text-noir">₹{totalDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-ash">
                    <span>Hygiene, Sanitization & Steam:</span>
                    <span className="font-semibold text-emerald-700">FREE (Included)</span>
                  </div>
                  <div className="flex justify-between text-ash">
                    <span>Doorstep Delivery & Return Pickup:</span>
                    <span className="font-semibold text-emerald-700">FREE (Included)</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-noir pt-3 border-t border-black/10">
                    <span>Total Due Now:</span>
                    <span className="font-display text-base">₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-ash/80">
                    *₹{totalDeposit.toLocaleString()} security deposit is fully refunded within 24 hours of return inspection.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer CTA */}
          {cartItems.length > 0 && !successBooking && (
            <div className="p-6 border-t border-black/10 bg-sand/30">
              {!user && (
                <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-center text-xs text-amber-900 font-medium">
                  Sign in required to confirm and book rentals.
                </div>
              )}
              <button
                type="button"
                onClick={handleBooking}
                disabled={loading}
                className="w-full py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <span>Securing your outfit...</span>
                ) : !user ? (
                  <>
                    <span>Sign In to Book Rental</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Confirm & Book Rental</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
