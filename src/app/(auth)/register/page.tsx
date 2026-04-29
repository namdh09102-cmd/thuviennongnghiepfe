'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Eye, EyeOff, Sprout, User } from 'lucide-react';
import Link from 'next/link';

function RegisterContent() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    let valid = true;
    setFullNameError('');
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!fullName) {
      setFullNameError('Vui lòng nhập họ và tên');
      valid = false;
    }

    if (!email) {
      setEmailError('Vui lòng nhập email');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email sai định dạng');
      valid = false;
    }

    if (!username) {
      setUsernameError('Vui lòng nhập username');
      valid = false;
    } else if (username.length < 3) {
      setUsernameError('Username phải có ít nhất 3 ký tự');
      valid = false;
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          username,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký không thành công');
      }

      // Redirect to login after successful registration
      router.push('/login?registered=true');
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
          <p className="text-xs font-semibold text-gray-400 mt-1">Cộng đồng nông dân Việt Nam</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold text-center">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  fullNameError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200 focus:border-green-600'
                }`}
              />
            </div>
            {fullNameError && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{fullNameError}</p>}
          </div>

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

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className={`w-full pl-10 pr-4 py-3 text-sm bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  usernameError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200 focus:border-green-600'
                }`}
              />
            </div>
            {usernameError && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{usernameError}</p>}
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-12 py-3 text-sm bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                  confirmPasswordError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200 focus:border-green-600'
                }`}
              />
            </div>
            {confirmPasswordError && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{confirmPasswordError}</p>}
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
                <span>Đang đăng ký...</span>
              </>
            ) : (
              'ĐĂNG KÝ'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-xs font-bold text-gray-400 uppercase">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-green-600 hover:underline font-black ml-1">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
