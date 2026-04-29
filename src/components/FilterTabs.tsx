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
    <div className="relative w-full bg-gray-50/90 backdrop-blur-md z-10 md:sticky md:top-[64px]">
      <div 
        className="flex overflow-x-auto pb-2 whitespace-nowrap space-x-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}} />
        <button
          onClick={() => onSelectCategory('all')}
          className={`whitespace-nowrap pt-3 pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all relative min-h-[44px] min-w-[44px] flex items-center justify-center ${
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
            className={`whitespace-nowrap pt-3 pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all relative min-h-[44px] min-w-[44px] flex items-center justify-center ${
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
      {/* Gradient fade ở cạnh phải */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
    </div>
  );
}
