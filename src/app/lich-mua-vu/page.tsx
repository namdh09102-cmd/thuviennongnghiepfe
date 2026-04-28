'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Droplet, Shield, Check } from 'lucide-react';

// Data object requested by the user
const cropData: Record<string, { stage: string; type: string; title: string; desc: string }[]> = {
  lua: [
    { stage: "7-10 ngày sau sạ", type: "Bón phân", title: "Bón phân thúc đợt 1", desc: "Bón phân NPK tỷ lệ đạm cao..." },
    { stage: "15-20 ngày sau sạ", type: "Phun thuốc", title: "Phun trừ cỏ & Sâu cuốn lá", desc: "..." },
    { stage: "40-45 ngày sau sạ", type: "Bón phân", title: "Bón phân đón đòng", desc: "..." }
  ],
  saurieng: [
    { stage: "Tháng 1-2", type: "Bón phân", title: "Bón phân kích hoa", desc: "Bón KNO3 để kích thích ra hoa đồng loạt..." },
    { stage: "Tháng 3-4", type: "Phun thuốc", title: "Phòng bệnh thán thư", desc: "Phun Mancozeb phòng bệnh thán thư giai đoạn ra hoa..." },
    { stage: "Tháng 5-7", type: "Bón phân", title: "Nuôi trái", desc: "Bón Kali + Canxi để trái lớn đều, chắc..." }
  ],
  cualuoi: [
    { stage: "Ngày 1-7", type: "Bón phân", title: "Bón lót trước trồng", desc: "Bón phân hữu cơ + lân nung chảy trộn đều với đất..." },
    { stage: "Ngày 15-20", type: "Bón phân", title: "Phân thúc sinh trưởng", desc: "Tưới phân NPK 16-16-8 qua hệ thống nhỏ giọt..." },
    { stage: "Ngày 30-35", type: "Phun thuốc", title: "Phòng bệnh phấn trắng", desc: "Phun Sulfur khi thấy dấu hiệu phấn trắng trên lá..." }
  ]
};

const cropDisplayNames: Record<string, string> = {
  lua: 'Lúa',
  saurieng: 'Sầu riêng',
  cualuoi: 'Dưa lưới'
};

export default function CropCalendarPage() {
  const [cropType, setCropType] = useState('lua');
  const [startDate, setStartDate] = useState('');
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('calendar_cropType');
      const savedDate = localStorage.getItem('calendar_startDate');
      const savedCompleted = localStorage.getItem('calendar_completedActions');

      if (savedType && cropData[savedType]) setCropType(savedType);
      if (savedDate) setStartDate(savedDate);
      if (savedCompleted) {
        try {
          setCompletedActions(JSON.parse(savedCompleted));
        } catch (e) {
          console.error('Error parsing completed actions:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('calendar_cropType', cropType);
      localStorage.setItem('calendar_startDate', startDate);
      localStorage.setItem('calendar_completedActions', JSON.stringify(completedActions));
    }
  }, [cropType, startDate, completedActions, isLoaded]);

  const calculateStageDate = (stageStr: string) => {
    if (!startDate) return '';
    const baseDate = new Date(startDate);

    // Extract first number from stage string (e.g., "7-10" -> 7, "Tháng 1-2" -> 1, "Ngày 15-20" -> 15)
    const match = stageStr.match(/\d+/);
    if (!match) return '';

    const num = parseInt(match[0]);

    if (stageStr.includes('Tháng')) {
      // Approximation: 1 month = 30 days
      baseDate.setDate(baseDate.getDate() + (num - 1) * 30);
    } else {
      // Days
      baseDate.setDate(baseDate.getDate() + num - 1);
    }

    return baseDate.toLocaleDateString('vi-VN');
  };

  const toggleComplete = (actionTitle: string) => {
    setCompletedActions(prev =>
      prev.includes(actionTitle) ? prev.filter(t => t !== actionTitle) : [...prev, actionTitle]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-black flex items-center space-x-3">
          <Calendar className="h-7 w-7 text-emerald-200" />
          <span>Lịch Mùa Vụ Thông Minh</span>
        </h1>
        <p className="text-xs font-semibold text-emerald-50 mt-1 opacity-90">
          Quản lý chi tiết tiến độ chăm sóc và phòng trừ dịch hại cho cây trồng của bạn.
        </p>
      </div>

      {/* Input Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
            Chọn cây trồng
          </label>
          <div className="relative">
            <select
              value={cropType}
              onChange={(e) => { setCropType(e.target.value); setCompletedActions([]); }}
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {Object.keys(cropData).map(key => (
                <option key={key} value={key}>{cropDisplayNames[key]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
            Ngày xuống giống
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">
          Các giai đoạn canh tác
        </h3>
        
        <div className="space-y-3">
          {cropData[cropType].map((stage, index) => {
            const specificDate = calculateStageDate(stage.stage);
            const isFinished = completedActions.includes(stage.title);

            return (
              <div 
                key={index}
                className={`bg-white border rounded-3xl p-5 flex items-start justify-between transition-all shadow-sm hover:shadow-md ${
                  isFinished ? 'border-green-200 bg-green-50/10' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                    stage.type === 'Bón phân' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                  }`}>
                    {stage.type === 'Bón phân' ? <Droplet className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-lg">
                        {stage.stage}
                      </span>
                      {specificDate && (
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-lg">
                          {specificDate}
                        </span>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                        stage.type === 'Bón phân' ? 'text-amber-700 bg-amber-50' : 'text-sky-700 bg-sky-50'
                      }`}>
                        {stage.type}
                      </span>
                    </div>

                    <h4 className="font-black text-gray-900 text-base mb-1">{stage.title}</h4>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed">{stage.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleComplete(stage.title)}
                  className={`ml-4 h-8 w-8 rounded-full border flex items-center justify-center transition-all focus:outline-none flex-shrink-0 ${
                    isFinished 
                      ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/30' 
                      : 'border-gray-200 text-gray-300 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
