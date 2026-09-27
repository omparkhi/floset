import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function SearchModal({ isOpen, onClose, onSelectProduct, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.products.getAll({ search: query });
        setResults(res.products || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const popularTags = [
    'Bridal Lehenga',
    'Sabyasachi',
    'Silk Saree',
    'Jodhpur Sherwani',
    'Tuxedo',
    'Cocktail Gown',
    'Kurta Set',
    'Wedding',
    'Reception'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-noir/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-black/10 gap-3">
          <Search className="w-5 h-5 text-noir/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search occasion outfits (e.g. Lehenga, Sherwani, Tuxedo, Saree)..."
            className="w-full bg-transparent text-sm text-noir placeholder-noir/40 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-noir/50 hover:text-noir hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        {!query && (
          <div className="p-6">
            <p className="text-xs font-bold tracking-widest text-ash uppercase mb-3">
              Popular Rental Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-full bg-cream hover:bg-sand text-xs font-medium text-noir/80 hover:text-noir transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="py-8 text-center text-xs text-ash">Searching FLOSET vault...</div>
            ) : results.length > 0 ? (
              results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-cream/60 transition-colors cursor-pointer group"
                >
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-14 h-16 object-cover rounded-lg bg-sand flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 text-[10px] text-ash font-bold uppercase">
                      <span>{product.category}</span>
                      <span>•</span>
                      <span>{product.gender}</span>
                      <span>•</span>
                      <span>Size {product.size}</span>
                    </div>
                    <h4 className="text-xs font-bold text-noir group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs font-semibold text-noir/80 mt-0.5">
                      From ₹{product.pricing?.duration3d?.toLocaleString()} / 3 days
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-noir/30 group-hover:text-noir group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-ash">
                No outfits found matching "{query}". Try searching by category or occasion.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
