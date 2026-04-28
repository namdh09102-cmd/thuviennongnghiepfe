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
  return (
    <div className="flex overflow-x-auto pb-4 scrollbar-hide space-x-2 sticky top-[60px] bg-gray-50/90 backdrop-blur-md z-10 py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onSelectCategory(null)}
        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
          activeCategory === null
            ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 scale-105'
            : 'bg-white text-gray-500 border border-gray-100 hover:border-green-200'
        }`}
      >
        Tất cả
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeCategory === cat.slug
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/20 scale-105'
              : 'bg-white text-gray-500 border border-gray-100 hover:border-green-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
