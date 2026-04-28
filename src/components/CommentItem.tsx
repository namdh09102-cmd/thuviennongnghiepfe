'use client';

import React, { useState } from 'react';
import { ThumbsUp, Reply, MoreHorizontal, Flag, Edit, Trash2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: any;
  onReply: (content: string, parentId: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string, content: string) => Promise<void>;
  onVote?: (id: string, action: 'like' | 'unlike') => Promise<void>;
  currentUser?: any;
}

export default function CommentItem({ comment, onReply, onDelete, onEdit, onVote, currentUser }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`liked_comment_${comment.id}`) === 'true';
    }
    return false;
  });
  const [votesCount, setVotesCount] = useState(comment.votes || 0);

  const isOwner = currentUser?.id === comment.author_id;
  const isNew = (new Date().getTime() - new Date(comment.created_at).getTime()) < 5 * 60 * 1000;
  const canEdit = isOwner && isNew;
  const canDelete = isOwner || currentUser?.role === 'admin';

  const hasReplies = comment.replies && comment.replies.length > 0;
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, 3);

  const handleReplySubmit = async (content: string) => {
    await onReply(content, comment.id);
    setIsReplying(false);
    setIsExpanded(true);
  };

  const handleVote = async () => {
    if (!currentUser) return alert('Vui lòng đăng nhập để thích!');
    const action = isLiked ? 'unlike' : 'like';
    setIsLiked(!isLiked);
    setVotesCount((prev: number) => action === 'like' ? prev + 1 : Math.max(0, prev - 1));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`liked_comment_${comment.id}`, action === 'like' ? 'true' : 'false');
    }
    if (onVote) await onVote(comment.id, action);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit) {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };


  return (
    <div className="group animate-in fade-in duration-300">
      <div className="flex space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Image 
            src={comment.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
            className="w-10 h-10 rounded-2xl bg-gray-100 shadow-sm border border-white object-cover" 
            alt={comment.author?.full_name || 'Avatar'} 
            width={80}
            height={80}
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50/50 group-hover:bg-gray-50 transition-colors p-4 rounded-[24px] rounded-tl-none border border-transparent group-hover:border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-gray-900">{comment.author?.full_name}</span>
                {comment.author?.role === 'expert' && (
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-md border border-amber-100 flex items-center space-x-0.5">
                    <Award className="w-2.5 h-2.5" />
                    <span>Chuyên gia</span>
                  </span>
                )}
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: vi })}
                </span>
              </div>

              <div className="relative group/menu">
                <button className="p-1 text-gray-300 hover:text-gray-900 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl hidden group-hover/menu:block z-10 p-1 min-w-[120px]">
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-[10px] font-black text-gray-600 hover:bg-gray-50 rounded-lg uppercase tracking-widest"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                          onDelete?.(comment.id);
                        }
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg uppercase tracking-widest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const reason = prompt('Lý do báo cáo:\n1. Spam\n2. Nội dung xấu\n3. Sai thông tin');
                      if (reason) alert('Cảm ơn bạn đã báo cáo. Ban quản trị sẽ kiểm duyệt nội dung này.');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-[10px] font-black text-gray-600 hover:bg-gray-50 rounded-lg uppercase tracking-widest"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Báo cáo</span>
                  </button>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                <div className="flex space-x-2 mt-2">
                  <button type="submit" className="text-[10px] font-black uppercase text-green-600">Lưu</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-gray-400">Hủy</button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-6 mt-2 ml-2">
            <button 
              onClick={handleVote}
              className={`flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isLiked ? 'text-green-600 font-bold' : 'text-gray-400 hover:text-green-600'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{votesCount}</span>
            </button>
            
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isReplying ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Phản hồi</span>
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <CommentForm 
                onSubmit={handleReplySubmit} 
                replyTo={comment.author?.username}
                placeholder={`Trả lời ${comment.author?.full_name}...`}
              />
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && (
            <div className="mt-4 ml-6 space-y-4 border-l-2 border-gray-50 pl-6">
              {visibleReplies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  onReply={onReply}
                  onDelete={onDelete}
                  onVote={onVote}
                  currentUser={currentUser}
                />
              ))}

              {comment.replies.length > 3 && (
                <button 
                  onClick={() => setShowAllReplies(!showAllReplies)}
                  className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase tracking-widest flex items-center space-x-1 py-2"
                >
                  {showAllReplies ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Thu gọn</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Xem thêm {comment.replies.length - 3} phản hồi</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
