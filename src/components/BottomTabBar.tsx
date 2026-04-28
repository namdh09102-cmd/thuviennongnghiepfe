'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PlusSquare, User, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

export default function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Bài viết', href: '/posts', icon: FileText },
    { name: 'Tạo bài', href: '/posts/create', icon: PlusSquare },
    { name: 'Hỏi đáp', href: '/hoi-dap', icon: HelpCircle },
    { name: 'Cá nhân', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-white/95 backdrop-blur-md pb-safe md:hidden">
      <div className="flex h-full items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
                isActive ? 'text-green-600 font-semibold' : 'text-gray-500 hover:text-green-600'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-wider">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
