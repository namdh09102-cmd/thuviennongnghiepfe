'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Grid, 
  MessageSquare, 
  HelpCircle, 
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return null;
  }

  const menuItems = [
    { label: 'Tổng quan', icon: LayoutDashboard, href: '/admin' },
    { label: 'Bài viết', icon: FileText, href: '/admin/posts' },
    { label: 'Thành viên', icon: Users, href: '/admin/users' },
    { label: 'Danh mục', icon: Grid, href: '/admin/categories' },
    { label: 'Bình luận', icon: MessageSquare, href: '/admin/comments' },
    { label: 'Hỏi đáp', icon: HelpCircle, href: '/admin/questions' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-gray-900 tracking-tight">AGRI ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                  isActive 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all text-xs font-black">
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm trong hệ thống..."
              className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900">Admin Alpha</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-black">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
