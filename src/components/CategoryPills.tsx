'use client';

import React from 'react';

const categories = [
  { id: 'all', name: 'Tất cả' },
  { id: 'trong-trot', name: 'Trồng trọt' },
  { id: 'chan-nuoi', name: 'Chăn nuôi' },
  { id: 'phan-bon', name: 'Phân bón' },
  { id: 'sau-benh', name: 'Sâu bệnh' },
  { id: 'nong-nghiep-so', name: 'Nông nghiệp số' },
];

export default function CategoryPills() {
  const [activeCategory, setActiveCategory] = React.useState('all');

  return (
    <div className="flex space-x-2 overflow-x-auto pb-3 pt-2 scrollbar-none -mx-4 px-4">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
