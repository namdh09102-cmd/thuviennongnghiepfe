'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, ChevronDown, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Khởi tạo lịch sử chat từ sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('ai_consultant_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(parsed);
      } catch (e) {
        console.error('Lỗi load session chat:', e);
      }
    } else {
      // Tin nhắn chào mừng ban đầu
      setMessages([
        {
          role: 'assistant',
          content: 'Xin chào! Tôi là Trợ lý Nông nghiệp AI. Tôi có thể giúp gì cho mùa vụ của bạn hôm nay?',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Lưu lịch sử chat
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('ai_consultant_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Không thể kết nối với AI. Vui lòng kiểm tra cài đặt API Key hoặc thử lại sau.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskExpert = () => {
    setIsOpen(false);
    // Điều hướng sang form tạo câu hỏi hỏi đáp thật
    router.push('/hoi-dap');
    // Mở modal tạo câu hỏi (nếu page hỏi đáp có modal, ta có thể trigger qua state/event, ở đây tạm chuyển trang)
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-1 transition-all duration-300 z-50 flex items-center space-x-2 border border-white/10 group ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="h-5 w-5 group-hover:animate-spin" />
        <span className="text-sm font-semibold">Tư vấn AI</span>
      </button>

      {/* Slide-in Chat Panel */}
      <div
        className={`fixed bottom-0 right-0 top-0 w-full sm:w-[420px] bg-white shadow-[-10px_0px_30px_rgba(0,0,0,0.1)] border-l border-gray-100 z-50 flex flex-col transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Bác sĩ Cây trồng AI</h3>
              <span className="text-[10px] text-green-100 flex items-center"><span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span> Hoạt động</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <span
                  className={`text-[8px] mt-1 block text-right ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-400'}`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm">
                <div className="flex space-x-1 items-center h-4">
                  <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input & Action */}
        <div className="p-4 bg-white border-t border-gray-100 space-y-3">
          <button
            onClick={handleAskExpert}
            className="w-full text-center border border-emerald-600 text-emerald-700 rounded-xl py-2 text-xs font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Đặt câu hỏi cho chuyên gia thật</span>
          </button>

          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI về sâu bệnh, phân bón..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
