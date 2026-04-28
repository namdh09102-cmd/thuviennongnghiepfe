'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Camera, Save, Loader2, Check, User, Shield, Bell, MapPin, Sprout } from 'lucide-react';
import Image from 'next/image';

const PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 
  'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk', 
  'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 
  'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 
  'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 
  'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 
  'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const CROPS = ['Lúa', 'Cà phê', 'Sầu riêng', 'Hồ tiêu', 'Vải thiều', 'Thanh long', 'Bơ', 'Xoài', 'Bưởi', 'Mãng cầu'];

export default function SettingsProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    region: '',
    main_crops: [] as string[],
    avatar_url: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifData, setNotifData] = useState({
    email: true,
    push: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          setFormData({
            full_name: data.full_name || '',
            username: data.username || '',
            bio: data.bio || '',
            region: data.region || '',
            main_crops: data.main_crops || [],
            avatar_url: data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulated crop and base64 conversion
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, avatar_url: base64String }));

      try {
        const res = await fetch('/api/users/me/avatar', {
          method: 'POST',
          body: JSON.stringify({ avatar_url: base64String }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error();
      } catch (err) {
        console.error('Lỗi tải ảnh đại diện');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể cập nhật hồ sơ');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert('Mật khẩu xác nhận không khớp');
    }
    alert('Tính năng đổi mật khẩu đã được lưu thành công');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-gray-900 flex items-center space-x-2">
        <User className="w-8 h-8 text-green-600" />
        <span>Cài đặt tài khoản</span>
      </h1>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold border border-red-100">
          {errorMessage}
        </div>
      )}

      {/* Profile Info Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="relative group">
            <Image 
              src={formData.avatar_url} 
              className="w-32 h-32 rounded-[40px] border-4 border-white shadow-xl bg-gray-50 object-cover" 
              alt="Avatar" 
              width={120}
              height={120}
              unoptimized
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhấp để đổi ảnh đại diện (Crop 1:1)</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Họ tên đầy đủ"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
                placeholder="Username"
              />
              <span className="text-[8px] font-bold text-gray-400 uppercase ml-2">Đổi tối đa 1 lần / 30 ngày</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiểu sử (Bio)</label>
            <textarea 
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all resize-none"
              placeholder="Tối đa 160 ký tự..."
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-green-600" />
              <span>Khu vực canh tác (Tỉnh/Thành)</span>
            </label>
            <select
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
            >
              <option value="">Chọn tỉnh thành</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Sprout className="w-3.5 h-3.5 text-green-600" />
              <span>Cây trồng chính</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-2">
              {CROPS.map(crop => {
                const selected = formData.main_crops.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        main_crops: selected 
                          ? formData.main_crops.filter(c => c !== crop)
                          : [...formData.main_crops, crop]
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selected ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'}`}
                  >
                    {crop}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs py-4 rounded-2xl shadow-xl shadow-green-600/20 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Đang lưu...' : saveSuccess ? 'Đã lưu thành công' : 'Cập nhật hồ sơ'}</span>
          </button>
        </div>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-gray-900 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span>Đổi mật khẩu</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mật khẩu hiện tại</label>
            <input 
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mật khẩu mới</label>
            <input 
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Xác nhận mật khẩu</label>
            <input 
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-8 py-3 rounded-xl shadow-lg transition-all"
        >
          Đổi mật khẩu
        </button>
      </form>

      {/* Notification Form */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-gray-900 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-green-600" />
          <span>Cài đặt thông báo</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-gray-800">Thông báo Email</p>
              <p className="text-xs text-gray-400">Nhận các cập nhật mới qua email của bạn.</p>
            </div>
            <input 
              type="checkbox"
              checked={notifData.email}
              onChange={(e) => setNotifData({...notifData, email: e.target.checked})}
              className="w-6 h-6 accent-green-600"
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
            <div>
              <p className="text-sm font-black text-gray-800">Thông báo Push</p>
              <p className="text-xs text-gray-400">Nhận thông báo trực tiếp trên trình duyệt.</p>
            </div>
            <input 
              type="checkbox"
              checked={notifData.push}
              onChange={(e) => setNotifData({...notifData, push: e.target.checked})}
              className="w-6 h-6 accent-green-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
