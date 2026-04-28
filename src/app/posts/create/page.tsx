'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Save, Send, Eye, EyeOff, Image as ImageIcon, Tag, Loader2, AlertCircle, X, UploadCloud } from 'lucide-react';
import DOMPurify from 'dompurify';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const CROP_OPTIONS = ['Lúa', 'Sầu riêng', 'Dưa lưới', 'Tiêu', 'Cà phê', 'Rau', 'Thủy sản'];

export default function PostEditor() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [tags, setTags] = useState('');

  // UI states
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auth Gate
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/posts/create');
    }
  }, [status, router]);

  // Validation logic
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    if (!category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    // Strip HTML tags to get pure text length for content validation
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      newErrors.content = 'Nội dung là bắt buộc';
    } else if (textContent.length < 100) {
      newErrors.content = 'Nội dung bài viết phải có ít nhất 100 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const handleSubmit = async () => {
    setToast(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setToast({ type: 'success', message: 'Bài viết đã được gửi duyệt!' });
      
      // Clear form
      setTitle('');
      setContent('');
      setCategory('');
      setExcerpt('');
      setThumbnail(null);
      setSelectedCrops([]);
      setTags('');

      setTimeout(() => {
        router.push('/posts');
      }, 1500);
    } catch (error) {
      setToast({ type: 'error', message: 'Có lỗi xảy ra, thử lại sau' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Prevent flash
  }

  const cleanHTML = typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content;

  const modules = {
    toolbar: [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border shadow-sm mt-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border animate-in slide-in-from-top duration-300 flex items-center space-x-2 text-xs font-bold ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'
        }`}>
          <AlertCircle className="h-4 w-4" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Đăng bài viết mới</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">Chia sẻ kỹ thuật, kinh nghiệm đến cộng đồng</p>
        </div>
        
        <button 
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-2 text-xs font-black bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-2xl transition-all"
        >
          {isPreview ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Chế độ sửa</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Xem trước</span>
            </>
          )}
        </button>
      </div>

      {isPreview ? (
        <div className="space-y-6 border border-gray-200 p-6 rounded-3xl bg-gray-50/50 animate-in fade-in duration-300">
          {thumbnail && (
            <img src={thumbnail} alt="Preview" className="w-full h-64 object-cover rounded-2xl shadow-sm" />
          )}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-green-700 font-black uppercase bg-green-50 px-2 py-1 rounded-lg">
                {category || 'Chưa phân loại'}
              </span>
              {selectedCrops.map(crop => (
                <span key={crop} className="text-[10px] text-amber-700 font-black uppercase bg-amber-50 px-2 py-1 rounded-lg">
                  {crop}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">{title || 'Tiêu đề bài viết trống'}</h2>
            {excerpt && (
              <p className="text-gray-500 text-sm mt-3 italic leading-relaxed font-medium">{excerpt}</p>
            )}
          </div>
          
          <div 
            className="prose prose-green text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: cleanHTML || '<p class="text-gray-400">Nội dung trống...</p>' }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Ảnh đại diện bài viết (Thumbnail)
            </label>
            {thumbnail ? (
              <div className="relative rounded-2xl overflow-hidden group shadow-sm border">
                <img src={thumbnail} alt="Thumbnail Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setThumbnail(null)}
                  className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnailChange} 
                  className="hidden" 
                  id="thumb-upload"
                />
                <label htmlFor="thumb-upload" className="flex flex-col items-center cursor-pointer text-center">
                  <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-green-600 transition-all mb-2" />
                  <span className="text-xs font-bold text-gray-700">Kéo thả hoặc bấm để tải ảnh lên</span>
                  <span className="text-[10px] text-gray-400 mt-1">Hỗ trợ JPG, PNG tối đa 5MB</span>
                </label>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ví dụ: Kỹ thuật tỉa cành tạo tán cho cây sầu riêng" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 text-sm font-bold bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                errors.title ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-green-100 focus:border-green-600'
              }`}
            />
            {errors.title && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{errors.title}</p>}
          </div>

          {/* Category Select */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
              Danh mục bài viết <span className="text-red-500">*</span>
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-4 py-3 text-sm font-bold bg-gray-50/50 border rounded-2xl focus:outline-none focus:bg-white focus:ring-2 transition-all appearance-none cursor-pointer ${
                errors.category ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-green-100 focus:border-green-600'
              }`}
            >
              <option value="">Chọn danh mục...</option>
              <option value="KyThuat">Kỹ thuật trồng trọt</option>
              <option value="SauBenh">Phòng trừ sâu bệnh</option>
              <option value="DinhDuong">Dinh dưỡng & Phân bón</option>
              <option value="ThiTruong">Thị trường nông sản</option>
            </select>
            {errors.category && <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5">{errors.category}</p>}
          </div>

          {/* Excerpt TextArea */}
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Mô tả ngắn
              </label>
              <span className="text-[10px] font-bold text-gray-400">{excerpt.length}/200 ký tự</span>
            </div>
            <textarea 
              placeholder="Tóm tắt ngắn gọn nội dung bài viết trong khoảng 1-2 câu..."
              value={excerpt}
              maxLength={200}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 text-sm font-medium bg-gray-50/50 border border-gray-200 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all rounded-2xl"
            />
          </div>

          {/* Related Crops Chips */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 mb-2">
              Cây trồng liên quan
            </label>
            <div className="flex flex-wrap gap-2">
              {CROP_OPTIONS.map(crop => {
                const isSelected = selectedCrops.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1 ${
                      isSelected 
                        ? 'bg-green-600 text-white shadow-sm shadow-green-600/30' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{crop}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Rich Text */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 mb-2">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            <div className={`border rounded-3xl overflow-hidden ${errors.content ? 'border-red-300' : 'border-gray-200'}`}>
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent}
                modules={modules}
                placeholder="Chia sẻ chi tiết kỹ thuật, mẹo hay tại đây..."
                className="bg-white text-sm min-h-[250px]"
              />
            </div>
            {errors.content && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{errors.content}</p>}
          </div>
        </div>
      )}

      {!isPreview && (
        <div className="flex justify-end space-x-2 mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="text-xs font-black text-gray-400 hover:text-gray-600 px-4 py-3 rounded-2xl transition-all uppercase"
          >
            Hủy
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 text-xs font-black bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 uppercase"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang đăng...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Đăng bài</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
