import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

export default function TestimonialsMarquee() {
  const reviews = [
    {
      name: 'Rhea Malhotra',
      role: 'Rented for Wedding Reception',
      quote: 'The Sabyasachi lehenga arrived in immaculate condition—freshly pressed with zero flaws. I received endless compliments and saved over ₹1.5 Lakhs.',
      rating: 5
    },
    {
      name: 'Kabir Singhal',
      role: 'Rented Black Tie Tuxedo',
      quote: 'Doorstep delivery arrived 24 hours before my event. The fit was sharp, the fabric felt ultra-luxurious, and the return pickup was completely hands-off.',
      rating: 5
    },
    {
      name: 'Natasha Poonawalla',
      role: 'FloSet Host (Boutique Owner)',
      quote: 'I listed 4 evening gowns that were sitting idle. FLOSET handles the dry cleaning, courier, and vetting while I receive direct UPI payouts every month.',
      rating: 5
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Rented Silk Saree for Sangeet',
      quote: 'Zero closet guilt! Why spend a fortune on something you will only post on Instagram once? FLOSET is the future of Indian occasion wear.',
      rating: 5
    },
    {
      name: 'Vikramaditya Roy',
      role: 'Rented Jodhpur Sherwani',
      quote: 'The concierge team helped confirm exact chest and shoulder measurements before dispatch. The refundable deposit was credited back within 12 hours.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-ash">
          Verified Reviews
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight mt-1">
          Style loved by Thousands
        </h2>
        <p className="text-xs sm:text-sm text-ash mt-2 max-w-md mx-auto">
          See why renters and wardrobe hosts choose FLOSET for every major calendar celebration.
        </p>
      </div>

      {/* Infinite Marquee Slider */}
      <div className="w-full overflow-hidden select-none">
        <div className="flex animate-marquee gap-6 whitespace-normal">
          {[...reviews, ...reviews].map((rev, idx) => (
            <div
              key={idx}
              className="w-80 sm:w-96 flex-shrink-0 bg-cream/50 p-6 rounded-2xl border border-black/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-noir/80 leading-relaxed italic">
                  “{rev.quote}”
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-noir">{rev.name}</h4>
                  <p className="text-[10px] text-ash font-medium">{rev.role}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
