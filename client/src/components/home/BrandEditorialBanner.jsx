import React from 'react';
import { ArrowRight, PlusCircle, Sparkles, Award } from 'lucide-react';

export default function BrandEditorialBanner({ onExplore, onListOutfit }) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-noir text-white p-8 sm:p-14 lg:p-20 shadow-framer-lg">
        {/* Background Subtle Gradient & Editorial Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1600&auto=format&fit=crop"
            alt="Editorial high fashion"
            className="w-full h-full object-cover opacity-20 filter grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/90 to-noir/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The FLOSET Philosophy</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Your next outfit doesn’t need to be yours.
          </h2>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
            We buy outfits for weddings, parties, and milestones only to wear them once. FLOSET turns fashion into an experience: rent the look you crave for the dates you need, or list the designer pieces sitting in your closet and unlock monthly passive income.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onExplore}
              className="px-7 py-3.5 bg-white text-noir hover:bg-emeraldRent transition-all rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Explore The Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onListOutfit}
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>List An Outfit</span>
            </button>
          </div>
        </div>

        {/* Floating Stat Card on Right */}
        <div className="hidden lg:flex flex-col gap-4 absolute right-14 bottom-14 z-10 bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl max-w-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-400/20 text-emerald-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-white">₹12,400</p>
              <p className="text-[11px] text-white/70">Avg. monthly host earning</p>
            </div>
          </div>
          <p className="text-[11px] text-white/60 leading-normal border-t border-white/10 pt-3">
            Boutiques and individual hosts earn reliable passive revenue while FLOSET manages cleaning, pickup, logistics, and insurance.
          </p>
        </div>
      </div>
    </section>
  );
}
