'use client';

import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { axiosInstance } from '../lib/axios';
import CategoryPills from '../components/CategoryPills';
import PostCard from '../components/PostCard';
import PostListItem from '../components/PostListItem';
import SkeletonCard from '../components/SkeletonCard';
import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle, Layout, TrendingUp, Users, MessageSquare, Calendar } from 'lucide-react';
import AdSlot from '../components/AdSlot';
import { useAuthStore } from '../store/authStore';
import WeatherWidget from '../components/WeatherWidget';
import Leaderboard from '../components/Leaderboard';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tags: string[];
  author: {
    username: string;
    role: string;
  };
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Kỹ thuật trồng Dưa lưới trong nhà màng đạt năng suất cao',
    slug: 'ky-thuat-trong-dua-luoi-nha-mang',
    content: 'Dưa lưới là loại cây trồng có giá trị kinh tế cao. Bài viết này chia sẻ kỹ thuật chăm sóc, bón phân...',
    viewCount: 1250,
    likeCount: 45,
    commentCount: 12,
    createdAt: new Date().toISOString(),
    tags: ['Trồng trọt', 'Dưa lưới'],
    author: { username: 'expert_viet', role: 'EXPERT' }
  },
  {
    id: '2',
    title: 'Phòng trừ bệnh đạo ôn trên lúa vụ Hè Thu',
    slug: 'phong-tru-dao-on-lua-he-thu',
    content: 'Bệnh đạo ôn là mối đe dọa lớn. Hướng dẫn sử dụng chế phẩm sinh học an toàn...',
    viewCount: 890,
    likeCount: 32,
    commentCount: 8,
    createdAt: new Date().toISOString(),
    tags: ['Sâu bệnh', 'Lúa'],
    author: { username: 'farmer_minh', role: 'FARMER' }
  },
  {
    id: '3',
    title: 'Bón phân NPK thế nào cho đúng cách?',
    slug: 'bon-phan-npk-dung-cach',
    content: 'Cách tính tỷ lệ NPK phù hợp cho từng giai đoạn sinh trưởng của cây ăn quả.',
    viewCount: 2300,
    likeCount: 110,
    commentCount: 24,
    createdAt: new Date().toISOString(),
    tags: ['Phân bón'],
    author: { username: 'nongnghiep_admin', role: 'ADMIN' }
  },
  {
    id: '4',
    title: 'Mô hình chăn nuôi bò thịt công nghệ cao',
    slug: 'chan-nuoi-bo-thit-cong-nghe-cao',
    content: 'Chia sẻ kinh nghiệm xây dựng chuồng trại và khẩu phần thức ăn cho bò.',
    viewCount: 540,
    likeCount: 15,
    commentCount: 3,
    createdAt: new Date().toISOString(),
    tags: ['Chăn nuôi'],
    author: { username: 'expert_viet', role: 'EXPERT' }
  }
];

