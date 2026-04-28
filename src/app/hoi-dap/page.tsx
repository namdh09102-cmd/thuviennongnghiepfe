'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import ChatWidget from '../../components/ChatWidget';

interface Author {
  id: string;
  username: string;
  role: string;
  isVerifiedExpert?: boolean;
}

interface PostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  tags: string[];
  author: Author;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function QAPage() {
  const { isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/posts');
      // Nếu backend trả về mảng posts
      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else if (res.data && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      }
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError('Không thể tải danh sách câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      if (Array.isArray(res.data)) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setNewCategory(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt câu hỏi!');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post('/posts', {
        title: newTitle,
        content: newTitle, // Dùng tạm title làm content cho câu hỏi nhanh
        categoryId: newCategory || undefined,
        status: 'PUBLISHED'
      });

      if (res.data) {
        setNewTitle('');
        fetchPosts(); // Tải lại danh sách
      }
    } catch (err: any) {
      console.error('Failed to create post:', err);
      alert('Đăng câu hỏi thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-5 rounded-3xl shadow-md">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <HelpCircle className="h-6 w-6" />
          <span>Hỏi Đáp Cùng Chuyên Gia</span>
        </h1>
        <p className="text-xs text-green-100 mt-1">
          Gặp khó khăn trong canh tác? Đặt câu hỏi để nhận tư vấn trực tiếp từ chuyên gia.
        </p>
      </div>

      <form onSubmit={handleAsk} className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm space-y-3">
        <textarea
          placeholder="Mô tả tình trạng cây trồng của bạn (ví dụ: cây bị đốm lá, rụng trái...)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 resize-none h-20"
          required
          disabled={loading}
        />
        <div className="flex justify-between items-center">
          <select 
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 font-medium"
            disabled={loading}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Đăng câu hỏi'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex space-x-2 text-xs font-semibold text-gray-500">
          <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl">Mới nhất</span>
        </div>

        {posts.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400 text-xs">
            Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
          </div>
        )}

        {posts.map((q) => (
          <Link href={`/posts/${q.slug}`} key={q.id} className="block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start space-x-3 hover:border-green-300 transition-colors duration-200">
            <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center bg-green-100 text-green-700`}>
              <MessageCircle className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-relaxed">
                {q.title}
              </h3>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {q.tags?.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-[9px] font-medium px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-700">{q.author?.username}</span>
                  <span>•</span>
                  <span>{new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <span className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{q.commentCount || 0} thảo luận</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <ChatWidget />
    </div>
  );
}
