import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import ProductCard from '../common/ProductCard';

export default function BestSellersSlider({ products, onSelectProduct, onNavigate }) {
  const bestSellers = products.filter((p) => p.isBestSeller);
  const displayList = bestSellers.length ? bestSellers : products.slice(0, 4);

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Most Rented Pieces</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight">
            Best Sellers
          </h2>
          <p className="text-xs sm:text-sm text-ash mt-1 font-normal max-w-md">
            The highest-rated wedding and evening ensembles booked continuously by our community.
          </p>
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-emerald-700 transition-colors group"
        >
          <span>See All Top Picks</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayList.map((product) => (
          <ProductCard
            key={product._id || product.productId}
            product={product}
            onSelect={onSelectProduct}
          />
        ))}
      </div>
    </section>
  );
}
