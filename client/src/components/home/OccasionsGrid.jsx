import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function OccasionsGrid({ onSelectOccasion }) {
  const occasions = [
    {
      title: 'Wedding',
      desc: 'Bridal Lehengas & Royal Sherwanis',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      tag: 'Festive Luxury',
      colSpan: 'sm:col-span-2 lg:col-span-2'
    },
    {
      title: 'Reception',
      desc: 'Black Tie Tuxedos & Corset Gowns',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
      tag: 'Evening Glam',
      colSpan: 'sm:col-span-1 lg:col-span-1'
    },
    {
      title: 'Party',
      desc: 'Cocktail Dresses & Statement Blazers',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
      tag: 'Night Out',
      colSpan: 'sm:col-span-1 lg:col-span-1'
    },
    {
      title: 'Date',
      desc: 'Backless Silk Slips & Structured Jackets',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
      tag: 'Romantic',
      colSpan: 'sm:col-span-1 lg:col-span-1'
    },
    {
      title: 'Photoshoot',
      desc: 'Editorial Designer Statements',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      tag: 'Editorial',
      colSpan: 'sm:col-span-1 lg:col-span-1'
    },
    {
      title: 'College Event',
      desc: 'Prom Suits, Sarees & Chic Coordinates',
      image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
      tag: 'Youth Celebrations',
      colSpan: 'sm:col-span-2 lg:col-span-1'
    }
  ];

  return (
    <section className="py-20 bg-cream/40 border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-ash">
            Curated Occasion Collections
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight mt-1">
            Rent by Occasion
          </h2>
          <p className="text-xs sm:text-sm text-ash mt-2">
            Whatever your calendar looks like this month, wear high-fashion without committing to a permanent wardrobe purchase.
          </p>
        </div>

        {/* Occasions Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map((occ) => (
            <div
              key={occ.title}
              onClick={() => onSelectOccasion(occ.title)}
              className={`group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-framer-lg transition-all duration-500 ${occ.colSpan}`}
            >
              <img
                src={occ.image}
                alt={occ.title}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/30 to-transparent transition-opacity duration-300 group-hover:from-noir/95" />

              {/* Card Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <span className="self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {occ.tag}
                </span>

                <div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                    {occ.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    {occ.desc}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 mt-3 group-hover:translate-x-1 transition-transform">
                    <span>Explore Outfits</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
