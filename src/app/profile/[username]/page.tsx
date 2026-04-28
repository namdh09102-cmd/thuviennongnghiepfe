import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
import { Award, CheckCircle, MapPin, Calendar, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import JsonLd from '@/components/JsonLd';
import ProfileHeader from '@/components/ProfileHeader';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import BadgeCard from '@/components/BadgeCard';

async function getProfile(username: string) {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      posts(
        *,
        author:profiles(username, full_name, avatar_url, is_verified),
        category:categories(name, slug)
      )
    `)
    .eq('username', username)
    .single();

  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const profile = await getProfile(params.username);
  if (!profile) return { title: 'Người dùng không tồn tại' };

  return {
    title: `${profile.full_name} (@${profile.username}) | Thuviennongnghiep`,
    description: profile.bio || `Hồ sơ nông dân Thuviennongnghiep của ${profile.full_name}.`,
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    alternateName: profile.username,
    description: profile.bio,
    image: profile.avatar_url,
    jobTitle: profile.role,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <JsonLd data={personSchema} />
      
      <ProfileHeader profile={profile} isOwn={false} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ActivityHeatmap />
          
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
              <span>Huy hiệu đạt được</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {(profile.badges || []).slice(0, 6).map((badge: any) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
              {(!profile.badges || profile.badges.length === 0) && (
                <div className="col-span-full py-6 text-center">
                  <p className="text-[10px] text-gray-400 italic">Chưa có huy hiệu nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2 mb-8">
              <FileText className="w-5 h-5 text-green-600" />
              <span>Bài viết của {profile.full_name}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.posts?.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
              {profile.posts?.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 font-medium italic">Chưa có bài viết nào được đăng tải.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
