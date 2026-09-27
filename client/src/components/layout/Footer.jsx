import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Footer({ onNavigate, onOpenListOutfit }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-noir text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-14 border-b border-white/10 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-emerald-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Doorstep Delivery</h4>
              <p className="text-white/60 leading-relaxed font-light">
                Prompt delivery & reverse pickup scheduled directly around your event timeline.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Hospital-Grade Clean</h4>
              <p className="text-white/60 leading-relaxed font-light">
                UV sanitization, organic eco dry-cleaning, and crisp steam pressing before every rental.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-emerald-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Zero Closet Guilt</h4>
              <p className="text-white/60 leading-relaxed font-light">
                Wear luxury fashion for one night without paying retail prices or cluttering your wardrobe.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Refundable Deposit</h4>
              <p className="text-white/60 leading-relaxed font-light">
                Security deposits settled and refunded automatically within 24 hours of return inspection.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Column Navigation Grid matching Framer */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-14 border-b border-white/10 text-xs">
          {/* Column 1: Pages */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-4">
              Pages
            </h5>
            <ul className="space-y-2.5 text-white/70">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Shop</button></li>
              <li><button onClick={() => onNavigate('journal')} className="hover:text-white transition-colors">Journal</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">FAQ</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button></li>
              <li>
                <button
                  onClick={() => onNavigate('host-dashboard')}
                  className="text-white hover:text-emerald-300 font-semibold transition-colors"
                >
                  Boutique / Shopkeeper
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenListOutfit}
                  className="text-emerald-300 hover:text-emerald-200 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>List Your Outfit</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-white/70">
              <li><button onClick={() => onNavigate('shop', { gender: 'Men' })} className="hover:text-white transition-colors">Men's Collection</button></li>
              <li><button onClick={() => onNavigate('shop', { gender: 'Women' })} className="hover:text-white transition-colors">Women's Collection</button></li>
              <li><button onClick={() => onNavigate('shop', { filter: 'best-sellers' })} className="hover:text-white transition-colors">Best Sellers</button></li>
              <li><button onClick={() => onNavigate('shop', { filter: 'seasonal-drop' })} className="hover:text-white transition-colors">Seasonal Drop</button></li>
              <li><button onClick={() => onNavigate('shop', { filter: 'new-arrivals' })} className="hover:text-white transition-colors">New Arrivals</button></li>
            </ul>
          </div>

          {/* Column 3: Legals */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-4">
              Legals
            </h5>
            <ul className="space-y-2.5 text-white/70">
              <li><button onClick={() => onNavigate('policy', { type: 'privacy' })} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('policy', { type: 'terms' })} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('policy', { type: 'return-and-refund' })} className="hover:text-white transition-colors">Return & Refund Policy</button></li>
              <li><button onClick={() => onNavigate('policy', { type: 'shipping' })} className="hover:text-white transition-colors">Shipping Policy</button></li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div>
            <h5 className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-4">
              Socials
            </h5>
            <ul className="space-y-2.5 text-white/70">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X / Twitter</a></li>
              <li><a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Pinterest</a></li>
            </ul>
          </div>

          {/* Column 5: Mini Newsletter Subscription */}
          <div className="col-span-2 md:col-span-1">
            <h5 className="text-[11px] font-bold tracking-widest text-white/40 uppercase mb-4">
              Subscribe to Newsletter
            </h5>
            <p className="text-white/60 text-xs mb-3 leading-relaxed font-light">
              Get early access to new arrivals, exclusive discounts, and seasonal drops.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-white text-noir text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-emeraldRent transition-colors"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Subscribed successfully!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <p>© 2026 FLOSET Inc. All rights reserved. Modern Fashion Ecommerce & Rental Marketplace.</p>

          <div className="flex items-center gap-3 text-white/60">
            <span>Payment secured by</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">VISA</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">MASTERCARD</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
