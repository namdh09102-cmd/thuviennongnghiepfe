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
    fetcher
  );

  const notifications = data || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
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
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' });
    mutate();
  };

  const markAllAsRead = async () => {
    await fetch(`/api/notifications/mark-all`, { method: 'POST' });
    mutate();
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    mutate
  };
}
