'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

interface PostListItemProps {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    tags: string[];
    author: {
      username: string;
      role: string;
    };
  };
}

export default function PostListItem({ post }: PostListItemProps) {
  // Fallback image
  const imageUrl = `https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80`;
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md ml-2">Mod</span>;
      case 'EXPERT':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md ml-2">Chuyên Gia</span>;
      default:
        return null;
    }
  };

  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header: Avatar + Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-base shadow-sm">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-semibold text-sm text-gray-900 hover:text-green-600 cursor-pointer">
                {post.author.username}
              </span>
              {getRoleBadge(post.author.role)}
            </div>
            <span className="text-[11px] text-gray-400 flex items-center mt-0.5">
              {post.tags?.[0] && (
                <>
                  <span className="text-green-600 font-medium mr-1 hover:underline cursor-pointer">#{post.tags[0]}</span>
                  <span className="mx-1.5">•</span>
                </>
              )}
              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        
        <button className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-50 transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Body: Title + Excerpt */}
      <div className="space-y-2 mb-3">
        <Link href={`/posts/${post.slug}`}>
          <h2 className="font-bold text-base text-gray-900 hover:text-green-600 leading-snug transition-colors cursor-pointer">
            {post.title}
          </h2>
        </Link>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Media (Optional) */}
      <Link href={`/posts/${post.slug}`} className="block relative h-48 sm:h-64 w-full rounded-xl overflow-hidden mb-4 border border-gray-50">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover hover:scale-[1.02] transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Footer: Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-gray-500 text-xs font-medium">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1.5 hover:text-red-500 transition-colors group">
            <Heart className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>{post.likeCount}</span>
          </button>
          
          <button className="flex items-center space-x-1.5 hover:text-green-600 transition-colors group">
            <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>{post.commentCount}</span>
          </button>
          
          <button className="flex items-center space-x-1.5 hover:text-blue-500 transition-colors group">
            <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>

        <button className="hover:text-amber-500 transition-colors group">
          <Bookmark className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </article>
  );
}
