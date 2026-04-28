'use client';

import React from 'react';
import { Badge } from '../store/gamificationStore';

interface BadgeCardProps {
  badge: Badge;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="group relative flex flex-col items-center bg-gray-50 hover:bg-green-50 p-3 rounded-2xl border border-gray-100 transition-all cursor-pointer">
      <span className="text-2xl mb-1 animate-pulse duration-1000 group-hover:scale-110 transition-transform">
        {badge.icon}
      </span>
      <span className="text-[10px] font-bold text-gray-800 text-center max-w-[70px] truncate">
        {badge.name}
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-[10px] p-2.5 rounded-xl shadow-lg z-50 animate-in fade-in duration-150 pointer-events-none">
        <span className="font-bold text-green-400 block mb-0.5">{badge.name}</span>
        <p className="text-gray-300 leading-tight">{badge.description}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
