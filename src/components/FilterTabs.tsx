'use client';

import React from 'react';

interface Category {
  id: string | number;
  name: string;
  slug: string;
}

interface FilterTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export default function FilterTabs({ categories, activeCategory, onSelectCategory }: FilterTabsProps) {
  const currentCat = activeCategory || 'all';

  return (
    <div className="flex overflow-x-auto scrollbar-hide relative md:sticky md:top-[64px] bg-gray-50/90 backdrop-blur-md z-10 py-2 border-b border-gray-100 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-8">
      <button
        onClick={() => onSelectCategory('all')}
        className={`whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
          currentCat === 'all'
            ? 'text-green-600'
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        Tất cả
        {currentCat === 'all' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full animate-fade-in" />
        )}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
            currentCat === cat.slug
              ? 'text-green-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {cat.name}
          {currentCat === cat.slug && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full animate-fade-in" />
          )}
        </button>
      ))}
    </div>
  );
}
