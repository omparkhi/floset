import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '../common/ProductCard';

export default function NewArrivalsGrid({ products, onSelectProduct, onNavigate }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-ash text-xs font-bold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Freshly Curated Vault</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight">
            New Arrival is here
          </h2>
          <p className="text-xs sm:text-sm text-ash mt-1 font-normal max-w-md">
            The latest designer bridal lehengas, silk sarees, tuxedos, and evening dresses available for rent.
          </p>
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-ash transition-colors group"
        >
          <span>View More</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
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
