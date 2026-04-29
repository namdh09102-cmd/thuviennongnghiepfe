'use client';

import React, { useState } from 'react';
import { Mail, Loader2, Sprout, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    setEmailError('');
    if (!email) {
      setEmailError('Vui lòng nhập email');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email sai định dạng');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đã có lỗi xảy ra');
      }

      setSuccessMessage('Hướng dẫn đặt lại mật khẩu đã được gửi (hoặc ghi nhận). Vui lòng kiểm tra email hoặc sử dụng mã xác nhận.');
    } catch (err: any) {
      setGeneralError(err.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-transparent p-4 sm:p-6">
      <div className="w-full max-w-[400px] bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
            <Sprout className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-widest">TVNN</h2>
          <p className="text-xs font-semibold text-gray-400 mt-1">Khôi phục mật khẩu</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
            {generalError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-xs font-bold text-center">
            {successMessage}
          </div>
        )}

        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
                Email tài khoản
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                    emailError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200 focus:border-green-600'
                  }`}
                />
              </div>
              {emailError && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                'GỬI YÊU CẦU'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center mt-4">
            <Link href="/reset-password" className="text-sm font-bold text-green-600 hover:underline flex items-center justify-center">
              <span>Tiếp tục đặt lại mật khẩu</span>
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs font-bold text-gray-400 uppercase hover:text-green-600 flex items-center justify-center">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Trở lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
