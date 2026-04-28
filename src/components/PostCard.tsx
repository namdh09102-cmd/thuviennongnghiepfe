'use client';

import React from 'react';
import { Eye, Heart, MessageSquare, Bookmark, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PostCardProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    thumbnail_url: string;
    category: { name: string; slug: string };
    author: { username: string; full_name: string; avatar_url: string; is_verified?: boolean };
    published_at: string;
    view_count: number;
    like_count: number;
    comment_count: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all group overflow-hidden">
      <Link href={`/posts/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnail_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-[10px] font-black uppercase rounded-full shadow-sm">
              {post.category?.name || 'Chưa phân loại'}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Link href={`/posts/${post.slug}`}>
            <h3 className="text-sm font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
              {post.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center space-x-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'}
                alt={post.author?.full_name || 'Tác giả'}
                className="w-8 h-8 rounded-full bg-gray-100"
              />
              {post.author?.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <Award className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-900 leading-none">
                {post.author?.full_name || 'Người dùng'}
              </p>
              <div className="flex items-center text-[9px] text-gray-400 mt-1 space-x-1">
                <Clock className="w-2.5 h-2.5" />
                <span>
                  {post.published_at 
                    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: vi })
                    : 'Vừa xong'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400">
            <div className="flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{post.like_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{post.comment_count}</span>
            </div>
            <button className="hover:text-green-600 transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
