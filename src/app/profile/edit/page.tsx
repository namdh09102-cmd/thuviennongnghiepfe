'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Camera, Save, ArrowLeft, Loader2, Check, MapPin, Sprout } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { data: profile, mutate } = useSWR(session?.user ? `/api/profile` : null, fetcher);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    region: '',
    main_crops: [] as string[],
    avatar_url: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        region: profile.region || '',
        main_crops: profile.main_crops || [],
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await mutate();
        await update(); // Update next-auth session
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataPayload = new FormData();
    formDataPayload.append('file', file);

    try {
      setIsSaving(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataPayload,
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar_url: data.url }));
      }
    } catch (err) {
      console.error('Upload failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
        <h1 className="text-xl font-black text-gray-900">Chỉnh sửa hồ sơ</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <Image 
              src={formData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'} 
              className="w-32 h-32 rounded-[32px] border-4 border-gray-50 bg-gray-50 object-cover" 
              alt="Avatar" 
              width={128}
              height={128}
              unoptimized
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhấn vào ảnh để thay đổi</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
            <input 
              type="text" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Nhập tên đầy đủ của bạn"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiểu sử (Bio)</label>
            <textarea 
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all resize-none"
              placeholder="Giới thiệu ngắn về bản thân bạn..."
              maxLength={160}
            />
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400">{formData.bio.length}/160</span>
            </div>
          </div>
        </div>

        {/* Agricultural Info */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Khu vực canh tác</span>
            </label>
            <input 
              type="text" 
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-500 transition-all"
              placeholder="Ví dụ: Buôn Ma Thuột, Đắk Lắk"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Sprout className="w-3.5 h-3.5" />
              <span>Cây trồng chính</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Lúa', 'Cà phê', 'Sầu riêng', 'Vải thiều', 'Hồ tiêu', 'Bơ'].map(crop => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => {
                    const exists = formData.main_crops.includes(crop);
                    setFormData({
                      ...formData,
                      main_crops: exists 
                        ? formData.main_crops.filter(c => c !== crop)
                        : [...formData.main_crops, crop]
                    });
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.main_crops.includes(crop) ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'}`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-gray-900 hover:bg-green-700 text-white font-black text-xs py-4 rounded-[24px] shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Đang lưu...' : saveSuccess ? 'Đã lưu thành công' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
