'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { useInView } from 'react-intersection-observer';
import { LayoutGrid, Search, RefreshCw, Leaf } from 'lucide-react';
import PostCard from '@/components/PostCard';
import PostCardSkeleton from '@/components/PostCardSkeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PostsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStart = useRef(0);

  const { data: categoriesRes } = useSWR('/api/categories', fetcher, {
    dedupingInterval: 300_000,
    revalidateOnFocus: false,
  });
  const categoryList: any[] = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && (!previousPageData.data || !previousPageData.data.length)) return null;
    const cat = activeCategory ? `&category=${activeCategory}` : '';
    const search = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
    return `/api/posts?page=${pageIndex + 1}&limit=12${cat}${search}`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher, {
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
  });

  const posts: any[] = data
    ? data.filter((p) => p && Array.isArray(p.data)).flatMap((p) => p.data)
    : [];
  const isInitialLoading = isLoading && posts.length === 0;
  const isReachingEnd =
    data &&
    Array.isArray(data[data.length - 1]?.data) &&
    data[data.length - 1].data.length < 12;

  const { ref, inView } = useInView({ rootMargin: '400px' });
  useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) setSize(size + 1);
  }, [inView, isReachingEnd, isValidating, setSize, size]);

  // Pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) touchStart.current = e.touches[0].clientY;
  };
  const handleTouchEnd = async (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    if (window.scrollY === 0 && touchEnd - touchStart.current > 120) {
      setIsRefreshing(true);
      await setSize(1);
      setIsRefreshing(false);
    }
  };

  return (
    <div 
      className="max-w-6xl mx-auto space-y-8 px-2"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100 flex items-center gap-2 text-xs font-bold text-green-600">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Đang làm mới...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-2xl">
              <LayoutGrid className="w-6 h-6 text-green-600" />
            </div>
            <span>Cẩm nang Nhà nông</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Khám phá kho tàng kiến thức nông nghiệp từ chuyên gia hàng đầu.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setActiveCategory(null); setSize(1); }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all border ${
            !activeCategory
              ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
          }`}
        >
          Tất cả
        </button>
        {categoryList.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.slug); setSize(1); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all border ${
              activeCategory === cat.slug
                ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
            }`}
          >
            {cat.emoji && <span>{cat.emoji}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(5).fill(0).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
            <Leaf className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-base font-black text-gray-900">Chưa có bài viết nào</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Chủ đề này chưa có nội dung. Vui lòng thử danh mục khác!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any, idx: number) => (
            <PostCard key={`${post.id}-${idx}`} post={post} />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-16 flex items-center justify-center pb-12">
        {isValidating && !isInitialLoading && (
          <div className="flex items-center gap-1.5">
            {[0, 0.15, 0.3].map((delay, i) => (
              <span
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        )}
        {isReachingEnd && posts.length > 0 && (
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            ✓ Bạn đã xem hết bài viết
          </p>
        )}
      </div>
    </div>
  );
}
