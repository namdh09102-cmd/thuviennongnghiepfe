'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useJournalStore, JournalEntry } from '../../../store/journalStore';
import { Calendar, Plus, ArrowLeft, DollarSign, Download, Droplet, Shield, Info, Sparkles, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { seasons, entries, addEntry } = useJournalStore();

  const season = useMemo(() => seasons.find((s) => s.id === id), [seasons, id]);
  const seasonEntries = useMemo(() => entries.filter((e) => e.seasonId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [entries, id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityType, setActivityType] = useState<'fertilize' | 'spray' | 'water' | 'harvest' | 'other'>('fertilize');
  const [note, setNote] = useState('');
  const [cost, setCost] = useState('');

  if (!season) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-400">Mùa vụ không tồn tại.</p>
        <Link href="/nhat-ky" className="text-emerald-600 text-xs font-bold mt-2 inline-block">Quay lại</Link>
      </div>
    );
  }

  // 3. Summary sidebar calculations
  const totalCost = seasonEntries.reduce((sum, entry) => sum + entry.cost, 0);
  
  const progressPercent = useMemo(() => {
    const start = new Date(season.startDate).getTime();
    const now = new Date().getTime();
    const harvestTime = start + season.expectedHarvestDays * 24 * 60 * 60 * 1000;
    
    if (now >= harvestTime) return 100;
    const pct = ((now - start) / (harvestTime - start)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [season]);

  const daysRemaining = useMemo(() => {
    const start = new Date(season.startDate).getTime();
    const harvestTime = start + season.expectedHarvestDays * 24 * 60 * 60 * 1000;
    const diff = harvestTime - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [season]);

  // 5. Biểu đồ chi phí theo tuần
  const chartData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    seasonEntries.forEach(e => {
      const d = new Date(e.date);
      const weekStr = `Tuần ${Math.ceil(d.getDate() / 7)}`;
      dataMap[weekStr] = (dataMap[weekStr] || 0) + e.cost;
    });
    return Object.entries(dataMap).map(([week, value]) => ({ week, cost: value / 1000 })).reverse();
  }, [seasonEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;

    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      seasonId: id,
      date,
      activityType,
      note,
      cost: cost ? parseFloat(cost) : 0,
      images: []
    };

    addEntry(newEntry);
    setNote('');
    setCost('');
    setIsModalOpen(false);
  };

  // 4. Export PDF tóm tắt mùa vụ
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`NHAT KY CANH TAC: ${season.name.toUpperCase()}`, 10, 20);

    doc.setFontSize(12);
    doc.text(`Loai cay: ${season.cropType}`, 10, 35);
    doc.text(`Quy mo: ${season.area.toLocaleString()} m2`, 10, 45);
    doc.text(`Ngay bat dau: ${new Date(season.startDate).toLocaleDateString('vi-VN')}`, 10, 55);
    doc.text(`Tong chi phi dau tu: ${totalCost.toLocaleString()} VND`, 10, 65);

    doc.text('LICH SU NHAT KY:', 10, 80);
    let y = 90;
    seasonEntries.forEach((entry, index) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const actText = entry.activityType === 'fertilize' ? 'Bon phan' : entry.activityType === 'spray' ? 'Phun xit' : entry.activityType === 'water' ? 'Tuoi nuoc' : entry.activityType === 'harvest' ? 'Thu hoach' : 'Khac';
      doc.text(`${index + 1}. ${entry.date} [${actText}] - Chi phi: ${entry.cost.toLocaleString()} VND`, 10, y);
      doc.text(`Ghi chu: ${entry.note}`, 15, y + 8);
      y += 20;
    });

    doc.save(`nhat_ky_${season.id}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link href="/nhat-ky" className="flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-green-700">
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </Link>
        
        <button
          onClick={exportPDF}
          className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Xuất PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột Chính: Timeline & Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header */}
          <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-gray-900">{season.name}</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ghi nhật ký</span>
              </button>
            </div>
          </div>

          {/* Biểu đồ chi phí */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-700 flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Biểu đồ chi phí (nghìn VND)</span>
              </h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="week" fontSize={10} stroke="#9CA3AF" />
                    <YAxis fontSize={10} stroke="#9CA3AF" />
                    <Tooltip formatter={(val) => [`${val}k VND`, 'Chi phí']} />
                    <Bar dataKey="cost" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="relative border-l-2 border-dashed border-emerald-200 ml-4 pl-6 space-y-6">
            {seasonEntries.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">Chưa có nhật ký hoạt động nào.</p>
            ) : (
              seasonEntries.map((entry) => (
                <div key={entry.id} className="relative">
                  {/* Icon Node */}
                  <div className="absolute -left-[35px] top-1 h-6 w-6 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-emerald-700 shadow-sm">
                    {entry.activityType === 'fertilize' && <Droplet className="h-3 w-3" />}
                    {entry.activityType === 'spray' && <Shield className="h-3 w-3" />}
                    {entry.activityType === 'harvest' && <ClipboardCheck className="h-3 w-3" />}
                    {(entry.activityType === 'water' || entry.activityType === 'other') && <Info className="h-3 w-3" />}
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] font-semibold">
                      <span className="text-gray-500">{new Date(entry.date).toLocaleDateString('vi-VN')}</span>
                      {entry.cost > 0 && (
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center">
                          -{entry.cost.toLocaleString()} đ
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-xs font-bold text-gray-900 mt-2">{entry.note}</h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Cột Phụ: Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-6 sticky top-20">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b">Tổng quan mùa vụ</h3>

            {/* Tổng chi phí */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Tổng đầu tư</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {totalCost.toLocaleString()} <span className="text-xs font-medium text-gray-500">đ</span>
              </span>
            </div>

            {/* Tiến độ */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                <span>Tiến độ sinh trưởng</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${progressPercent}%` }} className="bg-emerald-600 h-full transition-all duration-500"></div>
              </div>
            </div>

            {/* Ngày dự kiến thu hoạch */}
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="block text-[10px] font-bold text-emerald-800">Còn lại khoảng</span>
                <span className="text-base font-black text-emerald-950">
                  {daysRemaining} ngày <span className="text-[10px] font-normal text-emerald-700">đến thu hoạch</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm Nhật Ký */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-gray-900 mb-4">Ghi Nhật Ký Hoạt Động</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Ngày thực hiện</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Hoạt động</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full border rounded-xl px-3 py-2 text-xs bg-gray-50 focus:outline-none"
                  >
                    <option value="fertilize">Bón phân</option>
                    <option value="spray">Phun thuốc</option>
                    <option value="water">Tưới nước</option>
                    <option value="harvest">Thu hoạch</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Chi phí (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Ghi chú / Mô tả</label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Bón 50kg NPK Đầu Trâu, xịt rầy..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
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
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
