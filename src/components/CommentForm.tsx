'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bold, Italic, Link as LinkIcon, Send, Eye, MessageSquare } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  replyTo?: string;
  initialValue?: string;
}

export default function CommentForm({ onSubmit, placeholder, replyTo, initialValue = '' }: CommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [content, setContent] = useState(initialValue);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (e) {
      console.error('Submit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    
    setContent(newText);
    textarea.focus();
  };

  return (
    <div className="relative bg-white sm:bg-transparent p-4 border border-gray-100 sm:rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all mt-4">
      {replyTo && (
        <div className="flex items-center space-x-2 mb-3 px-2 py-1 bg-green-50 rounded-lg w-fit">
          <MessageSquare className="w-3 h-3 text-green-600" />
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Phản hồi @{replyTo}</span>
        </div>
      )}

      <div className="flex items-center space-x-2 mb-3 border-b border-gray-50 pb-3">
        <button onClick={() => insertText('**', '**')} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Bold className="w-4 h-4" /></button>
        <button onClick={() => insertText('*', '*')} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><Italic className="w-4 h-4" /></button>
        <button onClick={() => insertText('[', '](url)')} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"><LinkIcon className="w-4 h-4" /></button>
        <div className="flex-1" />
        <button 
          onClick={() => setIsPreview(!isPreview)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all ${isPreview ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isPreview ? 'Sửa' : 'Xem trước'}</span>
        </button>
      </div>

      {isPreview ? (
        <div className="min-h-[80px] p-2 text-sm text-gray-700 prose prose-sm max-w-none">
          {content || <span className="text-gray-300 italic">Chưa có nội dung xem trước...</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!session) router.push('/login');
          }}
          placeholder={placeholder || "Viết bình luận của bạn..."}
          className="w-full text-sm text-gray-700 border-none focus:ring-0 resize-none min-h-[80px] p-2"
        />
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest hidden sm:inline">Ctrl + Enter để gửi nhanh</span>
        <button
          onClick={() => {
            if (!session) router.push('/login');
            else handleSubmit();
          }}
          disabled={!!isSubmitting || !!(session && !content.trim())}
          className={`bg-green-600 hover:bg-green-700 text-white font-black text-xs px-6 py-2.5 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-green-600/20 ${!session ? 'opacity-50 grayscale cursor-pointer' : ''}`}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Gửi bình luận</span>
        </button>
      </div>
    </div>
  );
}
