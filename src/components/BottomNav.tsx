'use client';

import React from 'react';
import { Home, FileText, PlusSquare, HelpCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

export default function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Trang chủ', icon: Home, href: '/' },
    { label: 'Bài viết', icon: FileText, href: '/posts' },
    { label: 'Viết bài', icon: PlusSquare, href: '/posts/create' },
    { label: 'Hỏi đáp', icon: HelpCircle, href: '/hoi-dap' },
    { label: 'Cá nhân', icon: User, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-40 md:hidden h-[64px] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const isProfile = item.href === '/profile';
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 flex-1 min-h-[44px] min-w-[44px] relative transition-all duration-200 ${
              isActive ? 'text-[#16a34a] font-bold' : 'text-gray-400 font-medium'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${isActive ? 'scale-105' : ''}`} />
              {isProfile && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
