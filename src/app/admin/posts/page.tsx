'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Star,
  Pin
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPostsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, mutate, isLoading } = useSWR(`/api/admin/posts?status=${statusFilter}`, fetcher);

  const handleBulkStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    const res = await fetch('/api/admin/posts', {
      method: 'PATCH',
      body: JSON.stringify({ ids: selectedIds, status: newStatus })
    });
    if (res.ok) {
      mutate();
      setSelectedIds([]);
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    const res = await fetch(`/api/admin/posts?ids=${ids.join(',')}`, { method: 'DELETE' });
    if (res.ok) {
      mutate();
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100 flex items-center space-x-1"><CheckCircle className="w-3 h-3" /> <span>Đã đăng</span></span>;
      case 'pending': return <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-100 flex items-center space-x-1"><Clock className="w-3 h-3" /> <span>Chờ duyệt</span></span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-black uppercase rounded-lg border border-red-100 flex items-center space-x-1"><XCircle className="w-3 h-3" /> <span>Bị từ chối</span></span>;
      default: return <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-lg border border-gray-100">Bản nháp</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Quản lý Bài viết</h1>
        <div className="flex items-center space-x-3">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-gray-100 rounded-xl py-2 px-4 text-xs font-black focus:ring-green-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Bị từ chối</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-in slide-in-from-bottom-4">
          <span className="text-xs font-black ml-2 uppercase tracking-widest">Đã chọn {selectedIds.length} bài viết</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => handleBulkStatus('published')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Duyệt nhanh</button>
            <button onClick={() => handleBulkStatus('rejected')} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Từ chối</button>
            <button onClick={() => handleDelete(selectedIds)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Xóa bài</button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Hủy</button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="p-6 w-12">
                <input 
                  type="checkbox" 
                  className="rounded-lg border-gray-300 text-green-600 focus:ring-green-500" 
                  onChange={(e) => setSelectedIds(e.target.checked ? data?.data?.map((p: any) => p.id) : [])}
                  checked={selectedIds.length > 0 && selectedIds.length === data?.data?.length}
                />
              </th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">ID</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề & Tác giả</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh mục</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tạo</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data?.data?.map((post: any) => (
              <tr key={post.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="p-6">
                  <input 
                    type="checkbox" 
                    className="rounded-lg border-gray-300 text-green-600 focus:ring-green-500" 
                    checked={selectedIds.includes(post.id)}
                    onChange={() => toggleSelect(post.id)}
                  />
                </td>
                <td className="p-6">
                  <span className="text-[10px] font-bold text-gray-400 uppercase" title={post.id}>#{post.id.split('-')[0]}</span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900 mb-1 line-clamp-1">{post.title}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bởi: {post.author?.full_name || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-xs font-bold text-gray-600">{post.category?.name || 'Chưa phân loại'}</span>
                </td>
                <td className="p-6">
                  {getStatusBadge(post.status)}
                </td>
                <td className="p-6">
                  <span className="text-[10px] font-bold text-gray-400">{format(new Date(post.created_at), 'dd/MM/yyyy')}</span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem bài">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete([post.id])}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="relative group/menu">
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 hidden group-hover/menu:block p-2">
                        <button 
                          onClick={() => handleBulkStatus(post.status === 'published' ? 'pending' : 'published')}
                          className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 rounded-xl"
                        >
                          {post.status === 'published' ? 'Gỡ bài' : 'Duyệt bài'}
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 rounded-xl flex items-center justify-between">
                          <span>Nổi bật</span>
                          <Star className={`w-3 h-3 ${post.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 rounded-xl flex items-center justify-between">
                          <span>Ghim đầu</span>
                          <Pin className={`w-3 h-3 ${post.is_pinned ? 'fill-blue-400 text-blue-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {isLoading && (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        )}

        {!isLoading && data?.data?.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-sm font-medium text-gray-400 italic">Không tìm thấy bài viết nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
