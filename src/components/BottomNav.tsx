'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Home, FileText, PlusSquare, HelpCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';

export default function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setVisible(false); // Hide on scroll down
      } else {
        setVisible(true); // Show on scroll up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/posts/') && pathname !== '/posts/create') return null;

  const navItems = [
    { label: 'Trang chủ', icon: Home, href: '/' },
    { label: 'Bài viết', icon: FileText, href: '/posts' },
    { label: 'Viết bài', icon: PlusSquare, href: '/posts/create' },
    { label: 'Hỏi đáp', icon: HelpCircle, href: '/hoi-dap' },
    { label: 'Tôi', icon: User, href: '/profile' },
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around z-40 md:hidden h-[64px] shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-2 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const isProfile = item.href === '/profile';
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 min-h-[48px] min-w-[48px] relative transition-all duration-200 ${
              isActive ? 'text-[#16a34a] font-bold' : 'text-gray-400 font-medium hover:text-gray-600'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110 text-[#16a34a]' : ''}`} />
              {isProfile && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-[#16a34a]' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
