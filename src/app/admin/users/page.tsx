'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Search, 
  MoreHorizontal, 
  Mail,
  Ban,
  CheckCircle2,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, mutate, isLoading } = useSWR(`/api/admin/users?role=${roleFilter}&search=${encodeURIComponent(debouncedSearch)}`, fetcher);

  const handleUpdateUser = async (userId: string, update: any) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, ...update })
    });
    if (res.ok) mutate();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-lg border border-purple-100">Admin</span>;
      case 'expert': return <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">Chuyên gia</span>;
      case 'moderator': return <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg border border-amber-100">Mod</span>;
      default: return <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-lg border border-gray-100">Thành viên</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-gray-900">Quản lý Thành viên</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-green-500 shadow-sm w-48 md:w-64"
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border-none shadow-sm rounded-xl py-2 px-4 text-xs font-black focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="expert">Chuyên gia</option>
            <option value="moderator">Điều phối viên</option>
            <option value="member">Thành viên</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thành viên</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vai trò</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Xác minh</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bài đăng</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tham gia</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} className="w-10 h-10 rounded-2xl bg-gray-100 object-cover" alt="" />
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-gray-900 line-clamp-1">{user.full_name || 'Người dùng ẩn danh'}</span>
                          {user.status === 'banned' && (
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest rounded border border-red-100 flex-shrink-0">Banned</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">{getRoleBadge(user.role)}</td>
                  <td className="p-6">
                    {user.is_verified ? (
                      <div className="flex items-center text-green-600 space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleUpdateUser(user.id, { is_verified: true })}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600"
                      >
                        Xác minh
                      </button>
                    )}
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">
                      {user.posts?.[0]?.count || 0} bài
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-bold text-gray-400">{format(new Date(user.created_at), 'dd/MM/yyyy')}</span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a href={`/profile/${user.username}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem profile">
                        <UserIcon className="w-4 h-4" />
                      </a>
                      <div className="relative group/menu">
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 hidden group-hover/menu:block p-2">
                          <p className="px-4 py-2 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b mb-1">Thay đổi vai trò</p>
                          {['member', 'expert', 'moderator', 'admin'].map(r => (
                            <button 
                              key={r}
                              onClick={() => handleUpdateUser(user.id, { role: r })}
                              className={`w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 rounded-xl ${user.role === r ? 'text-green-600' : 'text-gray-600'}`}
                            >
                              {r}
                            </button>
                          ))}
                          {user.status === 'banned' ? (
                            <button 
                              onClick={() => handleUpdateUser(user.id, { status: 'active' })}
                              className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-green-600 hover:bg-green-50 rounded-xl mt-2 flex items-center space-x-2"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mở khóa</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateUser(user.id, { status: 'banned' })}
                              className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl mt-2 flex items-center space-x-2"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Khóa tài khoản</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="p-20 flex justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div></div>}
        {!isLoading && data?.data?.length === 0 && <div className="p-20 text-center text-xs font-black text-gray-400 uppercase">Không tìm thấy thành viên.</div>}
      </div>
    </div>
  );
}
