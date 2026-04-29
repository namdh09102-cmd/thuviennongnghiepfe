'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminCategoriesPage() {
  const { data: categories, mutate, isLoading } = useSWR('/api/categories', fetcher);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '🌱', sort_order: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...formData } : formData;

    const res = await fetch('/api/admin/categories', {
      method,
      body: JSON.stringify(body)
    });

    if (res.ok) {
      mutate();
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', icon: '🌱', sort_order: 0 });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa danh mục có thể ảnh hưởng đến các bài viết hiện có. Bạn chắc chứ?')) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    if (res.ok) mutate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Quản lý Danh mục</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-black px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-green-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        {(isAdding || editingId) && (
          <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit sticky top-8 animate-in fade-in slide-in-from-left-4">
            <h3 className="text-lg font-black text-gray-900 mb-6">{editingId ? 'Chỉnh sửa' : 'Thêm mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên danh mục</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  readOnly
                  className="w-full bg-gray-100 border-none rounded-xl py-3 px-4 text-xs font-bold text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon (Emoji)</label>
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thứ tự</label>
                  <input 
                    type="number" 
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 text-white text-xs font-black py-3 rounded-2xl hover:bg-green-700 transition-all">Lưu lại</button>
                <button 
                  type="button" 
                  onClick={() => {setIsAdding(false); setEditingId(null);}}
                  className="px-6 py-3 bg-gray-50 text-gray-400 text-xs font-black rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Column */}
        <div className={isAdding || editingId ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách hiện tại</span>
            </div>
            <div className="divide-y divide-gray-50">
              {categories?.data?.map((cat: any) => (
                <div key={cat.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                  <div className="flex items-center space-x-6">
                    <GripVertical className="w-5 h-5 text-gray-200 cursor-grab active:cursor-grabbing" />
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white">
                      {cat.icon || cat.emoji || '🌱'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{cat.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Slug: {cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Số bài</p>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">{cat.posts?.[0]?.count || 0} bài</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Thứ tự</p>
                      <span className="text-xs font-black text-gray-900">{cat.sort_order}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setEditingId(cat.id);
                          setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon || cat.emoji || '🌱', sort_order: cat.sort_order });
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div className="p-20 text-center text-xs font-black text-gray-400 uppercase animate-pulse">Đang tải danh mục...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
