'use client';

import useSWRInfinite from 'swr/infinite';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export function useComments(postSlug: string, sortBy: string = 'newest') {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/api/posts/${postSlug}/comments?page=${pageIndex}&sort=${sortBy}&limit=20`;
  };

  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(
    getKey,
    (url: string) => fetch(url).then(res => res.json())
  );

  const comments = data ? data.flat() : [];
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 20);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postSlug}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: `post_slug=eq.${postSlug}` // This assumes we have post_slug in comments or we filter by post_id
      }, () => {
        mutate();
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

  return {
    comments,
    isLoading,
    isReachingEnd,
    loadMore: () => setSize(size + 1),
    addComment,
    mutate
  };
}
