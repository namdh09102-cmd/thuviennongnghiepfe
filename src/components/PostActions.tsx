'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface PostActionsProps {
  post: {
    id: string;
    slug: string;
    like_count: number;
    comment_count: number;
  };
}

export default function PostActions({ post }: PostActionsProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);

  useEffect(() => {
    // Tự động tăng view sau 10s
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/posts/${post.slug}/view`, { method: 'POST' });
      } catch (e) {
        console.error('Failed to increment view');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [post.slug]);

  const handleLike = async () => {
    if (!session) return alert('Vui lòng đăng nhập để thích bài viết!');
    
    try {
      const res = await fetch(`/api/posts/${post.slug}/like`, { method: 'POST' });
      if (res.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (e) {
      console.error('Like failed');
    }
  };

  const handleSave = async () => {
    if (!session) return alert('Vui lòng đăng nhập để lưu bài viết!');
    
    try {
      const res = await fetch(`/api/posts/${post.slug}/save`, { method: 'POST' });
      if (res.ok) {
        setIsSaved(!isSaved);
      }
    } catch (e) {
      console.error('Save failed');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Thư viện Nông nghiệp',
          text: `Xem bài viết: ${post.slug}`,
          url: window.location.href,
        });
      } catch (e) {
        console.error('Error sharing');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết vào bộ nhớ tạm!');
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 my-8 sticky bottom-0 bg-white/80 backdrop-blur-md px-4 sm:relative sm:bg-transparent sm:px-0">
      <div className="flex items-center space-x-6">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-all ${isLiked ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-red-500'}`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-bold text-sm">{likeCount}</span>
        </button>
        
        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold text-sm">{post.comment_count}</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={handleSave}
          className={`p-2 rounded-full transition-all ${isSaved ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        
        <button 
          onClick={handleShare}
          className="p-2 rounded-full text-gray-400 hover:bg-gray-50 transition-all"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
