'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-orange-600 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center space-x-2 fixed top-14 left-0 right-0 z-[100] shadow-md animate-pulse">
      <WifiOff className="h-4 w-4" />
      <span>Bạn đang ngắt kết nối mạng. Vui lòng kiểm tra lại!</span>
    </div>
  );
}
