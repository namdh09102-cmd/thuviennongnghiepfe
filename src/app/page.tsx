'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import PostCard from '@/components/PostCard';
import FilterTabs from '@/components/FilterTabs';
import SkeletonCard from '@/components/SkeletonCard';
import { TrendingUp, Layout, Sparkles, Filter } from 'lucide-react';

const Leaderboard = dynamic(() => import('@/components/Leaderboard'), { ssr: false });
const WeatherWidget = dynamic(() => import('@/components/WeatherWidget'), { ssr: false });

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState('latest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStart = useRef(0);
  
  // Fetch Categories
  const { data: categories } = useSWRInfinite(
    (index) => index === 0 ? '/api/categories' : null,
    fetcher
  );

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;
    return `/api/posts?page=${pageIndex + 1}&category=${activeCategory || ''}&sort=${activeSort}&limit=20`;
  };

  const categoryList = Array.isArray(categories?.[0]) ? categories[0] : [];

  const { data, size, setSize, isLoading, isValidating, error } = useSWRInfinite(getKey, fetcher);
  
  const posts = data 
    ? data.filter(page => page && Array.isArray(page.data)).map((page) => page.data).flat() 
    : [];

  if (error) {
    console.error('SWR Error:', error);
  }
  const isReachingEnd = data && Array.isArray(data[data.length - 1]?.data) && data[data.length - 1].data.length < 20;
  
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, isReachingEnd, isValidating, setSize, size]);

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

        {/* Filters */}
        <div className="space-y-4">
          <FilterTabs 
            categories={categoryList} 
            activeCategory={activeCategory}
            onSelectCategory={(slug) => {
              setActiveCategory(slug);
              setSize(1);
            }}
          />
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center space-x-6 text-[11px] font-black uppercase tracking-wider">
              <button 
                onClick={() => setActiveSort('latest')}
                className={`transition-all ${activeSort === 'latest' ? 'text-green-600 border-b-2 border-green-600 pb-2' : 'text-gray-400'}`}
              >
                Mới nhất
              </button>
              <button 
                onClick={() => setActiveSort('hot')}
                className={`transition-all ${activeSort === 'hot' ? 'text-green-600 border-b-2 border-green-600 pb-2' : 'text-gray-400'}`}
              >
                Hot nhất
              </button>
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-[10px] font-bold uppercase">
              <Filter className="w-3 h-3" />
              <span>Sắp xếp</span>
            </div>
          </div>
        </div>

        {/* Post List / Empty State */}
        {posts.length === 0 && !isLoading && !isValidating ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-gray-900 mb-1">Hãy là người đầu tiên chia sẻ!</h3>
            <p className="text-xs text-gray-400 font-medium max-w-xs">
              Không tìm thấy bài viết nào trong danh mục này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {(isLoading || isValidating) && Array(4).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
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
        {/* Mobile Widgets (Hidden on Desktop) */}
        <div className="lg:hidden mt-8 space-y-6">
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-1">
            <div className="flex-shrink-0 w-[280px]">
              <WeatherWidget />
            </div>
            <div className="flex-shrink-0 w-[280px] bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h3 className="font-black text-xs text-gray-900 flex items-center space-x-2 uppercase">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Xu hướng</span>
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  { tag: '#SauRiengRi6', count: '1.2k bài viết' },
                  { tag: '#PhanBonHuuCo', count: '850 bài viết' },
                  { tag: '#LúaĐôngXuân', count: '2.4k bài viết' },
                ].map((trend, i) => (
                  <li key={i} className="flex flex-col group cursor-pointer">
                    <span className="text-[11px] font-black text-gray-800 group-hover:text-green-600 transition-colors">
                      {trend.tag}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">{trend.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0 w-[280px]">
              <Leaderboard />
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20 self-start">
        <WeatherWidget />
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-black text-xs text-gray-900 flex items-center space-x-2 uppercase">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Xu hướng nông nghiệp</span>
            </h3>
          </div>
          <ul className="space-y-4">
            {[
              { tag: '#SauRiengRi6', count: '1.2k bài viết' },
              { tag: '#PhanBonHuuCo', count: '850 bài viết' },
              { tag: '#LúaĐôngXuân', count: '2.4k bài viết' },
            ].map((trend, i) => (
              <li key={i} className="flex flex-col group cursor-pointer">
                <span className="text-[11px] font-black text-gray-800 group-hover:text-green-600 transition-colors">
                  {trend.tag}
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{trend.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <Leaderboard />
      </aside>
    </div>
  );
}
