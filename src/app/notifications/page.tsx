'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckCheck, 
  MessageSquare, 
  Award, 
  CheckCircle, 
  Sparkles,
  Filter,
  Trash2,
  Calendar,
  ExternalLink,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState('all');

  const notificationsList = Array.isArray(notifications) ? notifications : (notifications?.data || []);

  const groupedNotifications = notificationsList.reduce((groups: any, n: any) => {
    const date = format(new Date(n.created_at), 'dd MMMM, yyyy', { locale: vi });
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
    return groups;
  }, {});

  const filteredNotifications = notificationsList.filter((n: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    if (filter === 'social') return ['comment_on_post', 'reply_to_comment', 'like_post', 'follow_user'].includes(n.type);
    if (filter === 'system') return ['level_up', 'badge_earned', 'post_approved', 'post_rejected', 'daily_reminder'].includes(n.type);
    return true;
  });

  // Re-group after filter
  const filteredGrouped = filteredNotifications.reduce((groups: any, n: any) => {
    const date = format(new Date(n.created_at), 'dd MMMM, yyyy', { locale: vi });
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
    return groups;
  }, {});

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment_on_post':
      case 'reply_to_comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'like_post':
        return <Bell className="w-5 h-5 text-red-500" />;
      case 'follow_user':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'expert_answer':
      case 'best_answer':
      case 'post_approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'post_rejected':
      case 'daily_reminder':
        return <Bell className="w-5 h-5 text-amber-500" />;
      case 'level_up':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'badge_earned':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLink = (notification: any) => {
    const { data, type, entity_type, entity_id } = notification;
    if (type.includes('post') || entity_type === 'post') return `/posts/${data?.post_slug || entity_id}`;
    if (type.includes('question') || entity_type === 'question') return `/hoi-dap/${data?.question_id || entity_id}`;
    if (type === 'follow_user') return `/profile/${data?.actor_username || ''}`;
    if (type.includes('badge') || type.includes('level')) return `/profile`;
    return '#';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 flex items-center space-x-3">
            <Bell className="w-8 h-8 text-green-600" />
            <span>Trung tâm thông báo</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cập nhật những hoạt động mới nhất của bạn</p>
        </div>

        <button 
          onClick={() => markAllAsRead()}
          className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl shadow-xl shadow-gray-900/10 transition-all"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-[28px] border border-gray-100 shadow-sm">
        {[
          { id: 'all', label: 'Tất cả', icon: Filter },
          { id: 'unread', label: 'Chưa đọc', icon: Bell },
          { id: 'social', label: 'Tương tác', icon: MessageSquare },
          { id: 'system', label: 'Hệ thống', icon: Sparkles },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === item.id ? 'bg-green-600 text-white shadow-md shadow-green-600/20' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-6">
        {Object.keys(filteredGrouped).length > 0 ? (
          Object.entries(filteredGrouped).map(([date, items]: [string, any]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center space-x-4 px-4">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{date}</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                {items.map((n: any) => (
                  <div 
                    key={n.id}
                    className={`group flex items-start space-x-6 p-8 hover:bg-gray-50 transition-all relative ${!n.is_read ? 'bg-green-50/20' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <Image 
                        src={n.actor?.avatar_url || n.data?.actor_avatar || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-2xl bg-gray-100 shadow-sm object-cover" 
                        alt="Avatar" 
                      />
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-gray-50">
                        {getIcon(n.type)}
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(n.created_at), 'HH:mm', { locale: vi })}</span>
                        </span>
                        {!n.is_read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] font-black text-green-600 hover:underline uppercase tracking-widest"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        <span className="font-black text-gray-900">{n.actor?.full_name || n.data?.actor_name || 'Hệ thống'}</span>
                        {' '}
                        {n.type === 'comment_on_post' && `đã bình luận bài viết "${n.data?.post_title}"`}
                        {n.type === 'reply_to_comment' && 'đã phản hồi bình luận của bạn'}
                        {n.type === 'like_post' && `đã thích bài viết của bạn: "${n.data?.post_title}"`}
                        {n.type === 'follow_user' && 'đã bắt đầu theo dõi bạn'}
                        {n.type === 'expert_answer' && `chuyên gia đã trả lời câu hỏi "${n.data?.question_title}"`}
                        {n.type === 'post_approved' && `Bài viết "${n.data?.post_title}" đã được duyệt và công khai`}
                        {n.type === 'post_rejected' && `Bài viết "${n.data?.post_title}" đã bị từ chối: ${n.data?.reason || ''}`}
                        {n.type === 'daily_reminder' && n.data?.reason}
                      </p>

                      <Link 
                        href={getLink(n)}
                        onClick={() => markAsRead(n.id)}
                        className="inline-flex items-center space-x-2 text-[10px] font-black text-green-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                      >
                        <span>Xem chi tiết</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Bell className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">Mọi thứ đều yên tĩnh</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bạn không có thông báo nào ở mục này</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
