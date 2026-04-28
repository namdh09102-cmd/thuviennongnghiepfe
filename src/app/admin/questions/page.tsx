'use client';

import React from 'react';
import useSWR from 'swr';
import { HelpCircle, Trash2, CheckCircle2, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminQuestionsPage() {
  const { data: questions, mutate, isLoading } = useSWR('/api/admin/questions', fetcher);

  const handleToggleSolved = async (id: string, current: boolean) => {
    const res = await fetch('/api/admin/questions', {
      method: 'PATCH',
      body: JSON.stringify({ id, is_solved: !current })
    });
    if (res.ok) mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
    if (res.ok) mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Quản lý Hỏi đáp</h1>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu hỏi & Người hỏi</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh mục</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày đăng</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {questions?.map((q: any) => (
              <tr key={q.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-6">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-black text-gray-900 line-clamp-1">{q.title}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1">
                      <User className="w-2.5 h-2.5" />
                      <span>{q.author?.full_name}</span>
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-xs font-bold text-gray-600">{q.category?.name}</span>
                </td>
                <td className="p-6">
                  {q.is_solved ? (
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100 flex items-center space-x-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã giải quyết</span>
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-100 flex items-center space-x-1 w-fit">
                      <Clock className="w-3 h-3" />
                      <span>Đang chờ</span>
                    </span>
                  )}
                </td>
                <td className="p-6">
                  <span className="text-[10px] font-bold text-gray-400">{format(new Date(q.created_at), 'dd/MM/yyyy')}</span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleToggleSolved(q.id, q.is_solved)}
                      className={`p-2 rounded-xl transition-all ${q.is_solved ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                      title={q.is_solved ? 'Đánh dấu chưa giải quyết' : 'Đánh dấu đã giải quyết'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-20 text-center text-xs font-black text-gray-400 uppercase animate-pulse">Đang tải câu hỏi...</div>}
      </div>
    </div>
  );
}
