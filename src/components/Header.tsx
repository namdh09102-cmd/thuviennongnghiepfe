'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, LogIn, Leaf, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import NotificationBell from './NotificationBell';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const mounted = status !== 'loading';
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecents, setShowRecents] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    saveSearch(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setShowRecents(false);
  };

  const handleRecentClick = (query: string) => {
    setSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
    setShowRecents(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-6xl mx-auto relative">
        
        {/* Desktop & Normal mobile logo */}
        <div className={`flex items-center space-x-4 flex-1 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              Thư viện Nông nghiệp
            </span>
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent sm:hidden">
              AgriLib
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <input
                type="text"
                placeholder="Tìm kiếm kiến thức, cây trồng, sâu bệnh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowRecents(true)}
                onBlur={() => setTimeout(() => setShowRecents(false), 200)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-4 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-green-600">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Desktop Recents */}
            {showRecents && recentSearches.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in duration-150">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 px-2">Tìm kiếm gần đây</p>
                {recentSearches.map(query => (
                  <button
                    key={query}
                    onClick={() => handleRecentClick(query)}
                    className="w-full text-left px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Search className="w-3 h-3 text-gray-400" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Trigger & Expanded Bar */}
        {isSearchOpen ? (
          <div className="flex items-center flex-1 md:hidden animate-in slide-in-from-right duration-200 relative z-50 w-full">
            <form onSubmit={handleSearchSubmit} className="w-full flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowRecents(true)}
                  onBlur={() => setTimeout(() => setShowRecents(false), 200)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white font-bold"
                />
                <button type="submit" className="absolute right-3 top-3.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowRecents(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Mobile Recents */}
            {showRecents && recentSearches.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 px-2">Tìm kiếm gần đây</p>
                {recentSearches.map(query => (
                  <button
                    key={query}
                    onClick={() => handleRecentClick(query)}
                    className="w-full text-left px-2 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center space-x-2"
                  >
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setIsSearchOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="md:hidden text-gray-400 hover:text-green-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Right actions */}
        <div className={`flex items-center space-x-3 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
          <Link 
            href="/posts/create" 
            className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-colors min-h-[44px] flex items-center justify-center"
          >
            <span>➕</span>
            <span className="hidden sm:inline">Viết bài</span>
          </Link>

          {session && <NotificationBell />}

          {mounted && session ? (
            <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-all p-1 hover:bg-gray-50 rounded-2xl min-h-[44px]">
              <Image 
                src={session.user?.image || 'https://api.dicebear.com/7.x/avataaars/svg'} 
                className="h-9 w-9 rounded-2xl bg-green-100 shadow-sm object-cover" 
                alt={session.user?.name || 'Avatar'} 
                width={80}
                height={80}
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
              />
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-black text-gray-900 leading-none">{session.user?.name}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Thành viên</p>
              </div>
            </Link>
          ) : mounted ? (
            <Link href="/login" className="flex items-center space-x-2 bg-gray-900 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-gray-900/10 min-h-[44px]">
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
