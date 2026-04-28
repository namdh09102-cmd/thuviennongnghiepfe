'use client';

import React from 'react';
import { Award, CheckCircle, MapPin, Calendar, FileText, Users, Edit3, UserPlus, Sprout, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileHeaderProps {
  profile: any;
  isOwn?: boolean;
}

export default function ProfileHeader({ profile, isOwn = false }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-8 group">
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paddy.png')]" />
        <div className="absolute bottom-4 right-6 flex items-center space-x-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">3 ngày liên tiếp</span>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="relative flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-8 gap-6">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative group/avatar">
              <Image 
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] md:rounded-[48px] border-8 border-white shadow-xl bg-white transition-transform group-hover/avatar:scale-105 object-cover" 
                alt={profile.full_name || 'Avatar'} 
                width={160}
                height={160}
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-blue-50">
                  <CheckCircle className="w-8 h-8 text-blue-500 fill-blue-50" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-2 pb-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  {profile.full_name}
                </h1>
                {profile.role === 'expert' && (
                  <div className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-100 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Chuyên gia</span>
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">@{profile.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pb-2">
            {isOwn ? (
              <Link 
                href="/profile/edit"
                className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white font-black text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-gray-900/10"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </Link>
            ) : (
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-black text-xs px-10 py-3.5 rounded-2xl transition-all shadow-lg shadow-green-600/20">
                <UserPlus className="w-4 h-4" />
                <span>Theo dõi</span>
              </button>
            )}
          </div>
        </div>

        {/* Extended Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-gray-50">
          <div className="lg:col-span-8 space-y-6">
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl font-medium">
              {profile.bio || 'Chưa có tiểu sử giới thiệu về bản thân.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile.region || 'Đắk Lắk'}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <Sprout className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cà phê, Sầu riêng</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gia nhập {format(new Date(profile.created_at || Date.now()), 'MM/yyyy', { locale: vi })}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center justify-between md:justify-end md:space-x-12 px-4 py-6 md:p-0 bg-gray-50 md:bg-transparent rounded-3xl md:rounded-none">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-gray-900">{profile.posts_count || 0}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Bài viết</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-green-600">{profile.points || 0}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Điểm uy tín</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-gray-900">{profile.followers_count || 0}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Người theo dõi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
