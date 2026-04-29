'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Bookmark, Share2, Eye, Globe, MessageCircle, Link as LinkIcon, X, QrCode } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface PostActionsProps {
  post: {
    id: string;
    slug: string;
    like_count: number;
    comment_count: number;
    view_count: number;
    viewCount?: number;
    likes?: string[];
    saves?: string[];
  };
}

export default function PostActions({ post }: PostActionsProps) {
  const { data: session } = useSession();
  const userId = session?.user ? (session.user as any).id : null;
  
  const [isLiked, setIsLiked] = useState(() => post.likes?.includes(userId) || false);
  const [isSaved, setIsSaved] = useState(() => post.saves?.includes(userId) || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [viewCount, setViewCount] = useState(post.viewCount || post.view_count || 0);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{message: string, action?: () => void} | null>(null);
  
  const likeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pendingLikeStatus = useRef(isLiked);
  const pendingSaveStatus = useRef(isSaved);

  useEffect(() => {
    setIsLiked(post.likes?.includes(userId) || false);
    setIsSaved(post.saves?.includes(userId) || false);
    pendingLikeStatus.current = post.likes?.includes(userId) || false;
    pendingSaveStatus.current = post.saves?.includes(userId) || false;
  }, [post.likes, post.saves, userId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts/${post.slug}/view`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.viewCount) setViewCount(data.viewCount);
        }
      } catch (e) {
        console.error('Failed to increment view');
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [post.slug]);

  const showToast = (message: string, action?: () => void) => {
    setToastMessage({ message, action });
    setTimeout(() => {
      setToastMessage((current) => current?.message === message ? null : current);
    }, 3000);
  };

  const handleLike = () => {
    if (!session) return alert('Vui lòng đăng nhập để thích bài viết!');
    
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    setLikeCount(prev => newStatus ? prev + 1 : prev - 1);
    pendingLikeStatus.current = newStatus;

    if (!newStatus) { // Unliking
      showToast('Đã bỏ thích bài viết', () => {
        // Undo unlike
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        pendingLikeStatus.current = true;
        if (likeTimeoutRef.current) clearTimeout(likeTimeoutRef.current);
      });
    }

    if (likeTimeoutRef.current) clearTimeout(likeTimeoutRef.current);
    likeTimeoutRef.current = setTimeout(async () => {
      if (pendingLikeStatus.current !== (post.likes?.includes(userId) || false)) {
        try {
          await fetch(`/api/posts/${post.slug}/like`, { method: 'POST' });
        } catch (e) {
          console.error('Like failed');
        }
      }
    }, 3000);
  };

  const handleSave = () => {
    if (!session) return alert('Vui lòng đăng nhập để lưu bài viết!');
    
    const newStatus = !isSaved;
    setIsSaved(newStatus);
    pendingSaveStatus.current = newStatus;

    if (!newStatus) { // Unsaving
      showToast('Đã bỏ lưu bài viết', () => {
        // Undo unsave
        setIsSaved(true);
        pendingSaveStatus.current = true;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      });
    } else {
      showToast('Đã lưu bài viết');
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (pendingSaveStatus.current !== (post.saves?.includes(userId) || false)) {
        try {
          await fetch(`/api/posts/${post.slug}/save`, { method: 'POST' });
        } catch (e) {
          console.error('Save failed');
        }
      }
    }, 3000);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã copy!');
    setShowShareModal(false);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    setShowShareModal(false);
  };

  const shareZalo = () => {
    window.open(`https://sp.zalo.me/share_via_web?url=${encodeURIComponent(window.location.href)}`, '_blank');
    setShowShareModal(false);
  };

  // Format numbers (e.g. 1200 -> 1.2k)
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <>
      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 sm:py-4 flex items-center justify-around sm:justify-start sm:gap-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
                      lg:fixed lg:top-1/3 lg:left-8 lg:bottom-auto lg:right-auto lg:flex-col lg:border lg:border-gray-100 lg:rounded-[32px] lg:shadow-xl lg:px-3 lg:py-6 lg:bg-white">
        
        <button 
          onClick={handleLike}
          className={`flex lg:flex-col items-center gap-1.5 lg:gap-1 transition-all group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
          <div className="p-2 lg:p-3 rounded-full lg:bg-gray-50 group-hover:bg-red-50 transition-colors relative">
            <Heart className={`w-5 h-5 lg:w-6 lg:h-6 ${isLiked ? 'fill-current animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_1]' : ''}`} />
            {isLiked && <Heart className="w-5 h-5 lg:w-6 lg:h-6 fill-current absolute top-2 left-2 lg:top-3 lg:left-3" />}
          </div>
          <span className="font-bold text-[13px] lg:text-xs">{formatNumber(likeCount)} <span className="lg:hidden">Thích</span></span>
        </button>

        <button 
          onClick={handleSave}
          className={`flex lg:flex-col items-center gap-1.5 lg:gap-1 transition-all group ${isSaved ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
        >
          <div className="p-2 lg:p-3 rounded-full lg:bg-gray-50 group-hover:bg-green-50 transition-colors">
            <Bookmark className={`w-5 h-5 lg:w-6 lg:h-6 ${isSaved ? 'fill-current' : ''}`} />
          </div>
          <span className="font-bold text-[13px] lg:text-xs"><span className="lg:hidden">Lưu bài</span></span>
        </button>
        
        <button 
          onClick={handleShare}
          className="flex lg:flex-col items-center gap-1.5 lg:gap-1 transition-all group text-gray-500 hover:text-blue-600"
        >
          <div className="p-2 lg:p-3 rounded-full lg:bg-gray-50 group-hover:bg-blue-50 transition-colors">
            <Share2 className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-[13px] lg:text-xs"><span className="lg:hidden">Chia sẻ</span></span>
        </button>

        <div className="flex lg:flex-col items-center gap-1.5 lg:gap-1 text-gray-400">
          <div className="p-2 lg:p-3 rounded-full lg:bg-gray-50">
            <Eye className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-bold text-[13px] lg:text-xs">{formatNumber(viewCount)} <span className="lg:hidden">lượt xem</span></span>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-center mb-6 text-gray-900">Chia sẻ bài viết</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <button onClick={shareFacebook} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Facebook</span>
              </button>
              <button onClick={shareZalo} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors font-black text-sm">
                  Zalo
                </div>
                <span className="text-[10px] font-bold text-gray-600">Zalo</span>
              </button>
              <button onClick={copyToClipboard} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Copy link</span>
              </button>
              <button className="flex flex-col items-center gap-2 group" onClick={() => alert('Tính năng đang phát triển')}>
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Mã QR</span>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-2">
              <input type="text" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="flex-1 bg-transparent text-xs text-gray-500 outline-none truncate font-medium" />
              <button onClick={copyToClipboard} className="text-xs font-black text-green-600 whitespace-nowrap px-3 py-1.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
            <span className="text-xs font-medium">{toastMessage.message}</span>
            {toastMessage.action && (
              <button 
                onClick={() => {
                  toastMessage.action!();
                  setToastMessage(null);
                }}
                className="text-xs font-black text-green-400 hover:text-green-300 uppercase tracking-wider"
              >
                Hoàn tác
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
