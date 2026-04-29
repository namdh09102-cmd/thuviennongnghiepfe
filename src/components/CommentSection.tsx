'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, SortAsc, SortDesc, Loader2, RefreshCw } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  postSlug?: string;
  postId?: string;
}

export default function CommentSection({ postSlug, postId }: CommentSectionProps) {
  const postIdentifier = postId || postSlug || '';
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState('newest');
  const { 
    comments, 
    totalComments,
    isLoading, 
    isReachingEnd, 
    loadMore, 
    addComment,
    deleteComment,
    editComment,
    likeComment,
    mutate 
  } = useComments(postIdentifier, sortBy);

  const observerTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, isReachingEnd, isLoading, loadMore]);

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
          <CommentForm onSubmit={handleMainSubmit} placeholder="Chia sẻ kinh nghiệm của bạn..." />
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-6 text-center">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bạn có kinh nghiệm về chủ đề này?</p>
            <a 
              href="/login" 
              className="inline-block px-6 py-2.5 bg-green-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-green-700 transition-all shadow-sm"
            >
              Đăng nhập để bình luận
            </a>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReply={handleReplySubmit}
            onDelete={deleteComment}
            onEdit={editComment}
            onVote={likeComment}
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

        {/* Infinite scroll target */}
        <div ref={observerTarget} className="h-4 w-full" />
      </div>
    </div>
  );
}
