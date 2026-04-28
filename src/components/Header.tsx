'use client';

import React from 'react';
import { User, LogIn, Leaf, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { data: session, status } = useSession();
  const mounted = status !== 'loading';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 flex-1">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              Thư viện Nông nghiệp
            </span>
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent sm:hidden">
              Thuviennongnghiep
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Tìm kiếm kiến thức, cây trồng, sâu bệnh..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />
            <span className="absolute right-3 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Nút Viết bài */}
          <Link href="/posts/create" className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-colors">
            <span>➕</span>
            <span className="hidden sm:inline">Viết bài</span>
          </Link>

          {/* Thông báo (Chuông) */}
          {session && <NotificationBell />}

          {mounted && session ? (
            <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-all p-1 hover:bg-gray-50 rounded-2xl">
              <img 
                src={session.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                className="h-9 w-9 rounded-2xl bg-green-100 shadow-sm object-cover" 
                alt={session.user?.name || ''} 
              />
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-black text-gray-900 leading-none">{session.user?.name}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Thành viên</p>
              </div>
            </Link>
          ) : mounted ? (
            <Link href="/login" className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-gray-900/10">
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <div className="h-9 w-24 bg-gray-50 rounded-2xl animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
