'use client';

import React from 'react';
import { Home, FileText, PenSquare, HelpCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', icon: Home, href: '/' },
    { label: 'Bài viết', icon: FileText, href: '/posts' },
    { label: 'Viết', icon: PenSquare, href: '/posts/create' },
    { label: 'Hỏi đáp', icon: HelpCircle, href: '/hoi-dap' },
    { label: 'Cá nhân', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-2 z-40 lg:hidden h-[60px] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 flex-1 min-h-[48px] min-w-[48px] relative transition-all duration-300 ${
              isActive ? 'text-green-600 font-black' : 'text-gray-400 font-bold'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight">
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-green-600 rounded-full animate-fade-in" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
