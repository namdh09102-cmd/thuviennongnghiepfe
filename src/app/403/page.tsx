'use client';

import React from 'react';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center space-y-6 max-w-md animate-in fade-in zoom-in duration-300">
        <div className="mx-auto h-24 w-24 bg-red-50 rounded-3xl flex items-center justify-center shadow-inner">
          <ShieldX className="h-12 w-12 text-red-600 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">403</h1>
          <h2 className="text-xl font-bold text-gray-800">Truy cập bị từ chối</h2>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Rất tiếc, tài khoản của bạn không có đủ quyền hạn để truy cập vào trang quản trị này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là một sự nhầm lẫn.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
          
          <Link 
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-2xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
