import React, { useState } from 'react';
import ProductCard from '../common/ProductCard';

export default function CategoryTabs({ products, onSelectProduct, onNavigate }) {
  const [selectedGender, setSelectedGender] = useState('Women');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const womenCategories = ['All', 'Lehengas', 'Sarees', 'Gowns', 'Dresses', 'Indo-Western'];
  const menCategories = ['All', 'Sherwanis', 'Suits', 'Kurta Sets', 'Blazers'];

  const activeCategories = selectedGender === 'Women' ? womenCategories : menCategories;

  const filteredProducts = products.filter((p) => {
    const matchesGender = p.gender === selectedGender || p.gender === 'Unisex';
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesGender && matchesCategory;
  });

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-ash">
            Browse By Wardrobe Department
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight mt-1">
            Shop by Categories
          </h2>
        </div>

        {/* Gender Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-cream rounded-full border border-black/5 self-start md:self-auto">
          {['Women', 'Men'].map((gender) => (
            <button
              key={gender}
              onClick={() => {
                setSelectedGender(gender);
                setSelectedCategory('All');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                selectedGender === gender
                  ? 'bg-noir text-white shadow-sm'
                  : 'text-noir/60 hover:text-noir'
              }`}
            >
              For {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-black/5 mb-8">
        {activeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-noir text-white'
                : 'bg-sand/70 text-noir/70 hover:bg-sand'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product._id || product.productId}
            product={product}
            onSelect={onSelectProduct}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-16 text-center text-xs text-ash">
          No outfits currently found in this category filter.
        </div>
      )}
    </section>
  );
}
