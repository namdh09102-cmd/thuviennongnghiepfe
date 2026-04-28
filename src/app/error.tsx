'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry or similar service
    console.error('Unhandled Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="w-32 h-32 bg-red-50 rounded-[40px] flex items-center justify-center shadow-inner">
          <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg border border-red-50">
          <span className="text-xl">🛠️</span>
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl font-black text-gray-900">Ối! Có lỗi kỹ thuật rồi</h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          Đừng lo lắng, chúng mình đã ghi nhận sự cố này. Anh có thể thử tải lại trang hoặc quay về trang chủ để tiếp tục nhé.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-gray-300 uppercase tracking-widest mt-4">
            Mã lỗi: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
        <button
          onClick={() => reset()}
          className="flex-1 w-full bg-gray-900 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center space-x-2"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Thử tải lại trang</span>
        </button>
        
        <Link
          href="/"
          className="flex-1 w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-100 text-xs font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="pt-8 flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <MessageCircle className="w-3 h-3" />
        <span>Cần hỗ trợ? Liên hệ Admin</span>
      </div>
    </div>
  );
}
