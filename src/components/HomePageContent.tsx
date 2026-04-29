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
import PostCardSkeleton from '@/components/PostCardSkeleton';
import {
  TrendingUp,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Flame,
  Clock,
  RefreshCw,
  Leaf,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ─── Skeleton for hero ────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="relative w-full aspect-[16/7] md:aspect-[21/8] rounded-[32px] overflow-hidden bg-gray-100 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.5s_infinite]" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
        <div className="h-4 bg-gray-200/70 rounded-full w-24" />
        <div className="h-8 bg-gray-200/70 rounded-xl w-3/4" />
        <div className="h-4 bg-gray-200/50 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

// ─── Category Pill Skeleton ────────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="h-9 w-24 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      ))}
    </div>
  );
}

// ─── Sidebar Skeleton ─────────────────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-gray-100 rounded-lg w-full" />
            <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  const activeSort = searchParams.get('sort') || 'latest';

  const touchStart = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── API fetches ──────────────────────────────────────────────────────────────
  const { data: categoriesRes, isLoading: catsLoading } = useSWR('/api/categories', fetcher, {
    dedupingInterval: 300_000,
    revalidateOnFocus: false,
  });
  const categoryList: any[] = Array.isArray(categoriesRes?.data) ? categoriesRes.data : [];

  const { data: featuredRes, isLoading: heroLoading } = useSWR(
    '/api/posts?is_featured=true&limit=1',
    fetcher,
    { dedupingInterval: 120_000, revalidateOnFocus: false }
  );
  const featuredPost = featuredRes?.data?.[0] || null;

  const { data: trendingRes } = useSWR('/api/posts?sort=most_comments&limit=5', fetcher, {
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
  });
  const trendingPosts: any[] = trendingRes?.data || [];

  // ── Infinite feed ────────────────────────────────────────────────────────────
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && (!previousPageData.data || !previousPageData.data.length)) return null;
    const cat = activeCategory !== 'all' ? `&category=${activeCategory}` : '';
    return `/api/posts?page=${pageIndex + 1}&limit=10&sort=${activeSort}${cat}`;
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
    data[data.length - 1].data.length < 10;

  const { ref, inView } = useInView({ rootMargin: '400px' });
  useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) setSize(size + 1);
  }, [inView, isReachingEnd, isValidating, setSize, size]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    slug === 'all' ? params.delete('category') : params.set('category', slug);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const setSort = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', s);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

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
      className="max-w-7xl mx-auto px-4 py-6 space-y-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100 flex items-center gap-2 text-xs font-bold text-green-600">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Đang làm mới...</span>
        </div>
      )}

      {/* ── BLOCK A: TVNN EXPERTS (Stories Style) ──────────────────────────── */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-green-600" /> Chuyên gia TVNN
          </h2>
          <span className="text-[10px] font-bold text-green-600 cursor-pointer hover:underline uppercase tracking-wider">Xem tất cả</span>
        </div>
        
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 flex-nowrap scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Card 1: Tạo câu hỏi */}
          <Link href="/hoi-dap" className="flex-shrink-0 w-24 h-36 rounded-2xl bg-gradient-to-br from-green-600 to-teal-500 p-2.5 flex flex-col justify-between text-white shadow-md cursor-pointer group relative overflow-hidden">
            <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-sm shadow-sm">
              +
            </div>
            <span className="text-[10px] font-black leading-tight">Tạo câu hỏi</span>
          </Link>
          
          {/* Mock Expert Cards */}
          {[
            { name: 'GS.TS Nguyễn Văn A', color: 'from-amber-500 to-orange-600', title: 'Chia sẻ về Sầu Riêng' },
            { name: 'Kỹ sư Trần Văn B', color: 'from-sky-500 to-indigo-600', title: 'Xử lý phèn lúa' },
            { name: 'TS. Lê Thị C', color: 'from-rose-500 to-pink-600', title: 'Nuôi tôm thẻ' },
            { name: 'Chuyên gia Mai D', color: 'from-emerald-500 to-teal-600', title: 'Trồng rau thủy canh' },
          ].map((expert, idx) => (
            <div key={idx} className={`flex-shrink-0 w-24 h-36 rounded-2xl bg-gradient-to-br ${expert.color} p-2.5 flex flex-col justify-between text-white shadow-md relative group overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center font-black text-xs text-gray-800 overflow-hidden border border-white/40 shadow-sm relative">
                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Expert${idx}`} alt={expert.name} fill className="object-cover" />
              </div>
              <div className="relative z-10">
                <span className="text-[7px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded">Chuyên gia</span>
                <p className="text-[9px] font-black mt-0.5 leading-tight line-clamp-2">{expert.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section>
        {heroLoading ? (
          <HeroSkeleton />
        ) : featuredPost ? (
          <FeaturedPostCard post={featuredPost} />
        ) : (
          /* Static hero banner khi chưa có featured post */
          <div className="relative w-full aspect-[16/7] md:aspect-[21/8] rounded-[32px] overflow-hidden bg-gradient-to-br from-green-700 via-teal-600 to-emerald-500 flex items-end">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
            <div className="relative z-10 p-8 md:p-12 space-y-4 w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                <Sparkles className="w-3 h-3" />
                Thư Viện Nông Nghiệp
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-2xl">
                Kiến thức canh tác từ chuyên gia Việt Nam
              </h1>
              <p className="text-sm text-white/80 max-w-lg font-medium">
                Cập nhật kỹ thuật trồng trọt, phòng trừ sâu bệnh và công nghệ nông nghiệp mới nhất.
              </p>
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-black text-xs px-5 py-2.5 rounded-full hover:bg-green-50 transition-all shadow-lg"
              >
                Khám phá ngay <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── MAIN LAYOUT ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT: Feed (70%) ──────────────────────────────────────────────── */}
        <main className="lg:col-span-8 space-y-6">
          {/* Category Pills */}
          <div className="space-y-1">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-green-600" /> Chủ đề
            </h2>
            {catsLoading ? (
              <CategorySkeleton />
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 flex-nowrap md:flex-wrap md:overflow-visible md:pb-0 md:px-0 md:mx-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`
                  .flex::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {/* "Tất cả" pill */}
                <button
                  onClick={() => setCategory('all')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all border ${
                    activeCategory === 'all'
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
                  }`}
                >
                  Tất cả
                </button>
                {categoryList.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
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
            )}
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-6">
              {[
                { key: 'latest', label: 'Mới nhất', Icon: Clock },
                { key: 'hot', label: 'Hot nhất', Icon: Flame },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`relative flex items-center gap-1.5 pb-2 text-[11px] font-black uppercase tracking-wider transition-all ${
                    activeSort === key ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                  {activeSort === key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-gray-300 font-bold uppercase">
              {posts.length > 0 ? `${posts.length} bài viết` : ''}
            </span>
          </div>

          {isInitialLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {Array(6).fill(0).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[32px] border border-gray-100 shadow-sm space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center animate-bounce">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-base font-black text-gray-900">Chưa có bài viết nào</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                {activeCategory !== 'all'
                  ? 'Chủ đề này chưa có bài viết. Hãy thử chủ đề khác!'
                  : 'Hãy là người đầu tiên chia sẻ kiến thức!'}
              </p>
              <div className="flex gap-3">
                {activeCategory !== 'all' && (
                  <button
                    onClick={() => setCategory('all')}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider rounded-full transition-all"
                  >
                    Xem tất cả
                  </button>
                )}
                <Link
                  href="/posts/create"
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-wider rounded-full transition-all shadow-md shadow-green-600/20"
                >
                  Viết bài đầu tiên
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Part 1: 2-Column Grid on Mobile & Desktop for top posts (e.g., first 4 posts) */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {posts.slice(0, 4).map((post: any, idx: number) => (
                  <PostCard key={`grid-${post.id}-${idx}`} post={post} prefetch={idx < 2} />
                ))}
              </div>

              {/* Part 2: Quick View Timeline for the remaining posts (from post index 4 onwards) */}
              {posts.length > 4 && (
                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 pt-4 border-t border-gray-50">
                    <Clock className="w-4 h-4 text-green-600" /> Xem nhanh
                  </h3>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {posts.slice(4).map((post: any, idx: number) => (
                      <Link 
                        href={`/posts/${post.slug}`} 
                        key={`timeline-${post.id}-${idx}`}
                        className="flex gap-4 py-4 group items-start"
                      >
                        {/* Left Timeline Bullet */}
                        <div className="relative flex flex-col items-center flex-shrink-0 mt-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 border border-green-200 shadow-sm" />
                          <div className="w-0.5 bg-gray-100 absolute top-2 bottom-[-32px] left-[3px]" />
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                          <h4 className="text-[13px] font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-green-600 transition-colors">
                            {post.title}
                          </h4>
                          <div className="flex items-center text-[10px] text-gray-400 font-bold gap-2">
                            <span className="text-green-600 uppercase tracking-wider font-black text-[9px]">{post.category?.name || 'Chưa phân loại'}</span>
                            <span>·</span>
                            <span>{post.author?.full_name || 'Thành viên'}</span>
                          </div>
                        </div>

                        {/* Compact Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-green-50 flex-shrink-0 relative border border-gray-50 shadow-sm">
                          {post.thumbnail_url ? (
                            <Image
                              src={post.thumbnail_url}
                              alt={post.title}
                              fill
                              sizes="64px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-green-200">
                              <Leaf className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Infinite scroll trigger / Load more */}
          <div ref={ref} className="h-16 flex items-center justify-center">
            {isValidating && !isInitialLoading && (
              <div className="flex items-center gap-2 text-xs font-bold text-green-600">
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
                ✓ Bạn đã xem hết bài viết hôm nay
              </p>
            )}
          </div>
        </main>

        {/* ── RIGHT: Sidebar (30%) — Desktop only ───────────────────────────── */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-20 self-start">
          {/* Trending Posts */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-3">
              <TrendingUp className="w-4 h-4 text-green-600" /> Đang thảo luận nhiều
            </h3>
            {trendingPosts.length === 0 ? (
              <SidebarSkeleton />
            ) : (
              <ul className="space-y-4">
                {trendingPosts.map((post: any, i: number) => (
                  <li key={post.id || i}>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="flex gap-3 group"
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50">
                        {post.thumbnail_url ? (
                          <Image
                            src={post.thumbnail_url}
                            alt={post.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-green-50 flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-green-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {post.comment_count || 0} bình luận
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Category Quick Links */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 border-b border-gray-50 pb-3">
              <Leaf className="w-4 h-4 text-green-600" /> Chủ đề nổi bật
            </h3>
            {catsLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {categoryList.slice(0, 6).map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full text-left flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === cat.slug
                        ? 'bg-green-50 text-green-700'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.emoji || '🌿'}</span>
                      {cat.name}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Banner */}
          <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-green-900/20 space-y-3">
            <Sparkles className="w-8 h-8 text-white/80" />
            <h4 className="font-black text-base leading-tight">Tham gia cộng đồng Nhà nông</h4>
            <p className="text-xs text-white/75 leading-relaxed">
              Đặt câu hỏi, chia sẻ kinh nghiệm và nhận tư vấn từ chuyên gia.
            </p>
            <Link
              href="/hoi-dap"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-black text-xs px-5 py-2.5 rounded-full hover:bg-green-50 transition-all mt-2"
            >
              Hỏi chuyên gia <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* ── MOBILE: Trending accordion at bottom ──────────────────────────────── */}
      {trendingPosts.length > 0 && (
        <div className="lg:hidden bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" /> Đang thảo luận nhiều
          </h3>
          <ul className="space-y-3">
            {trendingPosts.slice(0, 3).map((post: any) => (
              <li key={post.id}>
                <Link href={`/posts/${post.slug}`} className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800 line-clamp-2">{post.title}</span>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                    <MessageSquare className="w-2.5 h-2.5" />
                    {post.comment_count || 0} bình luận
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
