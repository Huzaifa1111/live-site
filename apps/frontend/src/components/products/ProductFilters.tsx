// apps/frontend/src/components/products/ProductFilters.tsx
'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string | number;
  showFeaturedFilter?: boolean;
  onFilterChange: (filters: {
    category?: string | number;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  showFeaturedFilter = true,
  onFilterChange,
}: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [featured, setFeatured] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value });
  };

  const handleCategoryChange = (categoryId: string | number) => {
    onFilterChange({ category: categoryId === 'all' ? undefined : categoryId });
  };

  const handlePriceChange = () => {
    onFilterChange({
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    });
  };

  const handleFeaturedChange = (checked: boolean) => {
    setFeatured(checked);
    onFilterChange({ featured: checked });
  };

  const clearFilters = () => {
    setSearch('');
    setPriceRange({ min: '', max: '' });
    setFeatured(false);
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm font-plus-jakarta-sans overflow-hidden relative group">
      {/* Decorative Emerald Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-[60px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity duration-1000"></div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-center space-x-3 text-emerald-950 font-black uppercase tracking-widest py-4 px-6 bg-emerald-50/50 rounded-full transition-all mb-6 border border-emerald-100"
      >
        <Filter className="w-4 h-4" />
        <span className="text-[10px]">Product Filters</span>
      </button>

      <div className={`${showFilters ? 'block' : 'hidden lg:block'} space-y-10`}>
        {/* Search */}
        <div className="relative">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">
            Search Products
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-[13px] font-medium placeholder-gray-300"
            />
          </div>
        </div>

        <div className="border-t border-gray-50 pt-10">
          {/* Category Filter */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 flex items-center">
              Categories
              <span className="ml-auto w-8 h-[1px] bg-emerald-200"></span>
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`block w-full text-left px-5 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.3)]' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`block w-full text-left px-5 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${selectedCategory?.toString() === category.id.toString() ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.3)]' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                >
                  <span className="flex items-center">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-10">
          {/* Price Range */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 flex items-center">
              Price Range
              <span className="ml-auto w-8 h-[1px] bg-emerald-200"></span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  onBlur={handlePriceChange}
                  placeholder="MIN"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-center focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-300"
                />
              </div>
              <div className="space-y-2">
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  onBlur={handlePriceChange}
                  placeholder="MAX"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-center focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Filter */}
        {showFeaturedFilter && (
          <div className="border-t border-gray-50 pt-10">
            <label htmlFor="featured" className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => handleFeaturedChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`h-6 w-12 rounded-full transition-all duration-500 flex items-center p-1 ${featured ? 'bg-emerald-600' : 'bg-gray-100'}`}>
                  <div className={`h-4 w-4 bg-white rounded-full transition-all duration-500 shadow-md ${featured ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
              <span className="ml-4 text-[11px] font-black uppercase tracking-widest text-emerald-950 group-hover:text-emerald-600 transition-colors">
                Featured Items
              </span>
            </label>
          </div>
        )}

        {/* Clear Filters */}
        <div className="pt-6">
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 hover:text-emerald-600 transition-all group/clear"
          >
            <X className="w-3 h-3 mr-3 group-hover:rotate-90 transition-transform" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}