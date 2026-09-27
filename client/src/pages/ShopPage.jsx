import React, { useState, useEffect } from 'react';
import { Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { api } from '../services/api';
import { demoProducts } from '../data/demoProducts';

export default function ShopPage({ initialFilters = {}, onSelectProduct }) {
  const [products, setProducts] = useState(demoProducts);
  const [loading, setLoading] = useState(false);

  const [gender, setGender] = useState(initialFilters.gender || 'all');
  const [category, setCategory] = useState(initialFilters.category || 'all');
  const [occasion, setOccasion] = useState(initialFilters.occasion || 'all');
  const [size, setSize] = useState('all');
  const [sort, setSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialFilters.gender) setGender(initialFilters.gender);
    if (initialFilters.category) setCategory(initialFilters.category);
    if (initialFilters.occasion) setOccasion(initialFilters.occasion);
    if (initialFilters.filter === 'best-sellers') setSort('price_desc');
    if (initialFilters.filter === 'new-arrivals') setSort('newest');
  }, [initialFilters]);

  useEffect(() => {
    let active = true;

    api.products.getAll({
      gender,
      category,
      occasion,
      size,
      sort,
      maxPrice: maxPrice < 10000 ? maxPrice : undefined
    })
      .then((data) => {
        if (active) setProducts(data.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gender, category, occasion, size, sort, maxPrice]);

  const clearAllFilters = () => {
    setGender('all');
    setCategory('all');
    setOccasion('all');
    setSize('all');
    setSort('newest');
    setMaxPrice(10000);
  };

  const categories = [
    'All',
    'Lehengas',
    'Sarees',
    'Gowns',
    'Dresses',
    'Indo-Western',
    'Sherwanis',
    'Kurta Sets',
    'Suits',
    'Blazers'
  ];

  const occasions = [
    'All',
    'Wedding',
    'Reception',
    'Party',
    'Birthday',
    'Date',
    'Photoshoot',
    'College Event'
  ];

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="mb-8 border-b border-black/5 pb-6">
        <div className="text-[11px] font-bold tracking-wider text-ash uppercase mb-1">
          Home &gt; Fashion Rental Catalogue
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight">
            Explore All Outfits
          </h1>
          <p className="text-xs text-ash">
            Showing <strong className="text-noir font-bold">{products.length}</strong> available designer rental pieces
          </p>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between p-3 bg-cream rounded-xl">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 text-xs font-bold text-noir"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({gender !== 'all' ? 1 : 0} active)</span>
          </button>
          {(gender !== 'all' || category !== 'all' || occasion !== 'all') && (
            <button onClick={clearAllFilters} className="text-xs text-red-600 font-semibold underline">
              Clear All
            </button>
          )}
        </div>

        {/* Desktop Filter Sidebar */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-cream/40 p-5 rounded-2xl border border-black/5 self-start`}>
          <div className="flex items-center justify-between pb-3 border-b border-black/10">
            <span className="font-display text-sm font-bold text-noir flex items-center gap-1.5">
              <Filter className="w-4 h-4" /> Filter Outfits
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-ash hover:text-noir font-semibold underline"
            >
              Reset
            </button>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-2">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['all', 'Women', 'Men'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase transition-colors ${
                    gender === g
                      ? 'bg-noir text-white'
                      : 'bg-white border border-black/10 text-noir/70 hover:bg-cream'
                  }`}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c.toLowerCase())}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category.toLowerCase() === c.toLowerCase()
                      ? 'bg-noir text-white font-bold'
                      : 'hover:bg-cream text-noir/80'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Occasions */}
          <div>
            <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-2">
              Occasion
            </label>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {occasions.map((o) => (
                <button
                  key={o}
                  onClick={() => setOccasion(o === 'All' ? 'all' : o)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    occasion === o || (o === 'All' && occasion === 'all')
                      ? 'bg-noir text-white font-bold'
                      : 'hover:bg-cream text-noir/80'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-2">
              Size
            </label>
            <div className="grid grid-cols-4 gap-1">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s === 'All' ? 'all' : s)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    size === s || (s === 'All' && size === 'all')
                      ? 'bg-noir text-white'
                      : 'bg-white border border-black/10 text-noir/70 hover:bg-cream'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Max Rental Price Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-[11px] font-bold text-ash uppercase tracking-wider">
                Max Rental (3-Day)
              </label>
              <span className="text-xs font-bold text-noir">
                ₹{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-noir cursor-pointer"
            />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort Controls */}
          <div className="flex items-center justify-between bg-sand/40 px-4 py-2.5 rounded-xl text-xs">
            <span className="text-ash font-medium">
              Filtered collection
            </span>

            <div className="flex items-center gap-2">
              <span className="text-ash font-medium hidden sm:inline">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-black/10 rounded-lg px-2.5 py-1 text-xs font-bold text-noir focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Rental Price: Low to High</option>
                <option value="price-high">Rental Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid or Loader */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-cream rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.productId}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3 bg-cream/30 rounded-2xl p-8 border border-black/5">
              <p className="font-display text-base font-bold text-noir">
                No outfits match your chosen filters
              </p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Try expanding your price range or clearing category and size filters to view more of our collection.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-5 py-2 bg-noir text-white text-xs font-bold rounded-full hover:bg-obsidian"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
