import React, { useState, useEffect } from 'react';
import { Calendar, Package, Truck, Sparkles, CheckCircle2, Clock, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { buildWhatsAppOrderConfirmationUrl } from '../config';

export default function BookingsPage({ onNavigate, onOpenAuth }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.bookings.getMyBookings();
        setBookings(res.bookings || []);
      } catch (err) {
        console.error('Failed to load bookings:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  return (
    <div className="min-h-screen bg-sand/30 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-black/10 pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-1">
            Account &gt; Orders
          </span>
          <h1 className="font-display text-3xl font-extrabold text-noir tracking-tight">
            My Rental Bookings
          </h1>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-noir hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Rent Another Outfit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {!user ? (
        <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-black/5 shadow-sm">
          <p className="font-display text-lg font-bold text-noir">Sign in to view bookings</p>
          <p className="text-xs text-ash max-w-sm mx-auto">Your rental history and delivery status appear here after you sign in.</p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="mt-4 px-6 py-2.5 bg-noir text-white text-xs font-bold rounded-full hover:bg-obsidian transition-colors cursor-pointer"
          >
            Sign in
          </button>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-xs text-ash">Loading your rental orders...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-black/5 shadow-sm">
          <p className="font-display text-lg font-bold text-noir">No rental bookings yet</p>
          <p className="text-xs text-ash max-w-sm mx-auto">
            Discover luxury occasion wear for your next wedding, date night or party.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-4 px-6 py-2.5 bg-noir text-white text-xs font-bold rounded-full hover:bg-obsidian transition-colors cursor-pointer"
          >
            Explore Outfits
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-3xl border border-black/10 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6"
            >
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-base font-extrabold text-noir">
                      {booking.bookingId}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      {booking.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-ash">
                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-ash uppercase font-bold block">Total Paid (with deposit)</span>
                  <span className="font-display text-lg font-black text-noir">₹{booking.totalAmount?.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ₹{booking.securityDeposit} deposit status: {booking.depositStatus}
                  </span>
                </div>
              </div>

              {/* Product and Dates */}
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <img
                  src={booking.productId?.images?.[0]}
                  alt={booking.productId?.name}
                  className="w-24 h-32 object-cover rounded-2xl bg-sand flex-shrink-0"
                />

                <div className="flex-grow space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider">
                      {booking.productId?.category} • Size {booking.productId?.size}
                    </span>
                    <h3 className="font-display text-base font-bold text-noir">
                      {booking.productId?.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-cream/50 rounded-xl text-xs border border-black/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-noir/70" />
                      <div>
                        <span className="text-[10px] text-ash uppercase font-bold block">Rental Dates ({booking.rentalDuration.replace('_', ' ')})</span>
                        <span className="font-semibold text-noir">
                          {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-noir/70" />
                      <div>
                        <span className="text-[10px] text-ash uppercase font-bold block">Delivery Address</span>
                        <span className="text-noir font-medium truncate block max-w-[200px]">
                          {booking.deliveryAddress?.street}, {booking.deliveryAddress?.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Tracker */}
              <div className="pt-4 border-t border-black/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ash block">
                    FloSet Concierge Workflow
                  </span>
                  <a
                    href={buildWhatsAppOrderConfirmationUrl(booking)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat with Concierge about this Order</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-bold">
                  {[
                    { label: 'Confirmed', done: true },
                    { label: 'Sanitized & Steamed', done: ['CLEANING_SANITIZATION', 'STEAM_IRON', 'QUALITY_CHECKED', 'PACKAGED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'IN_USE'].includes(booking.orderStatus) },
                    { label: 'Dispatched', done: ['OUT_FOR_DELIVERY', 'DELIVERED', 'IN_USE'].includes(booking.orderStatus) },
                    { label: 'Delivered', done: ['DELIVERED', 'IN_USE', 'RETURN_INSPECTED', 'DEPOSIT_REFUNDED', 'COMPLETED'].includes(booking.orderStatus) },
                    { label: 'Deposit Settled', done: booking.depositStatus === 'FULLY_REFUNDED' }
                  ].map((step, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border transition-colors ${
                        step.done
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-sand/30 border-black/5 text-ash/60'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-ash/40" />}
                      </div>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
