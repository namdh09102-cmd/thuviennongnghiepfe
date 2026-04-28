'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Eye } from 'lucide-react';

interface PostCardProps {
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

export default function PostCard({ post }: PostCardProps) {
  const imageUrl = `https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=500&q=60`;

  return (
    <div className="group flex flex-col border rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all duration-300">
      <Link href={`/posts/${post.slug}`} className="relative h-40 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {post.tags && post.tags[0] && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
            {post.tags[0]}
          </span>
        )}
      </Link>

      <div className="flex flex-col p-3 flex-1 justify-between">
        <div>
          <Link href={`/posts/${post.slug}`}>
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
              {post.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {post.content}
          </p>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between border-t pt-2 text-gray-400 text-[10px]">
            <span className="font-medium text-gray-600 truncate max-w-[80px]">
              @{post.author.username}
            </span>
            
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-0.5">
                <Eye className="h-3 w-3" />
                <span>{post.viewCount}</span>
              </span>
              <span className="flex items-center space-x-0.5">
                <Heart className="h-3 w-3" />
                <span>{post.likeCount}</span>
              </span>
              <span className="flex items-center space-x-0.5">
                <MessageCircle className="h-3 w-3" />
                <span>{post.commentCount}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
