'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useNotifications() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data, mutate, isLoading } = useSWR(
    userId ? `/api/notifications` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const notificationsList = Array.isArray(data) ? data : (data?.data || []);
  const unreadCount = notificationsList.filter((n: any) => !n.is_read).length;

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}-${Date.now()}-${Math.random()}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload: any) => {
        mutate();
        // Browser Notification / Toast logic could go here
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Thông báo mới từ Thuviennongnghiep', {
            body: payload.new.type, // Could be more descriptive
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, mutate]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      mutate();
    } catch (e) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all`, { method: 'PATCH' });
      mutate();
    } catch (e) {
      console.error('Failed to mark all as read');
    }
  };

  // SSE Stream integration (optional alternative to Supabase Realtime)
  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource('/api/notifications/stream');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        mutate();
        // Toast logic
      }
    };

    return () => eventSource.close();
  }, [userId, mutate]);

  return {
    notifications: notificationsList,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    mutate
  };
}
