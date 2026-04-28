'use client';

import React from 'react';
import { useGamificationStore } from '../store/gamificationStore';
import { Award, Trophy } from 'lucide-react';

export default function Leaderboard() {
  const { leaderboard } = useGamificationStore();

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-3">
      <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2 pb-2 border-b">
        <Trophy className="h-4 w-4 text-amber-500" />
        <span>Bảng xếp hạng Nông dân</span>
      </h3>

      <div className="space-y-2">
        {leaderboard.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors text-xs"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`h-5 w-5 font-bold text-[10px] rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-amber-500 text-white shadow-sm' :
                index === 1 ? 'bg-slate-400 text-white shadow-sm' :
                index === 2 ? 'bg-amber-700/80 text-white shadow-sm' :
                'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>

              <span className="text-lg">{user.avatar}</span>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-800 truncate max-w-[100px]">
                  {user.username}
                </h4>
                <span className="text-[9px] text-gray-500 block">{user.role}</span>
              </div>
            </div>

            <span className="font-black text-green-700 text-[10px] bg-green-50 px-2 py-1 rounded-xl flex items-center space-x-0.5">
              <span>{user.points}</span>
              <span className="font-normal text-[8px] text-green-600">đ</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
