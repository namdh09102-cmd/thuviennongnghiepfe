'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink, MessageSquare, Award, CheckCircle, User, Sparkles } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment_on_post':
      case 'reply_to_comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'answer_to_question':
      case 'best_answer':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'level_up':
        return <Sparkles className="w-4 h-4 text-yellow-500" />;
      case 'badge_earned':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLink = (notification: any) => {
    const { data, type } = notification;
    if (type.includes('post')) return `/posts/${data.post_slug}`;
    if (type.includes('question')) return `/hoi-dap/${data.question_id}`;
    if (type.includes('badge') || type.includes('level')) return `/profile`;
    return '#';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all relative group"
      >
        <Bell className={`w-5 h-5 ${isOpen ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-900'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-4 w-full sm:w-[400px] bg-white sm:rounded-[32px] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300 flex flex-col h-full sm:h-auto max-h-[100dvh] sm:max-h-[500px]">
          {/* Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Thông báo</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => markAllAsRead()}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors" 
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-2 text-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {notifications.map((n: any) => (
              <Link 
                key={n.id}
                href={getLink(n)}
                onClick={() => {
                  if (!n.is_read) markAsRead(n.id);
                  setIsOpen(false);
                }}
                className={`flex items-start space-x-4 p-5 hover:bg-gray-50 transition-colors group ${!n.is_read ? 'bg-green-50/30' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={n.data?.actor_avatar || 'https://api.dicebear.com/7.x/avataaars/svg'} className="w-10 h-10 rounded-2xl bg-gray-100" alt="" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-50">
                    {getIcon(n.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-black text-gray-900">{n.data?.actor_name}</span>
                    {' '}
                    {n.type === 'comment_on_post' && `đã bình luận bài viết "${n.data?.post_title}"`}
                    {n.type === 'reply_to_comment' && 'đã phản hồi bình luận của bạn'}
                    {n.type === 'answer_to_question' && `đã trả lời câu hỏi "${n.data?.question_title}"`}
                    {n.type === 'best_answer' && 'đánh dấu câu trả lời của bạn là hữu ích nhất'}
                    {n.type === 'level_up' && `Chúc mừng! Bạn đã lên cấp ${n.data?.level}`}
                    {n.type === 'badge_earned' && `Bạn đã nhận được huy hiệu "${n.data?.badge_name}"`}
                    {n.type === 'post_approved' && `Bài viết "${n.data?.post_title}" đã được duyệt`}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 ring-4 ring-green-100" />
                )}
              </Link>
            ))}

            {!isLoading && notifications.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Bell className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không có thông báo mới</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Link 
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="p-4 bg-gray-50 text-center text-[10px] font-black text-gray-400 hover:text-green-600 uppercase tracking-widest transition-colors border-t border-gray-100"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}
