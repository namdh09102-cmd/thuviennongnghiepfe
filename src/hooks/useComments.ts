'use client';

import useSWRInfinite from 'swr/infinite';

export function useComments(postId: string, sortBy: string = 'newest') {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data?.length) return null;
    return `/api/posts/${postId}/comments?page=${pageIndex + 1}&sort=${sortBy}&limit=20`;
  };

  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(
    getKey,
    (url: string) => fetch(url).then(res => res.json())
  );

  const comments = data ? data.map((page: any) => page.data).flat().filter(Boolean) : [];
  const totalComments = data?.[0]?.total || comments.length;
  const isEmpty = comments.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < 20);

  const addComment = async (content: string, parentId?: string) => {
    try {
      let url = `/api/posts/${postId}/comments`;
      let method = 'POST';
      
      if (parentId) {
        url = `/api/comments/${parentId}/replies`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error('Không thể gửi bình luận');
      mutate(); 
    } catch (e) {
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const likeComment = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/${id}/like`, {
        method: 'POST',
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
