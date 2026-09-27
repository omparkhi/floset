import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBar({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const tickerItems = [
    'How FLOSET works: List • Set price • Ship or meet • Earn',
    'Rent designer outfits for events — sustainable & affordable',
    'Hosts earn on every rental — payout weekly',
    'Easy returns & support included',
  ];

  return (
    <div className="safe-area-top bg-black text-white pb-2 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase overflow-hidden border-b border-white/10 relative z-50 select-none">
      <div className="flex items-center">
        {/* Continuous Marquee Ticker */}
        <div className="flex items-center">
          <div className="flex animate-marquee whitespace-nowrap gap-12 sm:gap-20">
            {tickerItems.concat(tickerItems).map((text, i) => (
              <a
                key={i}
                href={text.startsWith('How FLOSET') ? '#' : '#'}
                onClick={(e) => {
                  if (text.startsWith('How FLOSET')) {
                    e.preventDefault();
                    onNavigate?.('about');
                  }
                }}
                className={`inline-block ${
                  text.includes('UP TO 30% OFF') ? 'text-neutral-300' : 'text-white'
                } hover:underline`}
              >
                {text}
              </a>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white bg-black/60 rounded-full transition-colors z-10"
          aria-label="Dismiss banner"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
