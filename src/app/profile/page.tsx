'use client';

import React from 'react';
import { useGamificationStore } from '../../store/gamificationStore';
import BadgeCard from '../../components/BadgeCard';
import { Award, Flame, MessageSquare, ClipboardCheck, Sparkles } from 'lucide-react';

export default function UserProfilePage() {
  const { currentUser, addPoints } = useGamificationStore();

  // Tính Level theo công thức cơ bản: Level = Floor(Points / 50) + 1
  const level = Math.floor(currentUser.points / 50) + 1;
  const pointsToNextLevel = 50 - (currentUser.points % 50);
  const progressPercent = Math.round(((currentUser.points % 50) / 50) * 100);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-green-700 to-emerald-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute right-0 top-0 opacity-5 text-[120px] font-black rotate-12 select-none">
          🌱
        </div>

        <div className="text-5xl md:text-6xl bg-white/10 backdrop-blur-md h-20 w-20 rounded-full flex items-center justify-center border border-white/20 shadow-inner animate-bounce duration-1000">
          {currentUser.avatar}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-xl font-black">{currentUser.username}</h1>
          <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-400 text-emerald-950 rounded-full shadow-sm flex items-center space-x-0.5">
              <Sparkles className="h-3 w-3" />
              <span>Cấp {level}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/15 text-emerald-100 rounded-full border border-white/10">
              {currentUser.role}
            </span>
          </div>

          {/* Thanh cấp độ */}
          <div className="mt-4 max-w-xs mx-auto md:mx-0">
            <div className="flex items-center justify-between text-[9px] font-bold text-emerald-100 mb-1">
              <span>Tiến trình cấp {level + 1}</span>
              <span>{currentUser.points % 50}/50</span>
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden border border-white/5">
              <div style={{ width: `${progressPercent}%` }} className="bg-yellow-400 h-full shadow-lg transition-all duration-500"></div>
            </div>
            <span className="text-[8px] text-yellow-300 mt-1 block">Cần thêm {pointsToNextLevel} điểm để lên cấp.</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm px-5 py-4 rounded-2xl border border-white/10 text-center shadow-md">
          <span className="text-[9px] font-bold text-green-200 uppercase tracking-wider">Điểm hoạt động</span>
          <span className="block text-3xl font-black text-yellow-300 mt-0.5">{currentUser.points}</span>
          <button
            onClick={() => {
              addPoints(1);
              alert('Bạn được +1 điểm đăng nhập hàng ngày!');
            }}
            className="text-[8px] font-bold mt-2 px-2.5 py-1 bg-white text-emerald-950 rounded-lg hover:bg-yellow-400 transition-colors duration-200"
          >
            Điểm danh +1đ
          </button>
        </div>
      </div>

      {/* Huy hiệu (Badges) */}
      <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-4">
        <h2 className="text-sm font-black text-gray-900 flex items-center space-x-2">
          <Award className="h-4.5 w-4.5 text-yellow-500" />
          <span>Huy hiệu của tôi ({currentUser.badges.length})</span>
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {currentUser.badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Hoạt động & Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <Flame className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] font-bold text-gray-400 uppercase">Bài viết</span>
              <span className="text-base font-black text-gray-800">{currentUser.activitiesCount.posts}</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+10đ/bài</span>
        </div>

        <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] font-bold text-gray-400 uppercase">Câu trả lời</span>
              <span className="text-base font-black text-gray-800">{currentUser.activitiesCount.answers}</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+5đ/lượt</span>
        </div>

        <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <ClipboardCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] font-bold text-gray-400 uppercase">Hữu ích nhất</span>
              <span className="text-base font-black text-gray-800">{currentUser.activitiesCount.bestAnswers}</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+15đ/lượt</span>
        </div>
      </div>
    </div>
  );
}
