'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PenSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FabButton() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only show when scrolling DOWN on feed pages (/ or /posts)
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    if (pathname === '/' || pathname.startsWith('/posts')) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      setVisible(false);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Hide if user is not logged in or not on a feed page
  if (!session?.user || !(pathname === '/' || pathname === '/posts')) return null;

  return (
    <Link
      href="/posts/create"
      className={`fixed bottom-[24px] right-[20px] z-50 flex items-center justify-center w-[52px] h-[52px] rounded-full text-white transition-all duration-300 shadow-lg bg-[#16a34a] hover:bg-green-700 active:scale-95 md:hidden ${
        visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Viết bài"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <PenSquare className="w-5 h-5" />
    </Link>
  );
}
