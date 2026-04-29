'use client';

import React, { useEffect, useState } from 'react';
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
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    const userRole = (session.user as any)?.role?.toLowerCase();
    if (userRole !== 'admin') {
      router.push('/403');
    }
  }, [session, status, router]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-emerald-50/30">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest animate-pulse">
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
    <div className="flex h-screen bg-emerald-50/20 overflow-hidden font-sans">
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-emerald-100 flex flex-col z-50 transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 shadow-xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-emerald-50">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Settings className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">Agri Admin</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-[1.02]' 
                    : 'text-gray-500 hover:bg-emerald-50/50 hover:text-emerald-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-50">
          <button className="w-full flex items-center space-x-3 px-4 py-3.5 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all text-xs font-black">
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-emerald-50 flex items-center justify-between px-4 md:px-8 z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-emerald-50 rounded-2xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="relative w-48 md:w-96 hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..."
                className="w-full bg-emerald-50/40 border-none rounded-2xl py-2.5 pl-12 pr-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="flex items-center space-x-3 border-l pl-4 border-emerald-50">
              <div className="text-right hidden xs:block">
                <p className="text-xs font-black text-gray-900">Admin Alpha</p>
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black shadow-sm shadow-emerald-100/50">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
