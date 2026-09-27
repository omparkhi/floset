import React from 'react';

export default function InfiniteTicker() {
  const items = [
    'DESIGNED TO MOVE',
    'MADE TO LAST',
    'OCCASION READY',
    'ZERO COMMITMENT',
    'FLOSET RENTALS',
    'SUSTAINABLE LUXURY',
    '100% UV SANITIZED',
    'DOORSTEP DELIVERY',
    'PEER-TO-PEER WARDROBE',
    'EARN FROM YOUR CLOSET',
    'PRE-DRY CLEANED'
  ];

  return (
    <div className="w-full bg-noir text-white py-4 overflow-hidden border-y border-white/10 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 px-4">
            <span className="font-display text-sm sm:text-base font-extrabold tracking-widest text-white uppercase">
              {text}
            </span>
            <span className="text-emerald-400 text-xs">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
