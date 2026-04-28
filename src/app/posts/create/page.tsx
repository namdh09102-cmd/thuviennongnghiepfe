'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '../../../lib/axios';
import { Save, Send, Eye, EyeOff, Image as ImageIcon, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function PostEditor() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [tags, setTags] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/categories');
        if (Array.isArray(res.data)) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategory(res.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback
        setCategories([
          { id: 'c1', name: 'Trồng trọt' },
          { id: 'c2', name: 'Chăn nuôi' },
          { id: 'c3', name: 'Phân bón' },
          { id: 'c4', name: 'Sâu bệnh' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axiosInstance.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.url) {
        setContent((prev) => prev + `<br/><img src="${res.data.url}" alt="Inline Image" class="rounded-xl max-w-full h-auto my-4" /><br/>`);
        alert('Đã chèn ảnh thành công!');
      }
    } catch (error) {
      const mockUrl = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=500&q=60';
      setContent((prev) => prev + `<br/><img src="${mockUrl}" alt="Mock Image" class="rounded-xl max-w-full h-auto my-4" /><br/>`);
      alert('Chèn ảnh demo thành công!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập Tiêu đề và Nội dung');
      return;
    }

    setLoading(true);
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      await axiosInstance.post('/posts', {
        title,
        content,
        categoryId: category || undefined,
        tags: parsedTags,
        status
      });

      alert(status === 'PUBLISHED' ? 'Đã đăng bài viết!' : 'Đã lưu bản nháp!');
      router.push('/');
    } catch (error: any) {
      alert('Gửi bài thất bại: ' + (error.response?.data?.message || error.message));
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const cleanHTML = typeof window !== 'undefined' ? DOMPurify.sanitize(content) : content;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 md:p-6 rounded-3xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Soạn bài viết</h1>
        
        <button 
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-1 text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition-colors"
        >
          {isPreview ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Sửa bài</span>
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
        <div className="space-y-4 border p-4 rounded-2xl bg-gray-50/50">
          <div className="border-b pb-2">
            <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
              {categories.find(c => c.id === category)?.name || 'Chưa phân loại'}
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 mt-1">{title || 'Tiêu đề trống'}</h2>
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(',').map((t, idx) => t.trim() && (
                <span key={idx} className="bg-gray-200 text-gray-700 text-[9px] px-2 py-0.5 rounded-full">
                  #{t.trim()}
                </span>
              ))}
            </div>
          </div>
          
          <div 
            className="prose prose-green text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: cleanHTML || '<p class="text-gray-400">Nội dung trống...</p>' }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tiêu đề</label>
            <input 
              type="text" 
              placeholder="Nhập tiêu đề bài viết..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Danh mục</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>Thẻ (Tags)</span>
              </label>
              <input 
                type="text" 
                placeholder="Lúa, Dưa, NPK..." 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700">Nội dung</label>
              
              <label className="cursor-pointer flex items-center space-x-1 text-[11px] text-green-600 font-semibold hover:text-green-700">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Thêm ảnh</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUploadImage} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <div className="border rounded-2xl overflow-hidden">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent}
                modules={modules}
                className="bg-white text-sm min-h-[200px]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <button
          onClick={() => handleSubmit('DRAFT')}
          disabled={loading}
          className="flex items-center space-x-1 text-xs font-semibold bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>Lưu nháp</span>
        </button>

        <button
          onClick={() => handleSubmit('PUBLISHED')}
          disabled={loading}
          className="flex items-center space-x-1 text-xs font-semibold bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Đăng bài</span>
        </button>
      </div>
    </div>
  );
}
