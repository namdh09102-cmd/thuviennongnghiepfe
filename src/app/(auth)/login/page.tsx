'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, Sprout } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Vui lòng nhập email');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email sai định dạng');
      valid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError('Email hoặc mật khẩu không chính xác');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setGeneralError('Đã có lỗi hệ thống xảy ra, vui lòng thử lại sau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      setGeneralError('Không thể đăng nhập bằng Google');
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
          <h2 className="text-2xl font-black text-gray-900 leading-tight">AgriLib</h2>
          <p className="text-xs font-semibold text-gray-400 mt-1">Cộng đồng nông dân Việt Nam</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center animate-shake">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Email
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

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 text-sm bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  passwordError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200 focus:border-green-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{passwordError}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-[11px] font-bold text-gray-600 uppercase">Ghi nhớ đăng nhập</span>
            </label>
            <Link href="#" className="text-[11px] font-bold text-green-600 uppercase hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              'ĐĂNG NHẬP'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase">
            <span className="px-2 bg-white text-gray-400">Hoặc</span>
          </div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
          <span>Đăng nhập bằng Google</span>
        </button>

        {/* Register Link */}
        <p className="mt-6 text-center text-xs font-bold text-gray-400 uppercase">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-green-600 hover:underline font-black ml-1">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}
