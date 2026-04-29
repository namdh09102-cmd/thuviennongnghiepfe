'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Award, CheckCircle, MapPin, Calendar, FileText, Users, Edit3, UserPlus, UserMinus, Sprout, Bookmark, HelpCircle, UploadCloud, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import BadgeCard from '@/components/BadgeCard';

const PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 
  'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk', 
  'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 
  'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 
  'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 
  'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 
  'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const EXPERTISE_AREAS = ["Lúa nước", "Rau màu", "Cây ăn trái", "Thủy sản", "Chăn nuôi"];

export interface ProfileData {
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
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    region: '',
    main_crops: [] as string[],
    avatar_url: ''
  });

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setEditForm({
          full_name: data.full_name || '',
          bio: data.bio || '',
          region: data.region || data.location || '',
          main_crops: data.main_crops || data.expertise || [],
          avatar_url: data.avatar_url || ''
        });
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
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        const data = await res.json();
        // Update profile state
        if (profile) {
          setProfile({
            ...profile,
            full_name: data.full_name || editForm.full_name,
            bio: data.bio || editForm.bio,
            region: data.region || editForm.region,
            main_crops: data.main_crops || editForm.main_crops,
            avatar_url: data.avatar_url || editForm.avatar_url
          });
        }
        setShowEditModal(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Cập nhật thất bại');
      }
    } catch (e) {
      alert('Đã xảy ra lỗi khi cập nhật');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setEditForm(prev => ({ ...prev, avatar_url: base64 }));
      
      try {
        const res = await fetch('/api/users/me/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar_url: base64 })
        });
        if (res.ok) {
          const data = await res.json();
          setEditForm(prev => ({ ...prev, avatar_url: data.avatar_url }));
        }
      } catch (e) {
        console.error('Tải ảnh thất bại');
      }
    };
    reader.readAsDataURL(file);
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
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white font-black text-xs px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-gray-900/10"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
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
            {activeTab === 'badges' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {(profile.badges || []).map((badge: any) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
                {(profile.badges || []).length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 italic">Chưa có huy hiệu nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowEditModal(false)} 
              className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-green-600" />
              <span>Chỉnh sửa hồ sơ</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Drag & Drop */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ảnh đại diện</label>
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-[32px] p-6 flex flex-col items-center justify-center gap-4 hover:border-green-500 hover:bg-green-50/30 transition-all cursor-pointer group bg-gray-50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    };
                    input.click();
                  }}
                >
                  {editForm.avatar_url ? (
                    <div className="relative">
                      <Image 
                        src={editForm.avatar_url} 
                        alt="Avatar Preview" 
                        width={96} 
                        height={96} 
                        className="w-24 h-24 rounded-[24px] object-cover border-4 border-white shadow-md"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-[24px] opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        Thay đổi
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-[24px] bg-white shadow-inner flex items-center justify-center border border-gray-100 text-gray-300">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-700">Kéo thả ảnh hoặc nhấn vào đây</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">Hỗ trợ PNG, JPG, GIF (Tối đa 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Tên hiển thị & Bio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên hiển thị</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Họ tên của bạn"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-green-600" />
                    <span>Tỉnh / Thành phố</span>
                  </label>
                  <select
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Chọn khu vực</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiểu sử (Bio)</label>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, 200) })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                  placeholder="Giới thiệu ngắn về bản thân..."
                  maxLength={200}
                />
                <span className="text-[9px] font-bold text-gray-400 block text-right mr-1">{editForm.bio.length}/200 ký tự</span>
              </div>

              {/* Chuyên môn / Multi-select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Sprout className="w-3.5 h-3.5 text-green-600" />
                  <span>Lĩnh vực chuyên môn</span>
                </label>
                <div className="flex flex-wrap gap-2 bg-gray-50 p-4 rounded-[24px] border border-gray-100">
                  {EXPERTISE_AREAS.map((area) => {
                    const isSelected = editForm.main_crops.includes(area);
                    return (
                      <button
                        type="button"
                        key={area}
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            main_crops: isSelected 
                              ? prev.main_crops.filter(c => c !== area)
                              : [...prev.main_crops, area]
                          }));
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          isSelected 
                            ? 'bg-green-600 text-white border-green-600 shadow-sm shadow-green-600/20' 
                            : 'bg-white text-gray-400 border-gray-100 hover:border-green-200 hover:text-gray-600'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full bg-gray-900 hover:bg-green-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingProfile ? 'Đang lưu hồ sơ...' : 'Lưu thay đổi'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
