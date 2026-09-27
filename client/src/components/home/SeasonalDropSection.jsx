import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function SeasonalDropSection({ onNavigate }) {
  const cards = [
    {
      title: 'Built For Daily Confidence',
      category: 'FOR MEN',
      subtitle: 'Royal Sherwanis, Italian Tuxedos, Lucknowi Kurta Sets & Silk Blazers tailored for high-impact celebrations.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      route: 'shop',
      query: { gender: 'Men' }
    },
    {
      title: 'Designed For Modern Living',
      category: 'FOR WOMEN',
      subtitle: 'Couture Bridal Lehengas, Banarasi Organza Sarees, Evening Slips & Pre-Draped Saree Gowns.',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
      route: 'shop',
      query: { gender: 'Women' }
    },
    {
      title: 'Comfort For Every Adventure',
      category: 'FOR OCCASIONS',
      subtitle: 'Curated looks for Sangeets, Receptions, Cocktail Galas, Graduation Dinners & Photoshoots.',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
      route: 'shop',
      query: { occasion: 'Wedding' }
    }
  ];

  return (
    <section className="py-20 bg-cream/40 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-ash mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Curated Edits</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-noir tracking-tight">
              Seasonal Drop
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-ash group transition-colors"
          >
            <span>Explore All Edits</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => onNavigate(card.route, card.query)}
              className="group relative rounded-3xl overflow-hidden bg-noir text-white h-[460px] sm:h-[520px] flex flex-col justify-end p-8 cursor-pointer shadow-framer-md hover:shadow-framer-lg transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Background Image with Hover Scale */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.7] group-hover:brightness-[0.6]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/95 via-noir/40 to-transparent" />
              </div>

              {/* Text & Action */}
              <div className="relative z-10 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                  {card.category}
                </span>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {card.title}
                </h3>

                <p className="text-white/80 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                  {card.subtitle}
                </p>

                <div className="pt-3">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-noir text-xs font-bold uppercase tracking-wider group-hover:bg-emeraldRent transition-colors shadow-md">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
