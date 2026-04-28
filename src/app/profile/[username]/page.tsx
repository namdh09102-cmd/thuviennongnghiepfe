import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import PostCard from '@/components/PostCard';
import { Award, CheckCircle, MapPin, Calendar, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import JsonLd from '@/components/JsonLd';

async function getProfile(username: string) {
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <JsonLd data={personSchema} />
      
      {/* Profile Header */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="h-32 bg-gradient-to-r from-green-600 to-teal-700" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <img 
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                className="w-32 h-32 rounded-[32px] border-4 border-white shadow-lg bg-white" 
                alt={profile.full_name} 
              />
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
                </div>
              )}
            </div>
            <button className="bg-green-600 text-white font-black text-xs px-8 py-3 rounded-2xl hover:bg-green-700 transition-all">
              Theo dõi
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
                <span>{profile.full_name}</span>
                {profile.role === 'expert' && <Award className="w-5 h-5 text-amber-500" />}
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">@{profile.username}</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
              {profile.bio || 'Chưa có tiểu sử.'}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{profile.region || 'Việt Nam'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Tham gia {format(new Date(profile.created_at), 'MMMM yyyy', { locale: vi })}</span>
              </div>
            </div>

            <div className="flex items-center space-x-12 pt-6 border-t border-gray-50">
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-gray-900">{profile.posts?.length || 0}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase">Bài viết</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-green-600">{profile.points || 0}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase">Điểm uy tín</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-gray-900">0</span>
                <span className="text-[9px] font-black text-gray-400 uppercase">Người theo dõi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="space-y-6">
        <h2 className="text-lg font-black text-gray-900 flex items-center space-x-2 ml-4">
          <FileText className="w-5 h-5 text-green-600" />
          <span>Bài viết của {profile.full_name}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
          {profile.posts?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
              <p className="text-xs text-gray-400 font-medium italic">Chưa có bài viết nào được đăng tải.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
