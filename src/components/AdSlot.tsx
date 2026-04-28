'use client';

import React from 'react';

interface AdSlotProps {
  placement: 'home' | 'post' | 'sidebar';
}

export default function AdSlot({ placement }: AdSlotProps) {
  const isHome = placement === 'home';
  const isSidebar = placement === 'sidebar';

  return (
    <div className={`bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden ${
      isHome ? 'p-6 my-6' : isSidebar ? 'p-3 my-3' : 'p-4 my-4'
    }`}>
      <span className="absolute top-2 right-2 text-[8px] font-bold text-gray-400 bg-gray-200/80 px-1.5 py-0.5 rounded">Tài trợ</span>
      
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
          NPK
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-800">Phân bón NPK Siêu Tăng Trưởng</h4>
          <p className="text-[10px] text-gray-500 mt-0.5">Giúp cây ra rễ cực mạnh, xanh lá dày.</p>
          <a 
            href="https://shopee.vn" 
            target="_blank" 
            rel="nofollow noopener noreferrer"
            className="inline-block mt-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm transition-colors"
          >
            Mua Ngay (Affiliate)
          </a>
        </div>
      </div>
    </div>
  );
}
