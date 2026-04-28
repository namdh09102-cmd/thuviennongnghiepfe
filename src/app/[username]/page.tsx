'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { axiosInstance } from '@/lib/axios';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import { CheckCircle, UserPlus, UserMinus } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  role: 'FARMER' | 'EXPERT' | 'ADMIN';
  isVerifiedExpert: boolean;
  reputationPoints: number;
  posts: any[];
  _count: {
    followers: number;
    following: number;
    posts: number;
  };
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const { user: currentUser, isAuthenticated } = useAuthStore();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/users/${username}`);
        setProfile(res.data);
        setLoading(false);
      } catch (error) {
        setProfile({
          id: 'mock-id',
          username: String(username),
          role: 'EXPERT',
          isVerifiedExpert: true,
          reputationPoints: 120,
          posts: [
            {
              id: 'p1',
              title: 'Phòng trừ bệnh thối rễ trên cây sầu riêng',
              slug: 'phong-tru-thoi-re-sau-rieng',
              content: 'Bài viết chia sẻ về nguyên nhân và cách khắc phục...',
              viewCount: 450,
              likeCount: 20,
              commentCount: 5,
              tags: ['Sâu bệnh', 'Sầu riêng'],
              author: { username: String(username), role: 'EXPERT' }
            }
          ],
          _count: {
            followers: 55,
            following: 12,
            posts: 1
          }
        });
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thực hiện hành động này!');
      return;
    }

    setFollowLoading(true);
    try {
      const res = await axiosInstance.post(`/users/${username}/follow`);
      setIsFollowing(res.data.isFollowing);
      if (profile) {
        setProfile({
          ...profile,
          _count: {
            ...profile._count,
            followers: res.data.isFollowing ? profile._count.followers + 1 : profile._count.followers - 1
          }
        });
      }
    } catch (error) {
      setIsFollowing(!isFollowing);
      if (profile) {
        setProfile({
          ...profile,
          _count: {
            ...profile._count,
            followers: !isFollowing ? profile._count.followers + 1 : profile._count.followers - 1
          }
        });
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.username === username;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-32 bg-gray-200 rounded-2xl animate-pulse w-full mt-4" />
        <div className="grid grid-cols-2 gap-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-10">Không tìm thấy người dùng.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-white rounded-3xl border shadow-sm p-6 flex flex-col items-center text-center">
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

        {!isOwnProfile && (
          <button 
            onClick={handleFollow}
            disabled={followLoading}
            className={`mt-6 flex items-center space-x-1.5 text-xs font-semibold px-6 py-2 rounded-xl shadow-sm transition-all ${
              isFollowing 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-4 w-4" />
                <span>Huỷ theo dõi</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Theo dõi</span>
              </>
            )}
          </button>
        )}
      </div>

      <div>
        <h3 className="font-bold text-base text-gray-900 mb-3">Bài viết của {profile.username}</h3>
        {profile.posts && profile.posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {profile.posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
}
