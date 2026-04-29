'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Leaf, Award, Clock, MessageSquare, Heart } from 'lucide-react';

interface FeaturedPostCardProps {
  post: any;
}

export default function FeaturedPostCard({ post }: FeaturedPostCardProps) {
  const [imgError, setImgError] = React.useState(false);

  if (!post) return null;

  return (
    <article className="md:bg-white md:rounded-[32px] md:border md:border-gray-100 md:shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all group flex flex-col md:flex-row relative overflow-hidden">
      <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-0" aria-label={post.title}></Link>
      
      {/* Thumbnail */}
      <div className="w-full md:w-1/2 relative aspect-[16/9] md:aspect-auto overflow-hidden bg-green-50 flex-shrink-0 flex items-center justify-center rounded-2xl md:rounded-none">
        {post.thumbnail_url && !imgError ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            width={800}
            height={600}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-300 min-h-[200px]">
            <Leaf className="w-16 h-16 opacity-50 animate-pulse" />
          </div>
        )}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-4 py-1.5 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
            Bài nổi bật
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 py-4 md:p-10 flex flex-col justify-center space-y-4 flex-1 z-10 pointer-events-none">
        <div className="space-y-3">
          <span className="text-green-600 text-[10px] font-black uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
            {post.category?.name || 'Chưa phân loại'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight group-hover:text-green-700 transition-colors pointer-events-auto">
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto pointer-events-auto">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src={post.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'}
                alt={post.author?.full_name || 'Tác giả'}
                className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                width={80}
                height={80}
              />
              {post.author?.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <Award className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">
                {post.author?.full_name || 'Người dùng'}
              </p>
              <div className="flex items-center text-[10px] text-gray-400 mt-1 space-x-1 font-bold">
                <Clock className="w-3 h-3" />
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

          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black text-gray-700">{post.like_count}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black text-gray-700">{post.comment_count}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
