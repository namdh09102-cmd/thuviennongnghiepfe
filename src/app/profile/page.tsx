'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { 
  FileText, 
  MessageSquare, 
  Bookmark, 
  Award, 
  Flame, 
  ChevronRight, 
  Sparkles,
  LayoutGrid,
  History
} from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import PostCard from '@/components/PostCard';
import BadgeCard from '@/components/BadgeCard';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MyProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('posts');
  
  const { data: profile, isLoading } = useSWR(session?.user ? `/api/profile` : null, fetcher);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Award className="w-10 h-10 text-gray-200" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Vui lòng đăng nhập để xem hồ sơ</h2>
        <button className="bg-green-600 text-white font-black text-xs px-10 py-3.5 rounded-2xl shadow-lg shadow-green-600/20 uppercase tracking-widest">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const level = Math.floor((profile?.points || 0) / 50) + 1;
  const progressPercent = Math.round(((profile?.points || 0) % 50) / 50 * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <ProfileHeader profile={profile || session.user} isOwn={true} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Gamification */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-green-950 rounded-[32px] p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Cấp độ hiện tại</p>
                <p className="text-2xl font-black">Level {level}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-green-400">Tiến trình</span>
                <span>{profile?.points % 50 || 0} / 50 XP</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-white/40 italic">Cần thêm {50 - (profile?.points % 50 || 0)} điểm để lên cấp {level + 1}</p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/30 uppercase mb-1">Streak</p>
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-lg font-black">3 ngày</span>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-white/30 uppercase mb-1">Điểm uy tín</p>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-black">{profile?.points || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <ActivityHeatmap />

          {/* Badges Preview */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
              <span>Huy hiệu của tôi ({profile?.badges?.length || 0})</span>
              <button className="text-green-600 hover:underline">Tất cả</button>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(profile?.badges || []).slice(0, 6).map((badge: any) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
              {(!profile?.badges || profile.badges.length === 0) && (
                <div className="col-span-full py-6 text-center">
                  <p className="text-[10px] text-gray-400 italic">Chưa có huy hiệu nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Switcher */}
          <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-[24px] border border-gray-100 w-fit">
            {[
              { id: 'posts', label: 'Bài viết', icon: LayoutGrid },
              { id: 'answers', label: 'Trả lời', icon: MessageSquare },
              { id: 'saved', label: 'Đã lưu', icon: Bookmark },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-green-700 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'posts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.posts?.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {!profile?.posts?.length && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-xs text-gray-400 font-medium italic">Bạn chưa chia sẻ bài viết nào.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="space-y-4">
                {profile?.answers?.map((answer: any) => (
                  <div key={answer.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-green-100 transition-all">
                    <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      <History className="w-3.5 h-3.5" />
                      <span>Đã trả lời câu hỏi</span>
                    </div>
                    <h4 className="font-black text-gray-900 mb-3">{answer.question_title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                      &quot;{answer.content}&quot;
                    </p>
                  </div>
                ))}
                {!profile?.answers?.length && (
                  <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-xs text-gray-400 font-medium italic">Bạn chưa trả lời câu hỏi nào.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.saved_posts?.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {!profile?.saved_posts?.length && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                    <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-xs text-gray-400 font-medium italic">Bạn chưa lưu bài viết nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
