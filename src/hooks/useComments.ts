'use client';

import useSWRInfinite from 'swr/infinite';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export function useComments(postSlug: string, sortBy: string = 'newest', onNewComment?: () => void) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/api/posts/${postSlug}/comments?page=${pageIndex}&sort=${sortBy}&limit=10`;
  };

  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(
    getKey,
    (url: string) => fetch(url).then(res => res.json())
  );

  const comments = data ? data.map((page: any) => page.data).flat().filter(Boolean) : [];
  const totalComments = data?.[0]?.total || 0;
  const isEmpty = comments.length === 0;
  const isReachingEnd = isEmpty || comments.length >= totalComments;

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postSlug}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments'
      }, () => {
        if (onNewComment) {
          onNewComment();
        } else {
          mutate();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postSlug, mutate]);

  const addComment = async (content: string, parentId?: string) => {
    const optimisticComment = {
      id: Math.random().toString(),
      content,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      author: { /* current user mock for optimistic */ },
      votes: 0,
    };

    // Optimistic update
    mutate([optimisticComment, ...comments], false);

    try {
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, parentId }),
      });
      if (!res.ok) throw new Error();
      mutate(); // Sync with real data
    } catch (e) {
      mutate(); // Rollback
      throw e;
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      mutate();
    } catch (e) {
      alert('Không thể xóa bình luận');
    }
  };

  const editComment = async (id: string, content: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể sửa bình luận');
      }
      mutate();
    } catch (e: any) {
      alert(e.message || 'Không thể sửa bình luận');
    }
  };

  const likeComment = async (id: string, action: 'like' | 'unlike') => {
    try {
      const res = await fetch(`/api/comments/${id}/like`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      mutate();
    } catch (e) {
      console.error('Like action failed');
    }
  };

  return {
    comments,
    totalComments,
    isLoading,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
    addComment,
    deleteComment,
    editComment,
    likeComment,
    mutate
  };
}
