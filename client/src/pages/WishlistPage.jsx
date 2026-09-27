import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage({ onSelectProduct, onNavigate }) {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b border-black/5 pb-6 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-1">
            Account &gt; Wishlist
          </span>
          <h1 className="font-display text-3xl font-extrabold text-noir tracking-tight">
            Saved Occasion Favorites ({wishlist.length})
          </h1>
        </div>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-noir hover:underline flex items-center gap-1"
        >
          <span>Explore More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-cream/30 rounded-3xl border border-black/5 p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center mx-auto text-ash">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-display text-base font-bold text-noir">Your wishlist is empty</h3>
          <p className="text-xs text-ash">
            Tap the heart on any designer dress, sherwani, or lehenga to save it for upcoming wedding dates.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-noir text-white text-xs font-bold rounded-full hover:bg-obsidian transition-colors"
          >
            Browse Outfits
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product._id || product.productId}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
