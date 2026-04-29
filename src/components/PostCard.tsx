'use client';

import React from 'react';
import { Eye, Heart, MessageSquare, Bookmark, Clock, Award, Leaf } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
  prefetch?: boolean;
}

export default function PostCard({ post, prefetch }: PostCardProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <article className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all group overflow-hidden">
      <Link href={`/posts/${post.slug}`} prefetch={prefetch}>
        <div className="relative aspect-[16/9] overflow-hidden bg-green-50">
          {post.thumbnail_url && !imgError ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              width={400}
              height={225}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-green-300 transition-transform duration-500 group-hover:scale-105">
              <Leaf className="w-12 h-12 opacity-50 animate-pulse" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 text-[10px] font-black uppercase rounded-full shadow-sm">
              {post.category?.name || 'Chưa phân loại'}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-3 md:p-5 space-y-2 md:space-y-4">
        <div className="space-y-1 md:space-y-2">
          <Link href={`/posts/${post.slug}`}>
            <h3 className="text-sm font-black text-gray-900 leading-tight group-hover:text-green-700 transition-colors line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {post.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center space-x-2">
            <div className="relative flex-shrink-0">
              <Image
                src={post.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'}
                alt={post.author?.full_name || 'Tác giả'}
                className="w-6 h-6 rounded-full bg-gray-100 object-cover"
                width={24}
                height={24}
              />
              {post.author?.is_verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                  <Award className="w-2 h-2 text-amber-500 fill-amber-500" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-gray-900 leading-none truncate">
                {post.author?.full_name || 'Người dùng'}
              </p>
              <div className="flex items-center text-[9px] text-gray-400 mt-1 space-x-1">
                <span>· {post.excerpt ? Math.ceil(post.excerpt.length / 500) : 2} phút đọc ·</span>
                <span>
                  {(() => {
                    try {
                      if (!post.published_at) return 'Vừa xong';
                      const date = new Date(post.published_at);
                      if (isNaN(date.getTime())) return 'Vừa xong';
                      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
                    } catch (e) {
                      return 'Vừa xong';
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{post.like_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{post.comment_count || 0}</span>
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
