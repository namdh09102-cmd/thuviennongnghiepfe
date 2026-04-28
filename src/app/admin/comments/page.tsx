'use client';

import React from 'react';
import useSWR from 'swr';
import { Trash2, ExternalLink, MessageSquare, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminCommentsPage() {
  const { data: comments, mutate, isLoading } = useSWR('/api/admin/comments', fetcher);

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bình luận này?')) return;
    const res = await fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' });
    if (res.ok) mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Điều phối Bình luận</h1>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {comments?.map((comment: any) => (
            <div key={comment.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-start justify-between group">
              <div className="flex space-x-4 flex-1">
                <img src={comment.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} className="w-10 h-10 rounded-2xl bg-gray-100" alt="" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-gray-900">{comment.author?.full_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    {comment.content}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Link 
                      href={`/posts/${comment.post?.slug}`}
                      className="text-[10px] font-black text-green-600 hover:underline flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Bài viết: {comment.post?.title}</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-6">
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                  title="Xóa bình luận"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {isLoading && <div className="p-20 text-center text-xs font-black text-gray-400 uppercase animate-pulse">Đang tải bình luận...</div>}
          
          {!isLoading && comments?.length === 0 && (
            <div className="p-20 text-center text-sm font-medium text-gray-400 italic">
              Không có bình luận nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
