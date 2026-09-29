import React, { useState } from 'react';
import { Heart, Zap, Calendar } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product, onSelect, onQuickRent }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isLiked = isInWishlist(product._id || product.productId);
  const currentPrice = product.pricing?.duration3d || product.pricing?.duration1d || 999;
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop';
  const secondaryImage = product.images?.[1] || primaryImage;
  const colourSwatches = (product.colour || '')
    .split(/[,/&]+/)
    .map((colour) => colour.trim())
    .filter(Boolean)
    .slice(0, 3);

  const colourToCss = (colour) => {
    const key = colour.toLowerCase();
    if (key.includes('gold')) return '#d9bf7a';
    if (key.includes('ivory') || key.includes('white')) return '#f4efe6';
    if (key.includes('blue')) return '#1d4f91';
    if (key.includes('black') || key.includes('midnight')) return '#161616';
    if (key.includes('red') || key.includes('ruby')) return '#b51f2b';
    if (key.includes('emerald') || key.includes('green')) return '#157047';
    if (key.includes('champagne')) return '#d6c2a3';
    if (key.includes('pink')) return '#e8a9bd';
    if (key.includes('purple') || key.includes('plum')) return '#6f3d88';
    return '#d8d8d8';
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] bg-white border border-black/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(3,6,7,0.09)] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery Showcase */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f4f3]">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
          {product.badge ? (
            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-noir shadow-sm">
              {product.badge}
            </span>
          ) : (
            <span />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-noir shadow-sm transition-all pointer-events-auto hover:scale-105 active:scale-95"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-noir/80'
              }`}
            />
          </button>
        </div>

        {/* Quick Action Overlay on Image */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickRent) {
                onQuickRent(product);
              } else {
                onSelect(product);
              }
            }}
            className="flex-1 py-2.5 px-3 bg-noir/90 hover:bg-noir backdrop-blur-md text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer border border-white/10"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Order Now</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="py-2.5 px-3 bg-white/95 hover:bg-cream backdrop-blur-md text-noir rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer border border-black/10"
          >
            <Calendar className="w-3 h-3 text-noir/70" />
            <span>Book</span>
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="flex min-h-[116px] flex-col justify-between gap-4 p-5">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ash">
            {product.category}
          </p>
          <h3 className="font-display text-lg font-bold leading-tight text-noir line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-noir/55">
            {product.size && (
              <span>
                Size <strong className="font-bold text-noir">{product.size}</strong>
              </span>
            )}
            {product.occasions?.[0] && (
              <>
                <span>•</span>
                <span>{product.occasions[0]}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-extrabold text-noir">
              ₹{currentPrice.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-ash">/ 3 days</span>
          </div>

          {colourSwatches.length > 0 && (
            <div className="flex items-center gap-1.5">
              {colourSwatches.map((colour) => (
                <span
                  key={colour}
                  title={colour}
                  className="h-5 w-5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(3,6,7,0.16)]"
                  style={{ backgroundColor: colourToCss(colour) }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
