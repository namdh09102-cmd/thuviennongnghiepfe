'use client';

import React, { useState } from 'react';
import { ShieldAlert, Users, FileText, Package, Check, X, Trash2, Award, TrendingUp, BarChart2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: 'FARMER' | 'EXPERT' | 'ADMIN';
  isVerified: boolean;
  email: string;
}

interface PendingPost {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'posts' | 'products'>('stats');

  // Mock States
  const [users, setUsers] = useState<User[]>([
    { id: 'u1', name: 'Nguyễn Văn Tám', role: 'FARMER', isVerified: false, email: 'van.tam@gmail.com' },
    { id: 'u2', name: 'KS. Trần Thị Mai', role: 'EXPERT', isVerified: true, email: 'mai.bvtv@syngenta.vn' },
    { id: 'u3', name: 'Lão nông Tư Đờn', role: 'FARMER', isVerified: false, email: 'tudon30nam@gmail.com' },
    { id: 'u4', name: 'Nam Nguyễn', role: 'ADMIN', isVerified: true, email: 'admin@thuviennongnghiep.vn' },
  ]);

  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([
    { id: 'pp1', title: 'Trị rầy phấn trắng trên cây ổi?', author: 'Út Hiền', category: 'Sâu bệnh', date: '2026-04-28' },
    { id: 'pp2', title: 'Giá hồ tiêu hôm nay tại Chư Sê', author: 'Nhà vườn Lê Nam', category: 'Trồng trọt', date: '2026-04-27' },
  ]);

  const handleVerifyExpert = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'EXPERT', isVerified: !u.isVerified } : u));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleApprovePost = (id: string) => {
    setPendingPosts(prev => prev.filter(p => p.id !== id));
    alert('Đã duyệt bài viết thành công!');
  };

  const handleRejectPost = (id: string) => {
    setPendingPosts(prev => prev.filter(p => p.id !== id));
    alert('Đã từ chối bài viết.');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Sidebar Menu */}
      <div className="md:col-span-3 bg-white p-4 border border-gray-100 rounded-3xl shadow-sm space-y-1 sticky top-20 h-fit">
        <div className="flex items-center space-x-2 px-3 py-2 border-b border-gray-50 pb-3 mb-2">
          <ShieldAlert className="h-5 w-5 text-emerald-600" />
          <span className="font-black text-sm text-gray-900">Admin Panel</span>
        </div>

        {[
          { id: 'stats', name: 'Thống kê chung', icon: BarChart2 },
          { id: 'users', name: 'Thành viên', icon: Users },
          { id: 'posts', name: 'Kiểm duyệt bài', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="md:col-span-9 space-y-6">
        
        {/* 1. THỐNG KÊ CHUNG */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 border border-gray-100 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tổng thành viên</span>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-2xl font-black text-gray-900 mt-1 block">1,248</span>
                <span className="text-[9px] text-green-600 font-semibold flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +12% tuần qua
                </span>
              </div>

              <div className="bg-white p-5 border border-gray-100 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Bài đăng duyệt</span>
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-2xl font-black text-gray-900 mt-1 block">3,412</span>
                <span className="text-[9px] text-green-600 font-semibold flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +8% tuần qua
                </span>
              </div>

              <div className="bg-white p-5 border border-gray-100 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Lượt hỏi chuyên gia</span>
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                </div>
                <span className="text-2xl font-black text-gray-900 mt-1 block">56</span>
                <span className="text-[9px] text-red-600 font-semibold flex items-center mt-1">
                  {pendingPosts.length} đang chờ duyệt
                </span>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-gray-800">Báo cáo hoạt động gần đây</h3>
              <p className="text-[11px] text-gray-400">Chưa có báo cáo vi phạm nào.</p>
            </div>
          </div>
        )}

        {/* 2. QUẢN LÝ THÀNH VIÊN */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">Danh sách thành viên</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Tên</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Vai trò</th>
                    <th className="py-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50/40 transition-colors">
                      <td className="py-3 font-bold text-gray-800 flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        {user.isVerified && (
                          <Award className="h-3.5 w-3.5 text-amber-500 fill-amber-100" />
                        )}
                      </td>
                      <td className="py-3 text-gray-500">{user.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          user.role === 'ADMIN' ? 'bg-red-50 text-red-700' :
                          user.role === 'EXPERT' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-gray-50 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleVerifyExpert(user.id)}
                            className={`p-1.5 rounded-lg border text-[9px] font-bold transition-colors ${
                              user.isVerified 
                                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            title={user.isVerified ? 'Gỡ tích Chuyên gia' : 'Duyệt Chuyên gia'}
                          >
                            Expert
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg text-red-500 transition-all"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. KIỂM DUYỆT BÀI VIẾT */}
        {activeTab === 'posts' && (
          <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">Bài đăng đang chờ duyệt</h2>
            
            {pendingPosts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Đã duyệt hết tất cả nội dung.</p>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map(post => (
                  <div key={post.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-gray-800">{post.title}</h3>
                      <div className="flex items-center space-x-2 text-[9px] text-gray-400 mt-1 font-medium">
                        <span>Tác giả: <b>{post.author}</b></span>
                        <span>•</span>
                        <span>Danh mục: <b>{post.category}</b></span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center space-x-1 text-[10px] font-bold transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Duyệt</span>
                      </button>
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="p-2 bg-white hover:bg-red-50 border border-red-200 text-red-500 rounded-xl shadow-sm flex items-center space-x-1 text-[10px] font-bold transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
