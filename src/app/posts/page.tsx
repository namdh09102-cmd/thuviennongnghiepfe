'use client';

import React, { useState, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import { LayoutGrid, Filter, Search } from 'lucide-react';
import PostCard from '@/components/PostCard';
import FilterTabs from '@/components/FilterTabs';
import SkeletonCard from '@/components/SkeletonCard';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PostsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: categories } = useSWRInfinite(
    (index) => index === 0 ? '/api/categories' : null,
    fetcher
  );
  
  const categoryList = Array.isArray(categories?.[0]) ? categories[0] : [];

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;
    return `/api/posts?page=${pageIndex + 1}&category=${activeCategory || ''}&limit=12`;
  };

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher);
  
  const posts = data 
    ? data.filter(page => page && Array.isArray(page.data)).map((page) => page.data).flat() 
    : [];

  const MOCK_POSTS = [
    {
      id: 'mock1',
      slug: 'ky-thuat-trong-dua-luoi-nha-mang',
      title: 'Kỹ thuật trồng dưa lưới nhà màng đạt chuẩn',
      excerpt: 'Hướng dẫn kỹ thuật trồng dưa lưới trong nhà màng đạt chuẩn cho năng suất cao.',
      thumbnail_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
      author: { full_name: 'Chuyên Gia Nông Nghiệp', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert' },
      published_at: new Date().toISOString()
    },
    {
      id: 'mock2',
      slug: 'phong-tru-dao-on-lua-he-thu',
      title: 'Biện pháp phòng trừ đạo ôn lúa hè thu',
      excerpt: 'Chi tiết các biện pháp canh tác và sử dụng thuốc BVTV hợp lý.',
      thumbnail_url: 'https://images.unsplash.com/photo-1530836361253-efad5c4ff877?auto=format&fit=crop&w=800&q=80',
      author: { full_name: 'Chuyên Gia Nông Nghiệp', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert' },
      published_at: new Date().toISOString()
    },
    {
      id: 'mock3',
      slug: 'bon-phan-npk-dung-cach',
      title: 'Hướng dẫn bón phân NPK đúng cách cho cây trồng',
      excerpt: 'Quy trình bón phân NPK theo nguyên tắc 4 đúng.',
      thumbnail_url: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25?auto=format&fit=crop&w=800&q=80',
      author: { full_name: 'Chuyên Gia Nông Nghiệp', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert' },
      published_at: new Date().toISOString()
    }
  ];

  const displayPosts = posts.length > 0 ? posts : MOCK_POSTS;

  const isReachingEnd = data && Array.isArray(data[data.length - 1]?.data) && data[data.length - 1].data.length < 12;
  
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, isReachingEnd, isValidating, setSize, size]);


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-2xl">
              <LayoutGrid className="w-6 h-6 text-green-600" />
            </div>
            <span>Cẩm nang Nhà nông</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Khám phá kho tàng kiến thức nông nghiệp từ chuyên gia hàng đầu.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs 
        categories={categoryList} 
        activeCategory={activeCategory}
        onSelectCategory={(slug) => {
          setActiveCategory(slug);
          setSize(1);
        }}
      />

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {(isLoading || isValidating) && Array(6).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {!isLoading && displayPosts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            Chưa có bài viết nào trong danh mục này
          </p>
        </div>
      )}

      {/* Load More */}
      <div ref={ref} className="h-20 flex items-center justify-center">
        {isValidating && !isLoading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
        )}
      </div>
    </div>
  );
}
