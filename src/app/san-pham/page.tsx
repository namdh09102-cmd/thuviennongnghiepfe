'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_PRODUCTS, Product } from '../../data/productData';
import { Search, Filter, Scale, Star, ExternalLink, Check, HelpCircle, Sparkles } from 'lucide-react';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // AI recommendation
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesCrop = cropFilter === 'all' || p.suitableCrops.some(c => c.toLowerCase().includes(cropFilter.toLowerCase()));
      return matchesSearch && matchesCategory && matchesCrop;
    });
  }, [searchQuery, categoryFilter, cropFilter]);

  const handleSelectCompare = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      if (selectedProducts.length >= 3) {
        alert('Chỉ so sánh tối đa 3 sản phẩm cùng lúc!');
        return;
      }
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;

    try {
      setIsAILoading(true);
      setAiResponse('');
      
      const prompt = `Tôi đang làm nông. Hãy tư vấn về sản phẩm cho câu hỏi: "${aiPrompt}". Chỉ đề cập đến các hoạt chất/sản phẩm phổ biến an toàn.`;
      
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      
      const data = await res.json();
      if (data.content) {
        setAiResponse(data.content);
      }
    } catch (error) {
      console.error('AI Advisor failed:', error);
      setAiResponse('Không thể kết nối tới cố vấn AI lúc này. Hãy kiểm tra lại kết nối.');
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-900 to-emerald-700 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-black flex items-center space-x-2">
          <Scale className="h-6 w-6 text-emerald-300" />
          <span>Tra Cứu & So Sánh Vật Tư</span>
        </h1>
        <p className="text-xs mt-1 text-emerald-100">
          Tìm kiếm phân bón, thuốc bảo vệ thực vật phù hợp và so sánh giá cả tốt nhất.
        </p>
      </div>

      {/* AI Assistant Mini-Form */}
      <div className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          <span>Hỏi nhanh cố vấn vật tư AI</span>
        </h3>
        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            placeholder="Ví dụ: Nên dùng phân bón nào nuôi trái sầu riêng non?"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isAILoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {isAILoading ? 'Đang giải đáp...' : 'Hỏi AI'}
          </button>
        </form>
        {aiResponse && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-gray-800 leading-relaxed animate-in slide-in-from-top duration-200">
            <b>🤖 AI tư vấn:</b> {aiResponse}
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên SP, thành phần..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs border rounded-xl px-3 py-2 focus:outline-none bg-white text-gray-700 font-medium"
        >
          <option value="all">Tất cả danh mục</option>
          <option value="fertilizer">Phân bón</option>
          <option value="pesticide">Thuốc BVTV</option>
        </select>

        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="text-xs border rounded-xl px-3 py-2 focus:outline-none bg-white text-gray-700 font-medium"
        >
          <option value="all">Tất cả cây trồng</option>
          <option value="lúa">Lúa</option>
          <option value="sầu riêng">Sầu riêng</option>
          <option value="rau">Rau màu</option>
        </select>
      </div>

      {/* Nút So sánh Floating */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-full shadow-xl z-40 flex items-center space-x-4 text-xs animate-in slide-in-from-bottom duration-300">
          <span className="font-semibold">Đã chọn: {selectedProducts.length}/3</span>
          <button
            onClick={() => setIsComparing(!isComparing)}
            className="px-3 py-1.5 bg-green-600 font-bold rounded-full hover:bg-green-700 transition-colors"
          >
            {isComparing ? 'Ẩn so sánh' : 'So sánh ngay'}
          </button>
        </div>
      )}

      {/* BẢNG SO SÁNH SIDE-BY-SIDE */}
      {isComparing && selectedProducts.length > 0 && (
        <div className="bg-white p-6 border border-green-200 rounded-3xl shadow-lg overflow-x-auto animate-in zoom-in-95 duration-200">
          <h2 className="text-sm font-black text-gray-900 mb-4">Bảng so sánh chi tiết</h2>
          <table className="w-full text-xs border-collapse text-left min-w-[500px]">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-gray-400 font-medium w-1/4">Tiêu chí</th>
                {selectedProducts.map(p => (
                  <th key={p.id} className="py-2 font-black text-emerald-800 text-center">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2.5 text-gray-500 font-medium">Hãng / Thương hiệu</td>
                {selectedProducts.map(p => <td key={p.id} className="py-2.5 text-center font-bold">{p.brand}</td>)}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 text-gray-500 font-medium">Thành phần hoạt chất</td>
                {selectedProducts.map(p => <td key={p.id} className="py-2.5 text-center text-gray-700">{p.ingredients}</td>)}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 text-gray-500 font-medium">Liều lượng</td>
                {selectedProducts.map(p => <td key={p.id} className="py-2.5 text-center text-gray-600">{p.dosage}</td>)}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 text-gray-500 font-medium">Giá tham khảo</td>
                {selectedProducts.map(p => <td key={p.id} className="py-2.5 text-center font-black text-red-600">{p.price.toLocaleString()} đ</td>)}
              </tr>
              <tr className="border-b">
                <td className="py-2.5 text-gray-500 font-medium">Ưu điểm</td>
                {selectedProducts.map(p => (
                  <td key={p.id} className="py-2.5 text-center text-emerald-700 font-medium">
                    {p.pros.join(', ')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Grid danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 right-2 text-[9px] font-bold bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded-full">
                  {product.subCategory}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center text-amber-500 text-[10px]">
                  <Star className="h-3 w-3 fill-amber-500" />
                  <span className="ml-0.5 font-bold">{product.rating}</span>
                  <span className="text-gray-400 ml-2">{product.brand}</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {product.suitableCrops.map(c => (
                    <span key={c} className="text-[8px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex flex-col space-y-2 border-t border-gray-50 mt-2">
              <span className="text-sm font-black text-red-600 mt-2">
                {product.price.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">đ</span>
              </span>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => handleSelectCompare(product)}
                  className={`flex-1 py-2 border rounded-xl text-[10px] font-bold flex items-center justify-center space-x-1 transition-all ${
                    selectedProducts.find(p => p.id === product.id)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Check className={`h-3.5 w-3.5 ${selectedProducts.find(p => p.id === product.id) ? 'block' : 'hidden'}`} />
                  <span>{selectedProducts.find(p => p.id === product.id) ? 'Đã chọn' : 'So sánh'}</span>
                </button>

                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <span>Mua</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