export default function Home() {
  const { ref, inView } = useInView();
  const { isAuthenticated, user } = useAuthStore();

  const fetchPosts = async ({ pageParam = 1 }) => {
    try {
      const res = await axiosInstance.get(`/posts?page=${pageParam}&limit=10`);
      if (!res.data || !res.data.posts || res.data.posts.length === 0) {
        return { posts: MOCK_POSTS, nextCursor: null };
      }
      return {
        posts: res.data.posts,
        nextCursor: res.data.pagination.page < res.data.pagination.totalPages ? res.data.pagination.page + 1 : null
      };
    } catch (error) {
      return { posts: MOCK_POSTS, nextCursor: null };
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];
  const heroPost = allPosts[0];
  const gridPosts = allPosts.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cột Trái: Danh mục & Lối tắt (Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-20 self-start space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center space-x-2">
            <Layout className="h-4 w-4 text-green-600" />
            <span>Khám phá</span>
          </h3>
          <nav className="space-y-1 text-xs font-medium">
            <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-green-50 text-green-700 transition-colors">
              <span>🏠</span>
              <span>Trang chủ</span>
            </Link>
            <Link href="/hoi-dap" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors">
              <span>❓</span>
              <span>Hỏi đáp chuyên gia</span>
            </Link>
            <Link href="/posts" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors">
              <span>📚</span>
              <span>Cẩm nang nhà nông</span>
            </Link>
            <Link href="/lich-mua-vu" className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors">
              <span>📅</span>
              <span>Lịch mùa vụ</span>
            </Link>
          </nav>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Chủ đề hot</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Lúa', 'Sầu riêng', 'Phân bón', 'Rau sạch', 'Thủy sản'].map(tag => (
              <Link key={tag} href={`/search?q=${tag}`} className="text-[11px] bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 px-2.5 py-1 rounded-lg border border-gray-100 transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Cột Giữa: Feed chính */}
      <main className="col-span-1 lg:col-span-6 space-y-4">
        {/* Khung tạo bài viết nhanh (Tinhte Style) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            U
          </div>
          <Link href="/posts/create" className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl px-4 py-2 text-left text-xs text-gray-400 cursor-pointer transition-colors">
            Bạn muốn chia sẻ điều gì hôm nay?
          </Link>
        </div>

        <div className="lg:hidden">
          <CategoryPills />
        </div>

        {status === 'pending' ? (
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse w-full" />
        ) : heroPost ? (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-900 to-teal-800 text-white shadow-md mb-4">
            <Link href={`/posts/${heroPost.slug}`} className="block relative h-48 md:h-60 w-full opacity-30">
              <Image
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=80"
                alt={heroPost.title}
                fill
                className="object-cover"
                priority
              />
            </Link>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <span className="bg-green-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                {heroPost.tags?.[0] || 'Nổi bật'}
              </span>
              <Link href={`/posts/${heroPost.slug}`}>
                <h2 className="text-base md:text-xl font-bold mt-2 leading-tight hover:text-green-400 transition-colors">
                  {heroPost.title}
                </h2>
              </Link>
              <div className="flex items-center space-x-2 mt-3 text-[10px] text-gray-300">
                <span className="font-medium">@{heroPost.author.username}</span>
                <span>•</span>
                <span>{heroPost.viewCount} lượt xem</span>
              </div>
            </div>
          </div>
        ) : null}

        <div>
          {status === 'pending'
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse mb-3" />)
            : gridPosts.map((post) => <PostListItem key={post.id} post={post} />)}
          
          <div ref={ref} className="flex justify-center pt-4">
            {isFetchingNextPage && (
              <div className="space-y-3 w-full">
                <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cột Phải: Xu hướng & Chuyên gia (Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 sticky top-20 self-start space-y-4">
        {/* Widget Nhật ký Mùa vụ */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-4 text-white shadow-sm">
          <h3 className="font-bold text-sm mb-2 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Nhật ký Mùa vụ</span>
          </h3>
          {isAuthenticated ? (
            <div className="space-y-2.5">
              <div className="bg-white/10 rounded-xl p-2.5 text-xs border border-white/20">
                <p className="font-bold text-green-100">🌱 Vườn Sầu riêng Ri6</p>
                <p className="text-[10px] opacity-90 mt-0.5">Giai đoạn: Nuôi trái non (Ngày 45)</p>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
                  <div className="bg-yellow-400 h-1.5 rounded-full w-3/4"></div>
                </div>
              </div>
              <div className="space-y-1 text-[10px] bg-black/10 rounded-xl p-2.5">
                <p className="font-semibold text-yellow-300">🔔 Việc cần làm hôm nay:</p>
                <p className="flex items-center space-x-1">• <span>Bón phân Kali trắng (200g/gốc)</span></p>
                <p className="flex items-center space-x-1">• <span>Tưới nước giữ ẩm nhẹ</span></p>
              </div>
              <button className="w-full text-center text-[10px] font-bold bg-white text-green-700 py-2 rounded-xl shadow-sm hover:bg-gray-100 transition-colors">
                Ghi nhật ký nhanh
              </button>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-xs opacity-90">Lập lịch bón phân, chăm sóc cây trồng tự động theo mùa vụ.</p>
              <Link href="/auth/login" className="inline-block mt-3 text-xs font-bold bg-white text-green-700 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-100 transition-colors">
                Đăng nhập để sử dụng
              </Link>
            </div>
          )}
        </div>

        <WeatherWidget />

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span>Đang thảo luận</span>
          </h3>
          <div className="space-y-3">
            {MOCK_POSTS.slice(0, 3).map(post => (
              <div key={post.id} className="group cursor-pointer">
                <Link href={`/posts/${post.slug}`}>
                  <h4 className="text-xs font-medium text-gray-800 group-hover:text-green-600 line-clamp-2 transition-colors">
                    {post.title}
                  </h4>
                </Link>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {post.commentCount} bình luận
                </span>
              </div>
            ))}
          </div>
        </div>

        <Leaderboard />

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-600" />
            <span>Chuyên gia online</span>
          </h3>
          <div className="space-y-3">
            {[
              { name: 'TS. Nguyễn Văn A', major: 'Bảo vệ thực vật' },
              { name: 'ThS. Trần Thị B', major: 'Đất & Phân bón' },
            ].map((expert, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-sm">
                    {expert.name.split(' ').pop()?.[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900">{expert.name}</h4>
                    <span className="text-[10px] text-gray-500">{expert.major}</span>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <AdSlot placement="sidebar" />
      </aside>
    </div>
  );
}
