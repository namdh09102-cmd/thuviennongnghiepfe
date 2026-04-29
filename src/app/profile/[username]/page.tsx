'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Award, CheckCircle, MapPin, Calendar, FileText, Users, Edit3, UserPlus, UserMinus, Sprout, Bookmark, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import BadgeCard from '@/components/BadgeCard';

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  region: string;
  main_crops: string[];
  created_at: string;
  role: string;
  is_verified: boolean;
  level: number;
  levelProgress: number;
  points: number;
  stats: {
    postsCount: number;
    answersCount: number;
    followersCount: number;
    followingCount: number;
  };
  posts: any[];
  questions: any[];
  badges: any[];
}

export default function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const { data: session } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'questions' | 'saved' | 'badges'>('posts');
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Check if following
    if (session?.user) {
      fetch(`/api/users/${username}/followers`)
        .then(res => res.json())
        .then((followers: any[]) => {
          const isUserFollowing = followers.some(f => f.id === (session.user as any).id);
          setIsFollowing(isUserFollowing);
        })
        .catch(() => {});
    }
  }, [username, session]);

  useEffect(() => {
    if (activeTab === 'saved' && savedPosts.length === 0) {
      setLoadingSaved(true);
      fetch('/api/users/me/saved')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setSavedPosts(data.data);
          }
          setLoadingSaved(false);
        })
        .catch(() => {
          setLoadingSaved(false);
        });
    }
  }, [activeTab, savedPosts.length]);

  const handleFollowToggle = async () => {
    if (!session) return alert('Vui lòng đăng nhập để theo dõi');

    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
      const data = await res.json();
      setIsFollowing(data.isFollowing);
      
      // Update stats count locally
      if (profile) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followersCount: data.isFollowing ? profile.stats.followersCount + 1 : Math.max(0, profile.stats.followersCount - 1)
          }
        });
      }
    } catch (e) {
      console.error('Follow toggle failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-bold text-gray-400 italic">Không tìm thấy thông tin người dùng này.</p>
      </div>
    );
  }

  const isOwnProfile = session?.user && (session.user as any).id === profile.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-green-600 to-teal-700 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paddy.png')]" />
        </div>

        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-6 gap-6">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
              <Image 
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                className="w-32 h-32 rounded-[32px] border-8 border-white shadow-xl bg-white object-cover" 
                alt="Avatar" 
                width={120}
                height={120}
                unoptimized
              />
              <div className="space-y-1 pb-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-gray-900">{profile.full_name}</h1>
                  {profile.is_verified && <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50" />}
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">@{profile.username}</p>
              </div>
            </div>

            <div className="flex items-center pb-2">
              {isOwnProfile ? (
                <Link 
                  href="/settings/profile"
                  className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white font-black text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-gray-900/10"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </Link>
              ) : (
                <button 
                  onClick={handleFollowToggle}
                  className={`flex items-center space-x-2 font-black text-xs px-8 py-3.5 rounded-2xl transition-all shadow-md ${isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'}`}
                >
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-gray-50">
            <div className="lg:col-span-8 space-y-4">
              <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-2xl">
                {profile.bio || 'Chưa có tiểu sử giới thiệu bản thân.'}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile.region || 'Chưa thiết lập'}</span>
                </div>
                {profile.main_crops && profile.main_crops.length > 0 && (
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <Sprout className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{profile.main_crops.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Tham gia {format(new Date(profile.created_at || Date.now()), 'MM/yyyy', { locale: vi })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-4 flex items-center justify-between px-6 py-4 bg-gray-50 rounded-[24px]">
              <div className="text-center">
                <span className="block text-xl font-black text-gray-900">{profile.stats.postsCount}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Bài viết</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-gray-900">{profile.stats.answersCount}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Câu trả lời</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-gray-900">{profile.stats.followersCount}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Người theo dõi</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-black text-gray-900">{profile.stats.followingCount}</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Đang theo dõi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gamification Sidebar */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm h-fit space-y-6">
          <div>
            <h3 className="text-xs font-black text-gray-900 flex items-center space-x-2 uppercase tracking-wider">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Cấp độ nông dân</span>
            </h3>
            <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 text-white font-black rounded-2xl flex items-center justify-center text-lg shadow-md">
                Lv.{profile.level}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tiến trình thăng cấp</p>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: `${profile.levelProgress}%` }} />
                </div>
                <p className="text-[9px] font-bold text-gray-600 mt-1">{profile.points} điểm uy tín</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Danh hiệu & Huy hiệu</h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.badges.map((badge, idx) => (
                <BadgeCard key={badge.id || idx} badge={badge} />
              ))}
              {profile.badges.length === 0 && (
                <div className="col-span-full text-center py-4 text-[10px] font-bold text-gray-400 italic">
                  Chưa có huy hiệu nào
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex border-b border-gray-100 bg-white px-4 pt-4 rounded-[32px] shadow-sm border-none">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-2 px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'posts' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Bài viết</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center space-x-2 px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'questions' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Câu hỏi</span>
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center space-x-2 px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'saved' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Đã lưu</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'posts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {profile.posts.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 italic">Không có bài viết nào.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="grid grid-cols-1 gap-4">
                {profile.questions.map((q) => (
                  <div key={q.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-green-100 transition-all">
                    <h4 className="font-black text-gray-900 text-sm mb-2 hover:text-green-600 cursor-pointer">
                      {q.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{q.content}</p>
                  </div>
                ))}
                {profile.questions.length === 0 && (
                  <div className="py-20 text-center bg-white rounded-[32px] border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 italic">Không có câu hỏi nào được đặt.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingSaved ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {savedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    {savedPosts.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 italic">Chưa có bài viết nào được lưu.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
