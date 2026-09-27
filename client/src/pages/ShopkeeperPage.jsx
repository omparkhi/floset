import React from 'react';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Truck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ShopkeeperPage({ onNavigate, onOpenAuth }) {
  const { user, openAuth } = useAuth();

  const isAlreadyPartner = Boolean(
    user && (user.role === 'shopkeeper' || user.role === 'host' || user.role === 'admin' || user.isHost)
  );

  const handleOpenShopkeeperRegister = () => {
    if (openAuth) {
      openAuth({ role: 'shopkeeper', mode: 'register' });
    }
  };

  const handleOpenShopkeeperLogin = () => {
    if (openAuth) {
      openAuth({ role: 'shopkeeper', mode: 'login' });
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Monetize Idle Boutique Inventory',
      desc: 'Earn high-yield recurring rental revenue on bridal lehengas, tuxedos, and couture pieces between retail sales.'
    },
    {
      icon: ShieldCheck,
      title: '100% Guaranteed Security Deposits',
      desc: 'Every garment is backed by upfront renter security deposits and rigorous pre- and post-rental inspection.'
    },
    {
      icon: Truck,
      title: 'Zero Logistics Headache',
      desc: 'FLOSET handles concierge doorstep pickup, UV sanitization, premium steam-press, and insured return delivery.'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Host Dashboard',
      desc: 'Track live rental earnings, active orders, vault inventory availability, and automated weekly UPI/bank payouts.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Register Your Boutique',
      desc: 'Create your verified shopkeeper account with store details and payout preferences in under 2 minutes.'
    },
    {
      num: '02',
      title: 'List Outfits & Set Expected Earnings',
      desc: 'Upload high-res photos of your collection, specify condition, size, and declare your desired earnings per rental.'
    },
    {
      num: '03',
      title: 'FLOSET Concierge Curation',
      desc: 'Our fashion curation team reviews your pieces and publishes them to thousands of high-intent event clients.'
    },
    {
      num: '04',
      title: 'Doorstep Pickup & Weekly Payouts',
      desc: 'When an order is booked, our concierge picks up the outfit and transfers payouts directly to your account.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-noir">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-noir text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-roseTag shadow-sm">
            <Store className="w-4 h-4 text-emeraldRent" />
            <span>FLOSET Boutique & Shopkeeper Partner Program</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Turn Your Designer Inventory Into <span className="text-emeraldRent">Passive Rental Revenue</span>
          </h1>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed font-sans">
            Partner with India&apos;s premier luxury fashion rental platform. We connect your bridal, ethnic, and formal wear collection with verified renters while handling 100% of dry-cleaning, logistics, and deposits.
          </p>

          {/* Actions based on partner status */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAlreadyPartner ? (
              <>
                <button
                  onClick={() => onNavigate('host-dashboard')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emeraldRent hover:bg-emerald-400 text-noir font-display font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Go to Shopkeeper Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('list-outfit')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-display font-semibold text-sm rounded-xl transition-all"
                >
                  List a New Outfit
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleOpenShopkeeperRegister}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emeraldRent hover:bg-emerald-400 text-noir font-display font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <span>Register as Shopkeeper</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenShopkeeperLogin}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-display font-semibold text-sm rounded-xl transition-all"
                >
                  Partner Sign In
                </button>
              </>
            )}
          </div>

          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/10 max-w-4xl mx-auto">
            <div className="p-3">
              <span className="font-display text-2xl font-extrabold text-white">0%</span>
              <p className="text-xs text-white/60 mt-0.5">Listing & onboarding fee</p>
            </div>
            <div className="p-3">
              <span className="font-display text-2xl font-extrabold text-emeraldRent">100%</span>
              <p className="text-xs text-white/60 mt-0.5">Deposit backed security</p>
            </div>
            <div className="p-3">
              <span className="font-display text-2xl font-extrabold text-white">24h</span>
              <p className="text-xs text-white/60 mt-0.5">Rapid curation turnaround</p>
            </div>
            <div className="p-3">
              <span className="font-display text-2xl font-extrabold text-roseTag">Weekly</span>
              <p className="text-xs text-white/60 mt-0.5">Direct bank / UPI payouts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner with FLOSET */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-bold text-ash uppercase tracking-wider">
            Why Boutiques Choose FLOSET
          </span>
          <h2 className="font-display text-3xl font-extrabold text-noir">
            Engineered for Retailers & Fashion Houses
          </h2>
          <p className="text-xs text-ash">
            Maintain complete ownership of your inventory while maximizing rental yield during non-peak retail cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-cream/50 border border-black/5 hover:border-black/15 transition-all space-y-3 hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-noir text-white flex items-center justify-center shadow-sm">
                <b.icon className="w-5 h-5 text-emeraldRent" />
              </div>
              <h3 className="font-display text-base font-bold text-noir">{b.title}</h3>
              <p className="text-xs text-ash leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="py-16 bg-cream/40 border-y border-black/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-bold text-ash uppercase tracking-wider">
              Simple 4-Step Process
            </span>
            <h2 className="font-display text-3xl font-extrabold text-noir">
              How the Shopkeeper Program Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-black/5 space-y-3 relative shadow-sm">
                <span className="font-display text-3xl font-extrabold text-black/15">
                  {s.num}
                </span>
                <h3 className="font-display text-base font-bold text-noir">{s.title}</h3>
                <p className="text-xs text-ash leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={isAlreadyPartner ? () => onNavigate('list-outfit') : handleOpenShopkeeperRegister}
              className="px-8 py-3.5 bg-noir hover:bg-obsidian text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>{isAlreadyPartner ? 'List Your First Outfit' : 'Register Your Boutique Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <h2 className="font-display text-2xl font-extrabold text-noir">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-ash">
            Common questions from boutique owners and retail partners
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-cream/40 border border-black/5 space-y-2">
            <h4 className="font-display text-sm font-bold text-noir">
              What happens if an outfit is damaged or stained?
            </h4>
            <p className="text-xs text-ash leading-relaxed">
              All garments are backed by renter security deposits. Minor blemishes are treated by our master dry-cleaners at no cost to you. In the rare case of permanent damage, the security deposit is forfeited and reimbursed directly to you.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cream/40 border border-black/5 space-y-2">
            <h4 className="font-display text-sm font-bold text-noir">
              Can I block specific dates if I need the outfit in-store?
            </h4>
            <p className="text-xs text-ash leading-relaxed">
              Yes! Through the Host/Partner dashboard, you can define custom blackout windows anytime to reserve pieces for your store window or retail clients.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cream/40 border border-black/5 space-y-2">
            <h4 className="font-display text-sm font-bold text-noir">
              How and when do I receive rental payouts?
            </h4>
            <p className="text-xs text-ash leading-relaxed">
              Payouts are automatically calculated based on your declared expected earnings and settled directly to your registered UPI ID or Bank account upon rental completion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
