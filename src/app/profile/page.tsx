'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '../../lib/axios';
import PostCard from '../../components/PostCard';
import { CheckCircle, LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  role: 'FARMER' | 'EXPERT' | 'ADMIN';
  isVerifiedExpert: boolean;
  posts: any[];
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
}

export default function MyProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchMyProfile = async () => {
      try {
        const res = await axiosInstance.get(`/users/${user?.username}`);
        setProfile(res.data);
        setLoading(false);
      } catch (error) {
        setProfile({
          id: user?.id || '1',
          username: user?.username || 'User',
          role: user?.role || 'FARMER',
          isVerifiedExpert: user?.isVerifiedExpert || false,
          posts: [],
          _count: { followers: 0, following: 0, posts: 0 }
        });
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, [isAuthenticated, router, user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-4">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse w-full mt-4" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-3xl border shadow-sm p-6 flex flex-col items-center text-center relative">
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="h-5 w-5" />
        </button>

        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center font-extrabold text-green-700 text-2xl shadow-sm">
          {profile.username[0].toUpperCase()}
        </div>
        
        <div className="flex items-center space-x-1 mt-3">
          <h2 className="text-xl font-bold text-gray-900">@{profile.username}</h2>
          {profile.isVerifiedExpert && (
            <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-50" />
          )}
        </div>

        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 rounded-full mt-1 text-gray-600">
          {profile.role}
        </span>

        <div className="flex space-x-6 mt-6 text-sm text-gray-600">
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{profile._count.posts}</span>
            <span className="text-xs text-gray-400">Bài viết</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{profile._count.followers}</span>
            <span className="text-xs text-gray-400">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{profile._count.following}</span>
            <span className="text-xs text-gray-400">Following</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base text-gray-900 mb-3">Bài viết của bạn</h3>
        {profile.posts && profile.posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {profile.posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6 bg-white border rounded-2xl">Bạn chưa đăng bài viết nào.</p>
        )}
      </div>
    </div>
  );
}
