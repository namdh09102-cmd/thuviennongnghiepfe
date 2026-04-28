'use client';

import React, { Suspense } from 'react';
import HomePageContent from '@/components/HomePageContent';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
