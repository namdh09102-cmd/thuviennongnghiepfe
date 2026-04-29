'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageSquare, CheckCircle, HelpCircle, AlertCircle, Search, 
  ThumbsUp, Sparkles, Award, Plus, X, Save 
} from 'lucide-react';

export default function CommunityQAPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'newest' | 'unanswered' | 'expert'>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form đặt câu hỏi
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TAG_SUGGESTIONS = ['Lúa', 'Rau', 'Trái cây', 'Sâu bệnh', 'Phân bón'];

  useEffect(() => {
    fetchQuestions();
  }, [selectedFilter, selectedTag]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let url = `/api/questions?page=1&limit=30`;
      
      if (selectedTag) {
        url += `&tag=${encodeURIComponent(selectedTag.toLowerCase())}`;
      }
      if (selectedFilter === 'unanswered') {
        // Filter on client side for simplicity, or backend could support
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      let finalQuestions = data.data || [];
      
      if (selectedFilter === 'unanswered') {
        finalQuestions = finalQuestions.filter((q: any) => !q.answerCount || q.answerCount === 0);
      } else if (selectedFilter === 'expert') {
        // Ideally questions answered by experts, for now simple mock/filter logic if tag supported
      }

      setQuestions(finalQuestions);
    } catch (error) {
      console.error('Failed to fetch questions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert('Vui lòng đăng nhập để đặt câu hỏi');
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags })
      });
      
      if (res.ok) {
        setTitle('');
        setContent('');
        setTags([]);
        setIsFormOpen(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUpvote = async (id: string) => {
    if (!session) return alert('Vui lòng đăng nhập để upvote');
    try {
      const res = await fetch(`/api/questions/${id}/upvote`, { method: 'POST' });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500 relative min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-green-600 to-teal-700 rounded-[40px] p-8 md:p-12 text-white shadow-lg shadow-green-900/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paddy.png')]" />
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Hỏi Đáp Cùng Cộng Đồng</h1>
          <p className="text-sm text-green-50 font-medium max-w-xl">Gặp khó khăn trong canh tác? Đặt câu hỏi để nhận tư vấn từ các chuyên gia và cộng đồng nhà nông.</p>
        </div>
        <button 
          onClick={() => {
            if (!session) {
              router.push('/login?callbackUrl=/hoi-dap');
            } else {
              setIsFormOpen(true);
            }
          }}
          className="flex items-center space-x-2 bg-white hover:bg-green-50 text-gray-900 font-black text-xs px-6 py-4 rounded-2xl transition-all shadow-md shadow-black/10 relative z-10"
        >
          <Plus className="w-4 h-4 text-green-600" />
          <span>Đặt câu hỏi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tag Filter */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lĩnh vực chuyên môn</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${!selectedTag ? 'bg-green-600 text-white border-green-600 shadow-sm shadow-green-600/20' : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'}`}
              >
                Tất cả
              </button>
              {TAG_SUGGESTIONS.map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedTag === tag ? 'bg-green-600 text-white border-green-600 shadow-sm shadow-green-600/20' : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Question Feed */}
        <div className="lg:col-span-9 space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button 
                onClick={() => setSelectedFilter('newest')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedFilter === 'newest' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Mới nhất
              </button>
              <button 
                onClick={() => setSelectedFilter('unanswered')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedFilter === 'unanswered' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Chưa có đáp
              </button>
              <button 
                onClick={() => setSelectedFilter('expert')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedFilter === 'expert' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Chuyên gia trả lời
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input 
                type="text" 
                placeholder="Tìm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none text-xs font-bold transition-all"
              />
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {questions
                .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.content.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((question) => (
                  <div key={question.id} className="bg-white rounded-[32px] border border-gray-100 p-6 hover:border-green-200 shadow-sm transition-all flex gap-6 items-start">
                    {/* Votes count side */}
                    <button 
                      onClick={() => toggleUpvote(question.id)}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl border transition-all ${question.upvotes?.includes(session?.user?.email || '') ? 'bg-green-50 border-green-500 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-600'}`}
                    >
                      <ThumbsUp className="w-4 h-4 mb-1" />
                      <span className="text-xs font-black">{(question.upvotes || []).length}</span>
                    </button>

                    {/* Question main content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {question.status === 'answered' && (
                          <span className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>Đã có đáp</span>
                          </span>
                        )}
                        {question.tags?.map((t: string) => (
                          <span key={t} className="text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100 px-2.5 py-1 rounded-full">{t}</span>
                        ))}
                      </div>

                      <Link href={`/hoi-dap/${question.id}`} className="block group">
                        <h3 className="text-base font-black text-gray-900 leading-tight group-hover:text-green-600 transition-colors">
                          {question.title}
                        </h3>
                      </Link>

                      <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                        {question.content.replace(/<[^>]*>/g, '')}
                      </p>

                      <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Image 
                            src={question.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                            alt="Avatar" 
                            width={24} 
                            height={24} 
                            className="w-6 h-6 rounded-full bg-gray-50" 
                            unoptimized
                          />
                          <span className="text-[10px] font-black text-gray-700">{question.author?.full_name}</span>
                          {question.author?.is_verified && <Award className="w-3 h-3 text-blue-500 fill-blue-50" />}
                        </div>

                        <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-400">
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{question.answerCount || 0} trả lời</span>
                          </span>
                          <span>{question.viewCount || 0} lượt xem</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              {questions.length === 0 && (
                <div className="py-20 text-center bg-white rounded-[40px] border border-gray-100">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-400 italic">Không tìm thấy câu hỏi nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button 
        onClick={() => {
          if (!session) {
            router.push('/login?callbackUrl=/hoi-dap');
          } else {
            setIsFormOpen(true);
          }
        }}
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-600/30 flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Question Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white md:bg-black/60 md:backdrop-blur-sm md:p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white md:rounded-[40px] p-8 w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-green-600" />
              <span>Đặt câu hỏi mới</span>
            </h3>

            <form onSubmit={handleCreateQuestion} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiêu đề câu hỏi</label>
                <input 
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Ví dụ: Kỹ thuật bón phân cho lúa ST25"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
                <span className="text-[9px] font-bold text-gray-400 block text-right mr-1">{title.length}/200 ký tự</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chi tiết vấn đề</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Hãy miêu tả rõ triệu chứng, điều kiện canh tác..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <span>Tags</span>
                </label>
                <div className="flex flex-wrap gap-2 bg-gray-50 p-4 rounded-[24px] border border-gray-100 mb-2">
                  {TAG_SUGGESTIONS.map((tag) => {
                    const isSelected = tags.includes(tag.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          const lower = tag.toLowerCase();
                          setTags(prev => isSelected ? prev.filter(t => t !== lower) : [...prev, lower]);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          isSelected 
                            ? 'bg-green-600 text-white border-green-600' 
                            : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Thêm tag thủ công..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim() && !tags.includes(tagInput.toLowerCase())) {
                          setTags([...tags, tagInput.toLowerCase().trim()]);
                          setTagInput('');
                        }
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-4 text-xs font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 hover:bg-green-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Đang tạo...' : 'Đăng câu hỏi'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
