'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Award, CheckCircle, HelpCircle, User, ThumbsUp, 
  ArrowLeft, Save, MessageSquare, Clock 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest'>('upvotes');

  useEffect(() => {
    fetchQuestion();
  }, [params.id]);

  const fetchQuestion = async () => {
    try {
      const res = await fetch(`/api/questions/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQuestion(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvoteQuestion = async () => {
    if (!session) return alert('Vui lòng đăng nhập để upvote');
    try {
      const res = await fetch(`/api/questions/${params.id}/upvote`, { method: 'POST' });
      if (res.ok) {
        fetchQuestion();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpvoteAnswer = async (ansId: string) => {
    if (!session) return alert('Vui lòng đăng nhập để upvote');
    try {
      const res = await fetch(`/api/answers/${ansId}/upvote`, { method: 'POST' });
      if (res.ok) {
        fetchQuestion();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptAnswer = async (ansId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/answers/${ansId}/accept`, { method: 'PUT' });
      if (res.ok) {
        fetchQuestion();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert('Vui lòng đăng nhập để trả lời');
    if (!answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/questions/${params.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent })
      });
      
      if (res.ok) {
        setAnswerContent('');
        fetchQuestion();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto" />
        <p className="text-sm font-bold text-gray-500">Không tìm thấy câu hỏi.</p>
        <Link href="/hoi-dap" className="inline-flex items-center space-x-2 text-xs font-black text-green-600 uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Link>
      </div>
    );
  }

  // Sorting Answers logic
  const sortedAnswers = [...(question.answers || [])].sort((a: any, b: any) => {
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    
    if (sortBy === 'upvotes') {
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const isOwner = session?.user && (session.user as any).id === question.authorId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
      <Link href="/hoi-dap" className="inline-flex items-center space-x-2 text-[10px] font-black text-gray-400 hover:text-gray-700 uppercase tracking-widest transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại hỏi đáp</span>
      </Link>

      {/* Question Card */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 relative">
        <div className="flex flex-wrap items-center gap-2">
          {question.status === 'answered' && (
            <span className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              <span>Đã có đáp án</span>
            </span>
          )}
          {question.tags?.map((t: string) => (
            <span key={t} className="text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
          {question.title}
        </h1>

        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {question.content}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-50">
          <div className="flex items-center space-x-3">
            <Image 
              src={question.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
              alt="Avatar" 
              width={36} 
              height={36} 
              className="w-9 h-9 rounded-full bg-gray-50 object-cover" 
              unoptimized
            />
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-black text-gray-900">{question.author?.full_name}</span>
                {question.author?.is_verified && <Award className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />}
              </div>
              <span className="text-[9px] text-gray-400 font-bold uppercase flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{question.createdAt ? format(new Date(question.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'Gần đây'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleUpvoteQuestion}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border transition-all ${question.upvotes?.includes((session?.user as any)?.id || '') ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-600'}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-black">{(question.upvotes || []).length} Hữu ích</span>
            </button>
          </div>
        </div>
      </div>

      {/* Answer Form */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-green-600" />
          <span>Đóng góp câu trả lời</span>
        </h3>

        {session ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <textarea 
              required
              rows={4}
              placeholder="Nhập câu trả lời của bạn tại đây..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi câu trả lời'}</span>
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-2">Đăng nhập để cùng trao đổi thảo luận chuyên môn.</p>
            <Link href="/login" className="text-xs font-black text-green-600 hover:underline uppercase tracking-widest">Đăng nhập ngay</Link>
          </div>
        )}
      </div>

      {/* Answers List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 px-4">
          <h2 className="text-base font-black text-gray-900">Câu trả lời ({question.answers?.length || 0})</h2>
          
          <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-wider">
            <button 
              onClick={() => setSortBy('upvotes')}
              className={`px-3 py-1.5 rounded-lg transition-all ${sortBy === 'upvotes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Tốt nhất
            </button>
            <button 
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Mới nhất
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedAnswers.map((answer: any) => (
            <div 
              key={answer.id} 
              className={`p-6 rounded-[32px] border transition-all relative ${
                answer.isAccepted 
                  ? 'bg-green-50/20 border-green-300 shadow-sm shadow-green-600/5' 
                  : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div className="flex items-center space-x-3">
                  <Image 
                    src={answer.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                    alt="Avatar" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 rounded-full bg-gray-50 object-cover" 
                    unoptimized
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-black text-gray-900">{answer.author?.full_name}</span>
                      {answer.isExpertAnswer && (
                        <span className="flex items-center text-[8px] font-black uppercase tracking-widest bg-amber-500 text-white px-1.5 py-0.5 rounded-md">
                          🌾 Chuyên gia
                        </span>
                      )}
                      {answer.author?.is_verified && <Award className="w-3 h-3 text-blue-500 fill-blue-50" />}
                    </div>
                    <span className="text-[8px] text-gray-400 font-bold uppercase">
                      {answer.createdAt ? format(new Date(answer.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'Gần đây'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {answer.isAccepted && (
                    <span className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-800 px-2.5 py-1 rounded-full shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>✅ Lời giải đúng</span>
                    </span>
                  )}

                  {isOwner && !answer.isAccepted && (
                    <button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className="text-[9px] font-black uppercase tracking-widest bg-gray-100 hover:bg-green-600 hover:text-white text-gray-500 px-3 py-1.5 rounded-xl border border-gray-200 transition-all"
                    >
                      Chấp nhận
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {answer.content}
              </p>

              <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleUpvoteAnswer(answer.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                    answer.upvotes?.includes((session?.user as any)?.id || '') 
                      ? 'bg-green-50 border-green-500 text-green-600' 
                      : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{(answer.upvotes || []).length}</span>
                </button>
              </div>
            </div>
          ))}

          {sortedAnswers.length === 0 && (
            <div className="py-12 text-center bg-white rounded-[32px] border border-gray-100">
              <p className="text-xs font-bold text-gray-400 italic">Chưa có câu trả lời nào cho câu hỏi này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
