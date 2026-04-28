'use client';

import React from 'react';
import { Home, BookOpen, PenSquare, HelpCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', icon: Home, href: '/' },
    { label: 'Bài viết', icon: BookOpen, href: '/posts' },
    { label: 'Viết bài', icon: PenSquare, href: '/posts/create' },
    { label: 'Hỏi đáp', icon: HelpCircle, href: '/hoi-dap' },
    { label: 'Cá nhân', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around py-3 px-2 z-50 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center space-y-1 transition-all ${
              isActive ? 'text-green-600 scale-110' : 'text-gray-400'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'fill-green-50' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
