'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { MessageSquare, CheckCircle, HelpCircle, AlertCircle, Search, ThumbsUp, ThumbsDown, Sparkles, UserCheck, Award, Plus, ChevronRight } from 'lucide-react';
import ChatWidget from '../../components/ChatWidget';

// 8. Dữ liệu 10 câu hỏi mẫu thực tế
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    title: 'Bệnh sương mai trên quả vải thiều phòng trừ thế nào?',
    content: 'Mấy hôm nay trời nồm ẩm, quả vải bắt đầu xuất hiện các đốm đen nhỏ ở cuống, lan nhanh. Có phải bị sương mai không và xịt thuốc gì hiệu quả?',
    tags: ['Vải thiều', 'Sâu bệnh'],
    status: 'Chờ trả lời',
    author: { name: 'Nguyễn Văn Tám', role: 'Nông dân', isExpert: false },
    date: '2026-04-27',
    votes: 12,
    views: 48,
    answers: [
      {
        id: 'a1_1',
        author: { name: 'KS. Trần Thị Mai', role: 'Bảo vệ thực vật', isExpert: true },
        content: 'Chào anh, đây chính xác là bệnh sương mai. Anh cần phun ngay gốc hoạt chất Metalaxyl kết hợp Mancozeb. Ngưng phun thuốc trước thu hoạch 14 ngày nhé.',
        votes: 8,
        isBest: true,
        date: '2026-04-28'
      }
    ]
  },
  {
    id: 'q2',
    title: 'Sầu riêng bị vàng lá thối rễ vào đầu mùa mưa',
    content: 'Vườn sầu riêng 4 năm tuổi đọt non ra bị chùn, lá già vàng úa, rễ tơ đen thui. Xin chuyên gia tư vấn cách cứu cây.',
    tags: ['Sầu riêng', 'Trồng trọt'],
    status: 'Đã có đáp án',
    author: { name: 'Lê Đình Nam', role: 'Nhà vườn', isExpert: false },
    date: '2026-04-25',
    votes: 24,
    views: 120,
    answers: [
      {
        id: 'a2_1',
        author: { name: 'GS.TS Nguyễn Văn A', role: 'Đại học Cần Thơ', isExpert: true },
        content: 'Bệnh do nấm Phytophthora và Fusarium gây ra. Bước 1: Cắt tỉa cành thông thoáng. Bước 2: Đào rãnh thoát nước. Bước 3: Tưới thuốc gốc Phosphonate hoặc Ridomil Gold quanh gốc.',
        votes: 19,
        isBest: true,
        date: '2026-04-26'
      }
    ]
  },
  {
    id: 'q3',
    title: 'Phân biệt sâu đục thân lúa 2 chấm và sâu cuốn lá?',
    content: 'Em mới làm ruộng vụ đầu, chưa biết phân biệt hai loại này để mua thuốc phun xịt phù hợp.',
    tags: ['Lúa', 'Sâu bệnh'],
    status: 'Còn tranh luận',
    author: { name: 'Út Hiền', role: 'Nông dân trẻ', isExpert: false },
    date: '2026-04-28',
    votes: 5,
    views: 31,
    answers: [
      {
        id: 'a3_1',
        author: { name: 'Lão nông Tư Đờn', role: '30 năm làm ruộng', isExpert: false },
        content: 'Sâu cuốn lá thì làm lá lúa cuốn tròn lại, sâu ở trong ăn diệp lục. Sâu đục thân thì làm cây lúa bị héo ngọn (bông bạc).',
        votes: 4,
        isBest: false,
        date: '2026-04-28'
      }
    ]
  },
  {
    id: 'q4',
    title: 'Giá phân bón NPK Phú Mỹ hôm nay tại Đắk Lắk?',
    content: 'Em định nhập 5 tấn bón cho cà phê, giá đại lý báo 750k/bao 50kg có đắt quá không các bác?',
    tags: ['Phân bón', 'Cà phê'],
    status: 'Đã có đáp án',
    author: { name: 'Y-Kha', role: 'Chủ rẫy', isExpert: false },
    date: '2026-04-26',
    votes: 2,
    views: 55,
    answers: [
      {
        id: 'a4_1',
        author: { name: 'Đại lý VTNN Ba Hưng', role: 'Kinh doanh', isExpert: false },
        content: 'Giá 750k là đúng giá thị trường tuần này rồi đó em. Nếu mua sỉ 5 tấn trở lên liên hệ anh bớt thêm tiền vận chuyển.',
        votes: 3,
        isBest: true,
        date: '2026-04-26'
      }
    ]
  }
];

