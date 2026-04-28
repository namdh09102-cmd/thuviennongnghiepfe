'use client';

import React, { useState } from 'react';
import { Calendar, Droplet, Shield, AlertTriangle, Check } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'fertilize' | 'spray' | 'harvest';
  completed: boolean;
}

export default function CropSchedulePage() {
  const [crop, setCrop] = useState('Lúa');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([
    {
      id: 'e1',
      date: 'Giai đoạn 7-10 ngày sau sạ',
      title: 'Bón phân thúc đợt 1',
      description: 'Bón phân NPK tỷ lệ đạm cao để kích thích ra rễ và đẻ nhánh.',
      type: 'fertilize',
      completed: true
    },
    {
      id: 'e2',
      date: 'Giai đoạn 15-20 ngày sau sạ',
      title: 'Phun trừ cỏ & Sâu cuốn lá',
      description: 'Kiểm tra mật độ sâu cuốn lá, phun phòng nếu cần thiết.',
      type: 'spray',
      completed: false
    },
    {
      id: 'e3',
      date: 'Giai đoạn 40-45 ngày sau sạ',
      title: 'Bón phân đón đòng',
      description: 'Bón Kali kết hợp Đạm để nuôi đòng to, chắc hạt.',
      type: 'fertilize',
      completed: false
    }
  ]);

  const toggleComplete = (id: string) => {
    setSchedule(schedule.map(ev => ev.id === id ? { ...ev, completed: !ev.completed } : ev));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white p-5 rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span>Lịch Mùa Vụ Cá Nhân</span>
          </h1>
          <p className="text-xs text-green-100 mt-1">
            Quản lý quy trình bón phân & phun thuốc chuẩn kỹ thuật.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 border rounded-2xl shadow-sm grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Loại cây trồng</label>
          <select 
            value={crop} 
            onChange={(e) => setCrop(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Lúa">Lúa gạo</option>
            <option value="Sầu riêng">Sầu riêng</option>
            <option value="Dưa lưới">Dưa lưới</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ngày xuống giống</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="relative border-l-2 border-dashed border-green-300 ml-4 pl-6 space-y-6">
        {schedule.map((ev, index) => (
          <div key={ev.id} className="relative">
            <button 
              onClick={() => toggleComplete(ev.id)}
              className={`absolute -left-[34px] top-1 h-6 w-6 rounded-full flex items-center justify-center border shadow-sm transition-colors ${
                ev.completed 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400 hover:border-green-500'
              }`}
            >
              {ev.completed ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs font-bold">{index + 1}</span>}
            </button>

            <div className={`bg-white border rounded-2xl p-4 shadow-sm transition-all duration-200 ${
              ev.completed ? 'opacity-60 border-gray-200' : 'border-l-4 border-l-green-600'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  {ev.date}
                </span>
                <div className="flex items-center text-[10px] text-gray-500 font-medium">
                  {ev.type === 'fertilize' && <Droplet className="h-3.5 w-3.5 text-blue-500 mr-1" />}
                  {ev.type === 'spray' && <Shield className="h-3.5 w-3.5 text-red-500 mr-1" />}
                  <span>{ev.type === 'fertilize' ? 'Bón phân' : 'Phun thuốc'}</span>
                </div>
              </div>
              
              <h3 className={`text-xs font-bold mt-2 text-gray-900 ${ev.completed ? 'line-through text-gray-500' : ''}`}>
                {ev.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {ev.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Lưu ý an toàn:</span> Tuân thủ nguyên tắc 4 đúng khi phun thuốc BVTV. Ngưng phun thuốc trước ngày thu hoạch ít nhất 14-21 ngày.
        </div>
      </div>
    </div>
  );
}
