'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useInView } from 'react-intersection-observer';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PostCard from '@/components/PostCard';
import FeaturedPostCard from '@/components/FeaturedPostCard';
import FilterTabs from '@/components/FilterTabs';
import SkeletonCard from '@/components/SkeletonCard';
import { TrendingUp, Sparkles, Filter, MessageSquare, Leaf, Award } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  const activeSort = searchParams.get('sort') || 'latest';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStart = useRef(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch Categories
  const { data: categories } = useSWR('/api/categories', fetcher, { dedupingInterval: 3600000 });
  const categoryList = Array.isArray(categories) ? categories : [];

  // Fetch Trending Tags
  const { data: trendingTags } = useSWR('/api/tags/trending', fetcher, { dedupingInterval: 3600000 });
  const tagList = Array.isArray(trendingTags) ? trendingTags : [];

  // Fetch Sidebar Data
  const { data: trendingPostsData } = useSWR('/api/posts?sort=most_comments&limit=5', fetcher);
  const { data: topExperts } = useSWR('/api/users?role=expert&limit=3', fetcher);
  
  // Fetch Featured Posts
  const { data: featuredPostsData } = useSWR('/api/posts?is_featured=true&limit=2', fetcher);

  const trendingPosts = trendingPostsData?.data || [];
  const featuredPosts = featuredPostsData?.data || [];

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && (!previousPageData.data || !previousPageData.data.length)) return null;
    return `/api/posts?page=${pageIndex + 1}&category=${activeCategory}&sort=${activeSort}&limit=10`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher, {
    dedupingInterval: 300000 // Cache for 5 minutes
  });

  const posts = data 
    ? data.filter(page => page && Array.isArray(page.data)).map((page) => page.data).flat() 
    : [];

  const isInitialLoading = isLoading && posts.length === 0;
  const isReachingEnd = data && Array.isArray(data[data.length - 1]?.data) && data[data.length - 1].data.length < 10;

  const { ref, inView } = useInView({
    rootMargin: '400px',
  });

  useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, isReachingEnd, isValidating, setSize, size]);

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug && slug !== 'all') {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortSelect = (sortStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortStr);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.scrollY === 0) {
      touchStart.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    if (typeof window !== 'undefined' && window.scrollY === 0 && touchEnd - touchStart.current > 120) {
      setIsRefreshing(true);
      await setSize(1);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Feed */}
      <main 
        className="lg:col-span-8 space-y-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header Section */}
        <div className="space-y-1 relative">
          {isRefreshing && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md border border-gray-100 text-green-600 z-20 flex items-center justify-center animate-spin">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          )}
          <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Dành cho bạn hôm nay</span>
          </h1>
          <p className="text-xs font-medium text-gray-400">
            Cập nhật kiến thức nông nghiệp mới nhất từ chuyên gia và cộng đồng.
          </p>
        </div>

        {/* Mobile "Chủ đề hot" Tags (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {tagList.map((tag: any) => (
            <Link
              key={tag.id}
              href={`/search?q=${encodeURIComponent(tag.name)}`}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all bg-white text-gray-500 border border-gray-100 hover:bg-green-50 hover:text-green-600"
            >
              #{tag.name.replace(/\s+/g, '')}
            </Link>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <FilterTabs 
            categories={categoryList} 
            activeCategory={activeCategory === 'all' ? null : activeCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center space-x-6 text-[11px] font-black uppercase tracking-wider">
              <button 
                onClick={() => handleSortSelect('latest')}
                className={`transition-all relative pb-2 ${activeSort === 'latest' ? 'text-green-600 font-black' : 'text-gray-400'}`}
              >
                Mới nhất
                {activeSort === 'latest' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                )}
              </button>
              <button 
                onClick={() => handleSortSelect('hot')}
                className={`transition-all relative pb-2 ${activeSort === 'hot' ? 'text-green-600 font-black' : 'text-gray-400'}`}
              >
                Hot nhất
                {activeSort === 'hot' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                )}
              </button>
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold uppercase">
              <Filter className="w-3 h-3" />
              <span>Sắp xếp</span>
            </div>
          </div>
        </div>

        {/* Featured Posts (Only on page 1 and 'all' category) */}
        {!isInitialLoading && activeCategory === 'all' && activeSort === 'latest' && featuredPosts.length > 0 && (
          <div className="space-y-4 mb-8">
            <div className="space-y-6">
              {featuredPosts.map((post: any) => (
                <FeaturedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Post List / Skeleton / Empty State */}
        {isInitialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">Chưa có bài viết nào.</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
              Hãy là người đầu tiên chia sẻ!
            </p>
            <Link 
              href="/posts/create"
              className="px-6 py-2.5 bg-green-600 text-white text-xs font-black uppercase tracking-wider rounded-full hover:bg-green-700 transition-all shadow-sm shadow-green-600/20"
            >
              Viết bài đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        <div ref={ref} className="h-20 flex items-center justify-center">
          {isValidating && !isLoading && (
            <div className="flex items-center space-x-2 text-xs font-bold text-green-600">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          {isReachingEnd && posts.length > 0 && (
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              Bạn đã xem hết bài viết hôm nay
            </p>
          )}
        </div>

        {/* Mobile Sidebar Accordion */}
        <div className="lg:hidden mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-between p-5 font-black text-xs text-gray-900 uppercase tracking-wider bg-gray-50/50 border-b border-gray-100"
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Chủ đề & Thảo luận nổi bật</span>
            </div>
            <span className={`transform transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isSidebarOpen ? 'max-h-[1000px] opacity-100 p-6 space-y-6' : 'max-h-0 opacity-0'}`}>
            {/* Đang thảo luận */}
            <div className="space-y-3">
              <h4 className="font-black text-[10px] text-gray-400 flex items-center space-x-2 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                <span>Đang thảo luận</span>
              </h4>
              <ul className="space-y-3">
                {trendingPosts.map((post: any) => (
                  <li key={post.id} className="group">
                    <Link href={`/posts/${post.slug}`} className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 line-clamp-2">
                        {post.title}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                        {post.comment_count || 0} bình luận
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chuyên gia online */}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <h4 className="font-black text-[10px] text-gray-400 flex items-center space-x-2 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                <span>Chuyên gia online</span>
              </h4>
              <div className="space-y-3">
                {topExperts?.map((expert: any) => (
                  <div key={expert.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={expert.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'}
                        className="w-8 h-8 rounded-xl bg-gray-50 object-cover"
                        alt={expert.full_name || 'Avatar'}
                        width={32}
                        height={32}
                      />
                      <div>
                        <p className="text-xs font-black text-gray-900">{expert.full_name}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                          {expert.role === 'expert' ? 'Chuyên gia' : 'Thành viên'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20 self-start">
        {/* Đang thảo luận */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-black text-xs text-gray-900 flex items-center space-x-2 uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <span>Đang thảo luận</span>
            </h3>
          </div>
          <ul className="space-y-4">
            {trendingPosts.map((post: any) => (
              <li key={post.id} className="group cursor-pointer">
                <Link href={`/posts/${post.slug}`} className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2">
                    {post.title}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                    {post.comment_count || 0} bình luận
                  </span>
                </Link>
              </li>
            ))}
            {trendingPosts.length === 0 && (
              <p className="text-[10px] font-bold text-gray-400 text-center py-4">
                Chưa có thảo luận nào sôi nổi.
              </p>
            )}
          </ul>
        </div>

        {/* Chuyên gia online */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-black text-xs text-gray-900 flex items-center space-x-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span>Chuyên gia online</span>
            </h3>
          </div>
          <div className="space-y-4">
            {topExperts?.map((expert: any) => (
              <div key={expert.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image
                    src={expert.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'}
                    className="w-10 h-10 rounded-2xl bg-gray-50 object-cover"
                    alt={expert.full_name || 'Avatar'}
                    width={48}
                    height={48}
                  />
                  <div>
                    <p className="text-xs font-black text-gray-900">{expert.full_name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      {expert.role === 'expert' ? 'Kỹ sư/Chuyên gia' : 'Thành viên'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/profile/${expert.username}`}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Xem
                </Link>
              </div>
            ))}
            {(!topExperts || topExperts.length === 0) && (
              <p className="text-[10px] font-bold text-gray-400 text-center py-4">
                Không có chuyên gia nào đang online.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
