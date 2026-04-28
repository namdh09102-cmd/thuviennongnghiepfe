'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import { Search as SearchIcon } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/posts/search?q=${encodeURIComponent(query)}`);
        setPosts(res.data || []);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <form onSubmit={handleSearchSubmit} className="flex space-x-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết, kỹ thuật..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
          />
          <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
        </div>
        <button 
          type="submit" 
          className="bg-green-600 text-white text-xs font-semibold px-5 rounded-2xl shadow-sm hover:bg-green-700 transition-colors"
        >
          Tìm
        </button>
      </form>

      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          {query ? `Kết quả tìm kiếm cho "${query}"` : 'Nhập từ khoá để tìm kiếm'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : query ? (
          <p className="text-xs text-gray-400 text-center py-10 bg-white border rounded-2xl">
            Không tìm thấy bài viết nào phù hợp.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs py-10">Đang tải trang tìm kiếm...</div>}>
      <SearchContent />
    </Suspense>
  );
}
