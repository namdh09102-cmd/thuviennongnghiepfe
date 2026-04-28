import React from 'react';
import Link from 'next/link';
import { Search, Map, Home, BookOpen, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative">
        <div className="text-[120px] font-black text-gray-50 leading-none select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center animate-bounce duration-[2000ms]">
            <Map className="w-20 h-20 text-green-600" />
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        <h1 className="text-3xl font-black text-gray-900">Không tìm thấy "vùng đất" này!</h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          Có vẻ như trang anh đang tìm kiếm không tồn tại hoặc đã được chuyển đi. Hãy thử tìm kiếm nội dung khác nhé.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <Link href="/" className="p-6 bg-white rounded-3xl border border-gray-50 shadow-sm hover:shadow-md hover:border-green-100 transition-all group text-center">
          <Home className="w-6 h-6 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Trang chủ</span>
        </Link>
        <Link href="/posts" className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all group text-center">
          <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Bài viết</span>
        </Link>
        <Link href="/hoi-dap" className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all group text-center">
          <HelpCircle className="w-6 h-6 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Hỏi đáp</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative">
        <input 
          type="text" 
          placeholder="Tìm kiến thức nông nghiệp..."
          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-12 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}
