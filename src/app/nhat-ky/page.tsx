'use client';

import React, { useState } from 'react';
import { useJournalStore, Season } from '../../store/journalStore';
import Link from 'next/link';
import { Calendar, Plus, Trash2, ArrowRight, Sprout, MapPin } from 'lucide-react';

export default function JournalListPage() {
  const { seasons, addSeason, deleteSeason } = useJournalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('Lúa');
  const [area, setArea] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area || !startDate) return;

    const newSeason: Season = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      cropType,
      area: parseFloat(area),
      startDate,
      expectedHarvestDays: cropType === 'Lúa' ? 100 : cropType === 'Sầu riêng' ? 120 : 90,
    };

    addSeason(newSeason);
    setName('');
    setArea('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-800 to-emerald-600 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center space-x-3">
            <Sprout className="h-7 w-7 text-emerald-200" />
            <span>Nhật Ký Canh Tác</span>
          </h1>
          <p className="text-xs text-emerald-50 mt-1 opacity-90">
            Theo dõi chi phí, hoạt động chăm sóc và tiến độ mùa vụ thông minh.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-white text-green-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm mùa vụ</span>
        </button>
      </div>

      {/* Modal Thêm Mùa Vụ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-gray-900 mb-4">Tạo Mùa Vụ Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Tên mùa vụ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lúa Hè Thu 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Loại cây</label>
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-gray-50 focus:outline-none"
                  >
                    <option value="Lúa">Lúa</option>
                    <option value="Sầu riêng">Sầu riêng</option>
                    <option value="Dưa lưới">Dưa lưới</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Diện tích (m²)</label>
                  <input
                    type="number"
                    placeholder="Ví dụ: 5000"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 transition-colors shadow-md"
                >
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Mùa Vụ */}
      {seasons.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-3xl">
          <p className="text-sm text-gray-400 font-medium">Chưa có mùa vụ nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                    {season.cropType}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa mùa vụ này?')) deleteSeason(season.id);
                    }}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-3">{season.name}</h3>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>Bắt đầu: {new Date(season.startDate).toLocaleDateString('vi-VN')}</span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>Quy mô: {season.area.toLocaleString()} m²</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end">
                <Link
                  href={`/nhat-ky/${season.id}`}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 group-hover:translate-x-1 transition-all"
                >
                  <span>Chi tiết nhật ký</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
