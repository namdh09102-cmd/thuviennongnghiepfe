'use client';

import React from 'react';

interface ActivityHeatmapProps {
  data?: { date: string, count: number }[];
}

export default function ActivityHeatmap({ data = [] }: ActivityHeatmapProps) {
  // Mock data for 365 days if none provided
  const days = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5), // Random activity levels 0-4
    };
  });

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-100';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-500';
    return 'bg-green-700';
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Biểu đồ hoạt động</h3>
        <div className="flex items-center space-x-1">
          <span className="text-[8px] text-gray-400">Ít</span>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`w-2 h-2 rounded-sm ${getColor(i)}`} />
          ))}
          <span className="text-[8px] text-gray-400">Nhiều</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1">
        {days.map((day, i) => (
          <div 
            key={i}
            title={`${day.date}: ${day.count} hoạt động`}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm ${getColor(day.count)} transition-all hover:scale-125 cursor-help`}
          />
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-400">
        <span>Tháng 4, 2025</span>
        <span>Hôm nay</span>
      </div>
    </div>
  );
}
