'use client';

import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, LogIn, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors relative">
            <span>🔔</span>
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full shadow-sm" />
          </button>

          {mounted && isAuthenticated ? (
            <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs shadow-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium hidden md:block">
                {user?.username}
              </span>
            </Link>
          ) : mounted ? (
            <Link href="/login" className="flex items-center space-x-1.5 text-gray-600 hover:text-green-600 text-xs font-medium px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
              <span>🔑</span>
              <span>Đăng nhập</span>
            </Link>
          ) : (
            <div className="h-8 w-8 bg-gray-50 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
