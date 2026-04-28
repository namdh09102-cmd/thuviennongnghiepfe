'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Droplet, Shield, AlertTriangle, Check, Download, ArrowRight } from 'lucide-react';

// 1. Bộ dữ liệu mốc thời vụ JSON cho 5 cây trồng
const CROP_DATA: Record<string, {
  duration: number;
  phases: { name: string; startDay: number; endDay: number; color: string }[];
  actions: { day: number; type: 'fertilize' | 'spray' | 'harvest'; title: string; description: string }[];
}> = {
  'Lúa': {
    duration: 100,
    phases: [
      { name: 'Mạ & Đẻ nhánh', startDay: 1, endDay: 30, color: 'bg-emerald-500' },
      { name: 'Làm đòng', startDay: 31, endDay: 60, color: 'bg-yellow-500' },
      { name: 'Trổ chín & Thu hoạch', startDay: 61, endDay: 100, color: 'bg-orange-500' }
    ],
    actions: [
      { day: 10, type: 'fertilize', title: 'Bón phân thúc đợt 1', description: 'Bón NPK tỷ lệ đạm cao để kích thích đẻ nhánh.' },
      { day: 15, type: 'spray', title: 'Phun trừ cỏ & Ốc bươu vàng', description: 'Diệt sạch cỏ dại và ốc gây hại lúa non.' },
      { day: 45, type: 'fertilize', title: 'Bón phân đón đòng', description: 'Bón Kali + Đạm nuôi đòng to chắc.' },
      { day: 70, type: 'spray', title: 'Phun phòng đạo ôn trổ', description: 'Phun ngừa bệnh đạo ôn lá và cổ bông.' },
      { day: 100, type: 'harvest', title: 'Thu hoạch lúa', description: 'Rút cạn nước trước 10 ngày, gặt khi chín 85%.' }
    ]
  },
  'Sầu riêng': {
    duration: 120,
    phases: [
      { name: 'Nuôi trái non', startDay: 1, endDay: 30, color: 'bg-green-500' },
      { name: 'Phát triển trái', startDay: 31, endDay: 80, color: 'bg-teal-500' },
      { name: 'Chín & Thu hoạch', startDay: 81, endDay: 120, color: 'bg-yellow-600' }
    ],
    actions: [
      { day: 7, type: 'fertilize', title: 'Bón phân nuôi trái', description: 'Bón NPK 12-12-17 kết hợp vi lượng.' },
      { day: 30, type: 'spray', title: 'Phun phòng rầy nhảy', description: 'Bảo vệ cơi đọt non tránh rụng trái.' },
      { day: 60, type: 'fertilize', title: 'Bón phân Kali tăng chất lượng', description: 'Giúp cơm sầu riêng vàng, ngọt, thơm.' },
      { day: 120, type: 'harvest', title: 'Thu hoạch sầu riêng', description: 'Cắt tỉa trái chín đồng đều.' }
    ]
  },
  'Dưa lưới': {
    duration: 75,
    phases: [
      { name: 'Sinh trưởng', startDay: 1, endDay: 25, color: 'bg-sky-500' },
      { name: 'Ra hoa & Đậu trái', startDay: 26, endDay: 45, color: 'bg-indigo-500' },
      { name: 'Tạo lưới & Chín', startDay: 46, endDay: 75, color: 'bg-lime-600' }
    ],
    actions: [
      { day: 10, type: 'fertilize', title: 'Tưới phân định kỳ đợt 1', description: 'Cung cấp đạm và lân phát triển bộ rễ.' },
      { day: 30, type: 'fertilize', title: 'Thụ phấn nhân tạo', description: 'Dùng cọ lấy phấn hoa đực chà nhẹ lên hoa cái.' },
      { day: 50, type: 'spray', title: 'Phun phòng phấn trắng', description: 'Kiểm soát bệnh phấn trắng mùa ẩm.' },
      { day: 75, type: 'harvest', title: 'Thu hoạch dưa lưới', description: 'Kiểm tra vân lưới đều, cuống nứt nhẹ.' }
    ]
  },
  'Tiêu': {
    duration: 180,
    phases: [
      { name: 'Ra hoa & Đậu quả', startDay: 1, endDay: 60, color: 'bg-emerald-600' },
      { name: 'Nuôi quả', startDay: 61, endDay: 150, color: 'bg-green-700' },
      { name: 'Chín & Thu hoạch', startDay: 151, endDay: 180, color: 'bg-red-600' }
    ],
    actions: [
      { day: 20, type: 'fertilize', title: 'Bón phân lân kích ra hoa', description: 'Bón gốc lân hữu cơ hoai mục.' },
      { day: 90, type: 'spray', title: 'Phun trừ rệp sáp', description: 'Kiểm tra chùm quả, nách lá phòng rệp.' },
      { day: 180, type: 'harvest', title: 'Thu hoạch hạt tiêu', description: 'Hái khi chùm tiêu có vài hạt đỏ.' }
    ]
  },
  'Cà phê': {
    duration: 210,
    phases: [
      { name: 'Phát triển quả', startDay: 1, endDay: 90, color: 'bg-yellow-500' },
      { name: 'Tích lũy chất khô', startDay: 91, endDay: 180, color: 'bg-orange-500' },
      { name: 'Chín & Thu hoạch', startDay: 181, endDay: 210, color: 'bg-red-700' }
    ],
    actions: [
      { day: 30, type: 'fertilize', title: 'Bón phân mùa mưa đợt 1', description: 'Bón NPK 16-16-8 cân đối hàm lượng.' },
      { day: 120, type: 'spray', title: 'Phun ngừa rỉ sắt', description: 'Phun thuốc gốc đồng bảo vệ lá.' },
      { day: 210, type: 'harvest', title: 'Thu hoạch quả chín', description: 'Hái chọn quả chín đỏ trên 95%.' }
    ]
  }
};

