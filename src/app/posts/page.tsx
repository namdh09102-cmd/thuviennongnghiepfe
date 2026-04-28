'use client';

import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import PostCard from '@/components/PostCard';
import SkeletonCard from '@/components/SkeletonCard';
import { LayoutGrid } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/categories');
        setCategories(res.data || []);
      } catch (error) {
        setCategories([
          { id: '1', name: 'Trồng trọt', slug: 'trong-trot' },
          { id: '2', name: 'Chăn nuôi', slug: 'chan-nuoi' },
          { id: '3', name: 'Phân bón', slug: 'phan-bon' },
          { id: '4', name: 'Sâu bệnh', slug: 'sau-benh' },
        ]);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const url = selectedCategory ? `/posts?category=${selectedCategory}` : '/posts';
        const res = await axiosInstance.get(url);
        setPosts(res.data?.posts || []);
      } catch (error) {
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex items-center space-x-2 text-gray-800 border-b pb-3">
        <LayoutGrid className="h-5 w-5 text-green-600" />
        <h1 className="text-lg font-extrabold">Khám phá Danh mục</h1>
      </div>

      {loadingCats ? (
        <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-full" />
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === '' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat.slug 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div>
        {loadingPosts ? (
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
        ) : (
          <p className="text-xs text-gray-400 text-center py-10 bg-white border rounded-2xl">
            Không có bài viết nào thuộc danh mục này.
          </p>
        )}
      </div>
    </div>
  );
}
