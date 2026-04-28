'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PenSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function FabButton() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setVisible(false); // Hide on scroll down
      } else {
        setVisible(true); // Show on scroll up
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!session?.user) return null;

  return (
    <Link
      href="/posts/create"
      className={`fixed bottom-[80px] right-[16px] z-50 flex items-center justify-center w-[56px] h-[56px] rounded-full text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-[#16a34a] hover:bg-green-700 active:scale-95 ${
        visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Viết bài"
    >
      <PenSquare className="w-6 h-6" />
    </Link>
  );
}