const VIETNAM_PROVINCES = [
  'An Giang', 'Cần Thơ', 'Đồng Tháp', 'Lâm Đồng', 'Đắk Lắk', 'Bến Tre', 'Tiền Giang', 'Sơn La'
];

export default function CropCalendarPage() {
  const [crop, setCrop] = useState('Lúa');
  const [province, setProvince] = useState('An Giang');
  const [startDate, setStartDate] = useState('');
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  // 6. Lưu và tải từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crop_calendar_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCrop(parsed.crop || 'Lúa');
        setProvince(parsed.province || 'An Giang');
        setStartDate(parsed.startDate || new Date().toISOString().split('T')[0]);
        setCompletedActions(parsed.completedActions || []);
      } catch (e) {
        console.error('Error loading localStorage data:', e);
      }
    } else {
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, []);

  useEffect(() => {
    if (startDate) {
      const data = { crop, province, startDate, completedActions };
      localStorage.setItem('crop_calendar_data', JSON.stringify(data));
    }
  }, [crop, province, startDate, completedActions]);

  const currentCropData = CROP_DATA[crop] || CROP_DATA['Lúa'];

  const calculateDate = (dayOffset: number) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset - 1);
    return date.toLocaleDateString('vi-VN');
  };

  const toggleActionComplete = (day: number) => {
    setCompletedActions(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // 5. Tích hợp Google Calendar (ICS export)
  const exportToICS = () => {
    if (!startDate) return alert('Vui lòng chọn ngày xuống giống!');
    
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Thư viện Nông nghiệp//VN\nCALSCALE:GREGORIAN\n';
    
    currentCropData.actions.forEach(action => {
      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `SUMMARY:[${crop}] ${action.title}\n`;
      icsContent += `DESCRIPTION:${action.description} (Khu vực: ${province})\n`;
      
      const date = new Date(startDate);
      date.setDate(date.getDate() + action.day - 1);
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
      icsContent += `DTEND;VALUE=DATE:${dateStr}\n`;
      icsContent += 'END:VEVENT\n';
    });
    
    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lich_canh_tac_${crop}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-green-600 text-white p-6 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center space-x-3">
          <Calendar className="h-7 w-7 text-emerald-200" />
          <span>Lịch Canh Tác Thông Minh</span>
        </h1>
        <p className="text-xs text-emerald-50 mt-1 opacity-90">
          Tự động lập lịch trình chăm sóc chuyên nghiệp theo từng loại nông sản.
        </p>
      </div>

      {/* Form Nhập */}
      <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Cây trồng</label>
          <select 
            value={crop} 
            onChange={(e) => { setCrop(e.target.value); setCompletedActions([]); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          >
            {Object.keys(CROP_DATA).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tỉnh thành</label>
          <select 
            value={province} 
            onChange={(e) => setProvince(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          >
            {VIETNAM_PROVINCES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ngày xuống giống</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 4. Giao diện Timeline dạng Gantt đơn giản */}
      <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
          <span>Tiến trình sinh trưởng:</span>
          <span className="text-xs font-normal text-gray-500">({currentCropData.duration} ngày)</span>
        </h2>
        
        <div className="w-full bg-gray-100 h-8 rounded-xl overflow-hidden flex relative shadow-inner">
          {currentCropData.phases.map((phase, index) => {
            const widthPercent = ((phase.endDay - phase.startDay + 1) / currentCropData.duration) * 100;
            return (
              <div 
                key={index}
                style={{ width: `${widthPercent}%` }}
                className={`${phase.color} flex items-center justify-center text-[10px] text-white font-bold border-r border-white/20 last:border-0 transition-all relative group`}
              >
                <span className="truncate px-1">{phase.name}</span>
                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black/80 text-white text-[8px] px-2 py-1 rounded shadow z-10 pointer-events-none whitespace-nowrap">
                  Ngày {phase.startDay} - {phase.endDay}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danh sách công việc & Nhắc nhở */}
      <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
            <span>Lịch trình chi tiết ({province})</span>
          </h2>
          
          <button
            onClick={exportToICS}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition-colors shadow-sm border border-emerald-200"
          >
            <Download className="h-4 w-4" />
            <span>Đặt nhắc nhở (Google Cal)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCropData.actions.map((action) => {
            const isDone = completedActions.includes(action.day);
            return (
              <div 
                key={action.day}
                onClick={() => toggleActionComplete(action.day)}
                className={`cursor-pointer border rounded-2xl p-4 flex items-start space-x-3 transition-all duration-200 ${
                  isDone 
                    ? 'bg-gray-50 border-gray-200 opacity-60' 
                    : 'bg-white border-gray-100 shadow-sm hover:border-emerald-300'
                }`}
              >
                <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center border transition-all mt-0.5 ${
                  isDone 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : 'border-gray-300 text-transparent'
                }`}>
                  <Check className="h-3 w-3" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Ngày {action.day} ({calculateDate(action.day)})
                    </span>
                    
                    <span className="flex items-center space-x-1 text-gray-500">
                      {action.type === 'fertilize' && <Droplet className="h-3 w-3 text-blue-500" />}
                      {action.type === 'spray' && <Shield className="h-3 w-3 text-red-500" />}
                      <span>
                        {action.type === 'fertilize' ? 'Bón phân' : action.type === 'spray' ? 'Phun xịt' : 'Thu hoạch'}
                      </span>
                    </span>
                  </div>

                  <h3 className={`text-xs font-bold mt-2 text-gray-900 ${isDone ? 'line-through text-gray-500' : ''}`}>
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khuyến cáo */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 leading-relaxed">
          <span className="font-bold">Lưu ý thời tiết & thực địa:</span> Lịch trình trên dựa trên quy trình kỹ thuật chuẩn. Nhà nông nên linh hoạt điều chỉnh cẩn thận tùy theo tình hình sâu bệnh thực tế tại vườn.
        </div>
      </div>
    </div>
  );
}
