'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, SortAsc, SortDesc, Loader2, RefreshCw } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  postSlug: string;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState('newest');
  const { 
    comments, 
    isLoading, 
    isReachingEnd, 
    loadMore, 
    addComment,
    mutate 
  } = useComments(postSlug, sortBy);

  const [hasNewComments, setHasNewComments] = useState(false);

  const handleMainSubmit = async (content: string) => {
    if (!session) return alert('Vui lòng đăng nhập để bình luận!');
    await addComment(content);
  };

  const handleReplySubmit = async (content: string, parentId: string) => {
    if (!session) return alert('Vui lòng đăng nhập để phản hồi!');
    await addComment(content, parentId);
  };

  return (
    <div className="mt-16 pt-12 border-t border-gray-100 space-y-10">
      {/* Header & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-black text-gray-900 flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-green-600" />
          <span>Thảo luận ({comments?.length || 0})</span>
        </h3>

        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-2xl border border-gray-100 self-start sm:self-auto">
          <button 
            onClick={() => setSortBy('newest')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${sortBy === 'newest' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Mới nhất
          </button>
          <button 
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${sortBy === 'popular' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Nổi bật
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="animate-in slide-in-from-top-4 duration-500">
        {session ? (
          <CommentForm onSubmit={handleMainSubmit} placeholder="Bạn đang nghĩ gì về kiến thức này?" />
        ) : (
          <div className="bg-gradient-to-br from-green-600 to-teal-700 p-8 rounded-[32px] text-center text-white shadow-xl shadow-green-900/10">
            <h4 className="font-black text-lg mb-2">Tham gia thảo luận cùng bà con!</h4>
            <p className="text-xs text-white/70 font-medium mb-6">Đăng nhập để chia sẻ kinh nghiệm và đặt câu hỏi cho chuyên gia.</p>
            <button className="bg-white text-green-700 font-black text-xs px-10 py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>

      {/* Realtime Notification */}
      {hasNewComments && (
        <button 
          onClick={() => { mutate(); setHasNewComments(false); }}
          className="w-full py-3 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-green-100 flex items-center justify-center space-x-2 animate-bounce"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Có bình luận mới, nhấn để tải lại</span>
        </button>
      )}

      {/* Comments List */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReply={handleReplySubmit}
            currentUser={session?.user}
          />
        ))}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đang tải thảo luận...</p>
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-xs text-gray-400 font-medium italic">Chưa có thảo luận nào. Hãy là người đầu tiên chia sẻ!</p>
          </div>
        )}

        {!isReachingEnd && !isLoading && (
          <button 
            onClick={() => loadMore()}
            className="w-full py-4 text-[10px] font-black text-gray-400 hover:text-green-600 uppercase tracking-widest bg-white border border-gray-100 rounded-2xl hover:border-green-100 hover:bg-green-50/30 transition-all shadow-sm"
          >
            Xem thêm bình luận
          </button>
        )}
      </div>
    </div>
  );
}
