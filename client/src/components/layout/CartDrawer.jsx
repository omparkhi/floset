import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, Truck, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Zap, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { buildWhatsAppOrderConfirmationUrl, FLOSET_WHATSAPP_NUMBER } from '../../config';

export default function CartDrawer({ onNavigate, onOpenAuth }) {
  const { cartItems, isCartOpen, closeCart, removeFromCart, clearCart, totalRentalPrice } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [customer, setCustomer] = useState({ name: user?.name || '', phone: user?.phone || '' });

  if (!isCartOpen) return null;

  const handleSubmitRequest = async () => {
    setError('');

    if (!user) {
      setError('Please sign in to complete your rental booking.');
      onOpenAuth();
      return;
    }

    if (!cartItems.length) return;
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }
    if (cartItems.some((item) => !item.startDate || !item.endDate || new Date(item.endDate) < new Date(item.startDate))) {
      setError('Every rental must have valid start and return dates.');
      return;
    }

    setLoading(true);
    let whatsappWindow;
    try {
      whatsappWindow = window.open('', '_blank');
      const res = await api.orders.create({
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        items: cartItems.map((item) => ({
          productId: item.product._id || item.product.productId,
          productName: item.product.name,
          type: item.type === 'BOOKING' ? 'BOOKING' : 'ORDER',
          rentalDuration: item.duration,
          startDate: item.startDate,
          endDate: item.endDate,
          quantity: item.quantity || 1
        }))
      });

      const order = res.order;
      setSubmittedOrder(order);
      const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const itemLines = order.items.map((item, index) => [
        `${index + 1}. ${item.productName}${item.quantity > 1 ? ` x${item.quantity}` : ''}`,
        `Type: ${item.type === 'BOOKING' ? 'Booking' : 'Order'}`,
        `Rental Date: ${formatDate(item.startDate)}`,
        `Return Date: ${formatDate(item.endDate)}`,
        `Rental: ₹${(item.rentalPrice * item.quantity).toLocaleString('en-IN')}`
      ].join('\n')).join('\n\n');
      const message = [
        'Hello FLOSET,',
        '',
        'I want to place a rental request.',
        '',
        `Order ID: ${order.orderId}`,
        '',
        itemLines,
        '',
        `Total: ₹${order.totalAmount.toLocaleString('en-IN')}`,
        '',
        `Name: ${order.customerName}`,
        `Phone: ${order.customerPhone}`,
        '',
        'Please verify availability and confirm my request.'
      ].join('\n');
      const whatsappUrl = `https://wa.me/${FLOSET_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) whatsappWindow.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;
      clearCart();

      // Automatically launch WhatsApp with prefilled booking details
      try {
        const waUrl = buildWhatsAppOrderConfirmationUrl(res.booking);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Auto-open WhatsApp blocked by browser popup setting:', e);
      }
    } catch (err) {
      if (whatsappWindow) whatsappWindow.close();
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
                ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
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
          {submittedOrder ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-display text-xl font-bold text-noir">
                Request Received
              </h3>
              <p className="text-xs text-ash leading-relaxed max-w-xs mx-auto">
                Request ID: <strong className="text-noir">{submittedOrder.orderId}</strong>. FLOSET will verify availability and confirm your request. It is not confirmed yet.
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
                  href={buildWhatsAppOrderConfirmationUrl(submittedOrder)}
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
                    setSubmittedOrder(null);
                    onNavigate('bookings');
                  }}
                  className="w-full py-3 bg-noir text-white text-xs font-bold rounded-xl hover:bg-obsidian transition-colors shadow-sm cursor-pointer"
                >
                  View My Rental Requests
                </button>
                <button
                  onClick={() => {
                    closeCart();
                    setSubmittedOrder(null);
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
                  key={`${item.product._id || item.product.productId}-${item.type}-${item.startDate}-${idx}`}
                  className="p-4 rounded-2xl bg-cream/50 border border-black/10 flex gap-4 relative"
                >
                  <img
                    src={item.product.images?.[0] || item.product.image}
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
                          onClick={() => removeFromCart(idx)}
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
                        <span>{item.type === 'BOOKING' ? 'Booking' : 'Order'} · {item.duration.replaceAll('_', ' ')}</span>
                      </div>
                      <div className="text-[10px] text-ash">
                        {item.startDate} to {item.endDate}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-black/5">
                      <span className="text-xs text-ash">Rental Fee {item.quantity > 1 ? `(x${item.quantity})` : ''}:</span>
                      <span className="text-xs font-bold text-noir">
                        ₹{((item.rentalPrice || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-2">
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none focus:border-noir"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none focus:border-noir"
                />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-4 border-t border-black/10 text-xs">
                <div className="flex justify-between text-ash">
                  <span>Outfit Rental Charge:</span>
                  <span className="font-semibold text-noir">₹{totalRentalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-noir pt-3 border-t border-black/10">
                  <span>Rental Total:</span>
                  <span className="font-display text-base">₹{totalRentalPrice.toLocaleString()}</span>
                </div>
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
        {cartItems.length > 0 && !submittedOrder && (
          <div className="p-6 border-t border-black/10 bg-sand/30">
            {!user && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-center text-xs text-amber-900 font-medium">
                Sign in to send your rental request.
              </div>
            )}
            <p className="mb-3 text-[11px] leading-relaxed text-ash">
              Your order will be confirmed on WhatsApp. After you submit your request, FLOSET will verify availability and confirm your order.
            </p>
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={loading}
              className="w-full py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <span>Submitting request...</span>
              ) : !user ? (
                <>
                  <span>Sign In to Send Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Confirm & Send on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
