'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-green-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-emerald-900/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-[32px] p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-950/50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-900/30">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center space-x-2">
            <span>TVNN Control Center</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-2 uppercase tracking-wider">
            Quản trị viên Thư viện Nông nghiệp
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 border border-red-900/30 text-red-400 text-xs font-bold text-center rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">
              Email quản trị
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-600 transition-all font-medium"
                placeholder="admin@thuviennongnghiep.vn"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-600" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">
              Mật mã
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-600 transition-all font-medium"
                placeholder="••••••••"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-600" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-2xl shadow-xl shadow-green-950/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
          </button>
        </form>
      </div>
    </div>
  );
}
