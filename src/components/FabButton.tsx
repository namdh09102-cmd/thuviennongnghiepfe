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
      className={`fixed bottom-20 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl bg-[#2E7D32] text-white hover:bg-green-800 active:scale-95 transition-all duration-300 ${
        visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Viết bài"
    >
      <PenSquare className="w-6 h-6" />
    </Link>
  );
}