export default function CommunityQAPage() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: apiRes } = useSWR('/api/questions', fetcher);
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);

  useEffect(() => {
    if (apiRes?.data && apiRes.data.length > 0) {
      const realQuestions = apiRes.data.map((q: any) => ({
        id: q.id,
        title: q.title,
        content: q.content,
        tags: Array.isArray(q.tags) ? q.tags : (q.tags ? q.tags.split(',').map((t: any) => t.trim()) : ['Nông nghiệp']),
        status: q.status === 'pending' ? 'Chờ trả lời' : q.status === 'solved' ? 'Đã có đáp án' : 'Còn tranh luận',
        author: { 
          name: q.author?.full_name || 'Người dùng', 
          role: q.author?.role || 'Nông dân', 
          isExpert: q.author?.is_verified || false 
        },
        date: q.created_at ? new Date(q.created_at).toISOString().split('T')[0] : '2026-04-28',
        votes: q.votes || 0,
        views: q.view_count || 0,
        answers: Array.isArray(q.answers) ? q.answers.map((a: any) => ({
          id: a.id,
          author: { name: a.author?.full_name || 'Người dùng', role: a.author?.role || 'Thành viên', isExpert: a.author?.is_verified || false },
          content: a.content,
          votes: a.upvotes || 0,
          isBest: a.is_best_answer || false,
          date: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '2026-04-28'
        })) : []
      }));
      setQuestions(realQuestions);
    }
  }, [apiRes]);

  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // State cho form đặt câu hỏi
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('Lúa');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // State cho form trả lời
  const [answerContent, setAnswerContent] = useState('');

  const filteredQuestions = questions.filter(q => {
    const matchesFilter = selectedFilter === 'Tất cả' || q.status === selectedFilter;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         q.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  // 6. AI gợi ý sơ bộ (Claude API integration)
  const askAISuggestion = async (questionTitle: string, questionContent: string, qId: string) => {
    try {
      setIsAIGenerating(true);
      const prompt = `Bạn là chuyên gia nông nghiệp. Hãy trả lời câu hỏi "${questionTitle}" với nội dung "${questionContent}". Trả lời bằng tiếng Việt, ngắn gọn, thực tế, 3-5 câu.`;
      
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();

      if (data.content) {
        const aiAnswer = {
          id: `a_ai_${Date.now()}`,
          author: { name: 'Bác sĩ Cây Trồng AI', role: 'Claude 3.5 Sonnet', isExpert: true },
          content: `🤖 (AI Trả lời tự động): ${data.content}`,
          votes: 1,
          isBest: false,
          date: new Date().toISOString().split('T')[0]
        };

        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, answers: [...q.answers, aiAnswer] } : q));
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newQId = `q_${Date.now()}`;
    const newQuestion = {
      id: newQId,
      title,
      content,
      tags: [tagInput],
      status: 'Chờ trả lời',
      author: { name: 'Nhà nông mới', role: 'Nông dân', isExpert: false },
      date: new Date().toISOString().split('T')[0],
      votes: 0,
      views: 1,
      answers: []
    };

    setQuestions(prev => [newQuestion, ...prev]);
    setTitle('');
    setContent('');
    setIsFormOpen(false);

    // Kích hoạt trả lời AI
    await askAISuggestion(title, content, newQId);
  };

  const handleCreateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent || !activeQuestionId) return;

    const newAnswer = {
      id: `a_${Date.now()}`,
      author: { name: 'Nhà nông tư vấn', role: 'Nông dân', isExpert: false },
      content: answerContent,
      votes: 0,
      isBest: false,
      date: new Date().toISOString().split('T')[0]
    };

    setQuestions(prev =>
      prev.map(q => q.id === activeQuestionId ? { ...q, answers: [...q.answers, newAnswer], status: 'Đã có đáp án' } : q)
    );
    setAnswerContent('');
  };

  const handleVoteQuestion = (qId: string, increment: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, votes: q.votes + increment } : q));
  };

  const handleVoteAnswer = (qId: string, aId: string, increment: number) => {
    setQuestions(prev =>
      prev.map(q => q.id === qId ? {
        ...q,
        answers: q.answers.map(a => a.id === aId ? { ...a, votes: a.votes + increment } : a)
      } : q)
    );
  };

  const handleMarkBestAnswer = (qId: string, aId: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === qId ? {
        ...q,
        answers: q.answers.map(a => ({ ...a, isBest: a.id === aId }))
      } : q)
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Cột chính */}
      <div className="lg:col-span-8 space-y-6">
        {activeQuestionId && activeQuestion ? (
          // 3. TRANG CHI TIẾT CÂU HỎI
          <div className="space-y-6 animate-in fade-in duration-200">
            <button 
              onClick={() => setActiveQuestionId(null)} 
              className="text-xs font-bold text-gray-500 hover:text-green-600 flex items-center space-x-1"
            >
              <span>← Quay lại danh sách</span>
            </button>

            <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-4">
              <h1 className="text-lg font-black text-gray-900">{activeQuestion.title}</h1>
              
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${activeQuestion.author.isExpert ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-700'}`}>
                    {activeQuestion.author.isExpert && <Award className="h-3 w-3 text-amber-600" />}
                    <span>{activeQuestion.author.name} ({activeQuestion.author.role})</span>
                  </span>
                  <span>•</span>
                  <span>{activeQuestion.date}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                  <button onClick={() => handleVoteQuestion(activeQuestion.id, 1)} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg"><ThumbsUp className="h-3.5 w-3.5" /></button>
                  <span className="px-1">{activeQuestion.votes}</span>
                  <button onClick={() => handleVoteQuestion(activeQuestion.id, -1)} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg"><ThumbsDown className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed border-t pt-3 whitespace-pre-line">
                {activeQuestion.content}
              </p>

              <div className="flex flex-wrap gap-1 pt-2">
                {activeQuestion.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>

            {/* Danh sách câu trả lời */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Câu trả lời ({activeQuestion.answers.length})</h3>
              
              {activeQuestion.answers.map(answer => (
                <div 
                  key={answer.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    answer.isBest 
                      ? 'bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-600/20' 
                      : 'bg-white border-gray-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${answer.author.isExpert ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-700'}`}>
                        {answer.author.isExpert && <Award className="h-3 w-3 text-amber-600" />}
                        <span>{answer.author.name} ({answer.author.role})</span>
                      </span>
                      <span>•</span>
                      <span>{answer.date}</span>
                    </div>

                    {answer.isBest && (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Hữu ích nhất</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-800 leading-relaxed mt-3 whitespace-pre-line">
                    {answer.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-50">
                    <div className="flex items-center space-x-1 text-[10px] text-gray-600">
                      <button onClick={() => handleVoteAnswer(activeQuestion.id, answer.id, 1)} className="p-1 bg-gray-50 rounded hover:bg-gray-100"><ThumbsUp className="h-3 w-3" /></button>
                      <span className="px-1 font-bold">{answer.votes}</span>
                      <button onClick={() => handleVoteAnswer(activeQuestion.id, answer.id, -1)} className="p-1 bg-gray-50 rounded hover:bg-gray-100"><ThumbsDown className="h-3 w-3" /></button>
                    </div>

                    {!answer.isBest && (
                      <button 
                        onClick={() => handleMarkBestAnswer(activeQuestion.id, answer.id)}
                        className="text-[9px] font-bold text-gray-400 hover:text-emerald-600 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Đánh dấu hữu ích</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form trả lời */}
            <form onSubmit={handleCreateAnswer} className="bg-white p-4 border border-gray-100 rounded-3xl shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-700">Trả lời câu hỏi này</h4>
              <textarea
                rows={3}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Chia sẻ kinh nghiệm, hướng dẫn của bạn..."
                className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-green-700 transition-all"
                >
                  Gửi trả lời
                </button>
              </div>
            </form>
          </div>
        ) : (
          // 2. TRANG DANH SÁCH CÂU HỎI
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 justify-between bg-white p-4 border border-gray-100 rounded-3xl shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {['Tất cả', 'Chờ trả lời', 'Đã có đáp án', 'Còn tranh luận'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedFilter === filter
                        ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px] flex-1 md:flex-none">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Desktop CTA for question form */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="hidden md:flex w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-sm rounded-3xl shadow-md hover:opacity-95 transition-all items-center justify-center space-x-2 shadow-green-600/20"
            >
              <HelpCircle className="h-5 w-5 text-emerald-200" />
              <span>Bạn có thắc mắc kỹ thuật? Hỏi chuyên gia ngay</span>
            </button>

            {/* Question Form Modal */}
            {isFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
                <div 
                  className="absolute inset-0" 
                  onClick={() => setIsFormOpen(false)} 
                />
                <form 
                  onSubmit={handleCreateQuestion} 
                  className="relative bg-white w-full md:max-w-xl p-6 rounded-t-[32px] md:rounded-3xl shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-sm font-black text-gray-900">Đặt câu hỏi mới cho cộng đồng</h3>
                    <button 
                      type="button" 
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Tiêu đề câu hỏi</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Cây sầu riêng bị xì mủ thân cây"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Chủ đề</label>
                      <select
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Lúa">Lúa</option>
                        <option value="Sầu riêng">Sầu riêng</option>
                        <option value="Vải thiều">Vải thiều</option>
                        <option value="Cà phê">Cà phê</option>
                        <option value="Rau màu">Rau màu</option>
                        <option value="Chăn nuôi">Chăn nuôi</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Nội dung chi tiết</label>
                    <textarea
                      rows={4}
                      placeholder="Mô tả triệu chứng, thời gian bị bệnh, tình hình phân bón đã dùng..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-green-600 text-white font-black text-xs rounded-xl shadow-md hover:bg-green-700 transition-all flex items-center space-x-1.5 shadow-green-600/20"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Đăng câu hỏi</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Mobile FAB for Question Page */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="md:hidden fixed bottom-[76px] right-[16px] z-50 flex items-center justify-center w-[52px] h-[52px] rounded-full text-white bg-green-600 shadow-lg active:scale-95 transition-all shadow-green-600/30"
              aria-label="Đặt câu hỏi"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Plus className="w-6 h-6" />
            </button>

            {/* Danh sách câu hỏi */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-16 bg-white border rounded-3xl">
                <p className="text-xs text-gray-400 font-medium">Không tìm thấy câu hỏi nào phù hợp.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map(q => (
                  <div 
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-300 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          q.status === 'Chờ trả lời' ? 'bg-red-50 text-red-700 border border-red-200/50' :
                          q.status === 'Đã có đáp án' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                          'bg-amber-50 text-amber-700 border border-amber-200/50'
                        }`}>
                          {q.status}
                        </span>
                        <span className="text-[9px] text-gray-400">{q.date}</span>
                      </div>

                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                        {q.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {q.content}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {q.tags.map(tag => (
                          <span key={tag} className="text-[8px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center border-l pl-4 flex-shrink-0 justify-center min-w-[60px]">
                      <span className="text-xs font-black text-gray-800">{q.answers.length}</span>
                      <span className="text-[9px] text-gray-400">Trả lời</span>
                      <ChevronRight className="h-4 w-4 text-gray-300 mt-2 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cột phụ: Expert Dashboard */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-5 border border-gray-100 rounded-3xl shadow-sm space-y-4 sticky top-20">
          <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 pb-2 border-b">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Tư vấn Trực tuyến</span>
          </h3>
          
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Hệ thống tự động tích hợp AI hỗ trợ trả lời sơ bộ khi đặt câu hỏi.
          </p>
          
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-amber-800 flex items-center space-x-1">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Đã xác thực chuyên gia</span>
            </span>
            <p className="text-[9px] text-amber-700 leading-relaxed">
              Các câu trả lời từ tài khoản có nhãn danh hiệu đặc biệt được kiểm định nghiêm ngặt bởi Hội đồng Nông nghiệp.
            </p>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
