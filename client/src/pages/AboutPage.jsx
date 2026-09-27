import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Award, Heart } from 'lucide-react';

export default function AboutPage({ onNavigate, onOpenListOutfit }) {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-ash">
          Our Brand Purpose
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-noir tracking-tight">
          "Your next outfit doesn’t need to be yours."
        </h1>
        <p className="text-sm sm:text-base text-ash leading-relaxed font-light">
          FLOSET was founded on a simple observation: we spend thousands on designer occasion wear for weddings, galas, and milestones only for those garments to hang unworn in closets for years.
        </p>
      </div>

      {/* Two-Sided Marketplace Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-cream/50 border border-black/5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-noir text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="font-display text-xl font-bold text-noir">For Fashion Renters</h3>
          <p className="text-xs text-ash leading-relaxed">
            Gain unlimited access to India’s most coveted designer wardrobes—Sabyasachi, Manish Malhotra, Raw Mango, Hugo Boss—at a fraction of retail prices. Wear a showstopping look for each invitation with zero clutter.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-cream/50 border border-black/5 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-noir text-white flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="font-display text-xl font-bold text-noir">For Wardrobe Hosts</h3>
          <p className="text-xs text-ash leading-relaxed">
            Boutiques and individual fashion lovers can monetize their unused designer garments. You specify your expected earnings; FLOSET coordinates professional sanitization, packaging, courier pickup, and direct monthly payouts.
          </p>
        </div>
      </div>

      {/* 5-Step Hygiene Standard */}
      <div className="bg-noir text-white p-8 sm:p-12 rounded-3xl space-y-6">
        <div className="max-w-xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Uncompromising Standards
          </span>
          <h2 className="font-display text-3xl font-bold">The 5-Step Hygiene Guarantee</h2>
          <p className="text-xs text-white/70 leading-relaxed">
            Every rented outfit that enters or leaves our vault is treated with medical-grade garment care before it arrives at your doorstep:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <strong className="text-emerald-300 block">1. 24-Point Seam Inspection</strong>
            <span className="text-white/60 text-[11px]">Physical verification of embellishments, seams, and lining.</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <strong className="text-emerald-300 block">2. Organic Eco Dry Cleaning</strong>
            <span className="text-white/60 text-[11px]">Zero harsh chemicals; preserves delicate silks and velvet sheen.</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <strong className="text-emerald-300 block">3. UV-C Sanitization & Steam</strong>
            <span className="text-white/60 text-[11px]">99.9% anti-microbial eradication and crisp lapel vertical pressing.</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4 space-y-3">
        <h3 className="font-display text-2xl font-bold text-noir">Ready to experience FLOSET?</h3>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 bg-noir text-white text-xs font-bold rounded-full hover:bg-obsidian"
          >
            Explore Outfits
          </button>
          <button
            onClick={onOpenListOutfit}
            className="px-6 py-3 border border-black/20 text-noir text-xs font-bold rounded-full hover:bg-cream"
          >
            List Your Outfit
          </button>
        </div>
      </div>
    </div>
  );
}
