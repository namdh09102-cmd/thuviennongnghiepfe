'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageSquare, Send, ChevronDown, User } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  postSlug: string;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const { data: session } = useSession();
  const { data: comments, mutate } = useSWR(`/api/posts/${postSlug}/comments`, fetcher);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!session) return alert('Vui lòng đăng nhập!');
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment, parentId }),
      });
      if (res.ok) {
        setNewComment('');
        mutate();
      }
    } catch (e) {
      console.error('Comment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h3 className="text-xl font-black text-gray-900 flex items-center space-x-2 mb-8">
        <MessageSquare className="w-6 h-6 text-green-600" />
        <span>Bình luận ({comments?.length || 0})</span>
      </h3>

      {/* Form bình luận */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                {session.user?.name?.[0].toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-grow space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ ý kiến của bạn..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi bình luận</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-8 text-center mb-10 border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium mb-4">Bạn cần đăng nhập để tham gia thảo luận</p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-xl transition-all">
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Danh sách bình luận */}
      <div className="space-y-6">
        {comments?.map((comment: Comment) => (
          <div key={comment.id} className="group">
            <div className="flex space-x-4">
              <img
                src={comment.author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                alt={comment.author.full_name}
                className="h-10 w-10 rounded-full bg-gray-100"
              />
              <div className="flex-grow">
                <div className="bg-gray-50 group-hover:bg-gray-100/50 transition-colors p-4 rounded-2xl rounded-tl-none">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-gray-900">{comment.author.full_name}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
                
                <div className="flex items-center space-x-4 mt-2 ml-2">
                  <button className="text-[10px] font-black text-gray-500 hover:text-green-600 uppercase tracking-wider">Thích</button>
                  <button className="text-[10px] font-black text-gray-500 hover:text-green-600 uppercase tracking-wider">Phản hồi</button>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-8 space-y-4 border-l-2 border-gray-50 pl-6">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <img
                          src={reply.author.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reply'}
                          alt={reply.author.full_name}
                          className="h-8 w-8 rounded-full bg-gray-100"
                        />
                        <div className="flex-grow bg-gray-50/50 p-3 rounded-2xl rounded-tl-none">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-gray-900">{reply.author.full_name}</span>
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: vi })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments?.length === 0 && (
          <div className="text-center py-10">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        )}
      </div>
    </div>
  );
}
