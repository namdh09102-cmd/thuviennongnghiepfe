'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, AlertTriangle, MapPin, RefreshCw, Thermometer, Droplet } from 'lucide-react';

interface WeatherData {
  temp: number;
  humidity: number;
  rain: number;
  uvIndex: number;
  locationName: string;
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
  }>;
}

// Danh sách tỉnh thành đại diện ở VN
const VN_PROVINCES = [
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
  { name: 'Đắk Lắk', lat: 12.6667, lon: 108.0500 },
  { name: 'Sơn La', lat: 21.3261, lon: 103.9230 },
  { name: 'Lâm Đồng', lat: 11.5753, lon: 108.1429 }
];

export default function WeatherWidget() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [selectedProvince, setSelectedProvince] = useState(VN_PROVINCES[0]);
  const [showSelector, setShowSelector] = useState(false);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    try {
      setLoading(true);
      // Gọi Open-Meteo API
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max&timezone=auto`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.current && data.daily) {
        const cur = data.current;
        const daily = data.daily;

        // Map weather code sang text/icon cơ bản
        const getCondition = (code: number) => {
          if (code >= 51 && code <= 67) return 'Mưa nhẹ';
          if (code >= 71 && code <= 99) return 'Mưa lớn / Dông';
          if (code >= 1 && code <= 3) return 'Nắng mây xen kẽ';
          return 'Nắng đẹp';
        };

        const forecastDays = daily.time.slice(1, 6).map((timeStr: string, index: number) => {
          const dateObj = new Date(timeStr);
          const dateLabel = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
          return {
            date: dateLabel,
            tempMax: Math.round(daily.temperature_2m_max[index + 1]),
            tempMin: Math.round(daily.temperature_2m_min[index + 1]),
            condition: getCondition(daily.weather_code[index + 1])
          };
        });

        setWeather({
          temp: Math.round(cur.temperature_2m),
          humidity: cur.relative_humidity_2m,
          rain: cur.rain || 0,
          uvIndex: Math.round(daily.uv_index_max[0]) || 0,
          locationName: name,
          forecast: forecastDays
        });
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Fallback mock data
      setWeather({
        temp: 28,
        humidity: 85,
        rain: 5,
        uvIndex: 6,
        locationName: name,
        forecast: [
          { date: 'Mai', tempMax: 31, tempMin: 24, condition: 'Mưa nhẹ' },
          { date: 'Kìa', tempMax: 32, tempMin: 25, condition: 'Nắng mây' },
          { date: '29/4', tempMax: 33, tempMin: 26, condition: 'Nắng đẹp' },
          { date: '30/4', tempMax: 30, tempMin: 24, condition: 'Mưa lớn' },
          { date: '1/5', tempMax: 29, tempMin: 23, condition: 'Mưa nhẹ' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedProvince.lat, selectedProvince.lon, selectedProvince.name);
  }, [selectedProvince]);

  // Logic tự xác định vị trí (Geolocation)
  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude, 'Vị trí hiện tại');
      },
      () => {
        alert('Không thể lấy vị trí GPS. Đang sử dụng mặc định.');
      }
    );
  };

  // Logic Cảnh báo sâu bệnh
  const getAgriWarnings = () => {
    if (!weather) return [];
    const warnings = [];

    // 1. Đạo ôn lúa
    if (weather.temp >= 24 && weather.temp <= 30 && weather.humidity > 80) {
      warnings.push({
        type: 'Đạo ôn lúa (Nguy cơ Cao)',
        desc: 'Ẩm độ cao kết hợp nhiệt độ mát mẻ dễ làm nấm lan nhanh trên bông và lá.',
        level: 'Cao',
        color: 'red'
      });
    }

    // 2. Thối rễ
    if (weather.rain > 3) {
      warnings.push({
        type: 'Thối rễ & Úng ngập',
        desc: 'Lượng mưa tích tụ nhiều, cần khơi thông dòng chảy, gia cố bờ bao vườn cây ăn trái.',
        level: 'Trung bình',
        color: 'amber'
      });
    }

    // 3. Nhện đỏ, rầy nâu
    if (weather.temp > 31 && weather.humidity < 70) {
      warnings.push({
        type: 'Nhện đỏ & Rầy nâu',
        desc: 'Khí hậu nóng khô thúc đẩy bọ trĩ, rầy sinh sôi. Cần bổ sung nước tưới phun sương.',
        level: 'Cao',
        color: 'red'
      });
    }

    return warnings;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm animate-pulse h-[260px] flex items-center justify-center">
        <RefreshCw className="h-5 w-5 text-gray-300 animate-spin" />
      </div>
    );
  }

  const warnings = getAgriWarnings();

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-50">
        <div className="flex items-center space-x-1 text-gray-800 text-xs font-bold">
          <MapPin className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{weather?.locationName}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleGeoLocation}
            className="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-green-600 transition-colors"
            title="Định vị GPS"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="text-[9px] bg-gray-50 hover:bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border transition-colors font-semibold"
          >
            Đổi vùng
          </button>
        </div>
      </div>

      {/* Province Selector */}
      {showSelector && (
        <div className="grid grid-cols-2 gap-1.5 p-2 bg-gray-50 rounded-2xl text-[10px]">
          {VN_PROVINCES.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setSelectedProvince(p);
                setShowSelector(false);
              }}
              className={`py-1.5 px-2 rounded-xl text-left border transition-all font-medium ${
                selectedProvince.name === p.name 
                  ? 'bg-green-600 text-white border-green-600 font-bold shadow-sm' 
                  : 'bg-white border-gray-200/60 text-gray-700 hover:border-green-400'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Current Weather */}
      {weather && (
        <div className="flex items-center justify-between bg-gradient-to-br from-green-50 to-emerald-50/30 p-4 rounded-2xl border border-green-100/50">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-gray-900">{weather.temp}</span>
              <span className="text-sm font-bold text-gray-600 ml-0.5">°C</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 block mt-0.5">Cảm giác mát mẻ</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-medium text-gray-600">
            <span className="flex items-center space-x-1"><Droplet className="h-3 w-3 text-blue-500 flex-shrink-0" /> <span>{weather.humidity}% ẩm</span></span>
            <span className="flex items-center space-x-1"><CloudRain className="h-3 w-3 text-cyan-600 flex-shrink-0" /> <span>{weather.rain} mm</span></span>
            <span className="flex items-center space-x-1 col-span-2"><Sun className="h-3 w-3 text-amber-500 flex-shrink-0" /> <span>UV Index: <b>{weather.uvIndex}</b></span></span>
          </div>
        </div>
      )}

      {/* Forecast 5-day */}
      {weather && (
        <div className="flex justify-between gap-1 px-1 py-2 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          {weather.forecast.map(f => (
            <div key={f.date} className="flex flex-col items-center text-center flex-1">
              <span className="text-[9px] font-bold text-gray-400">{f.date}</span>
              <span className="text-[10px] font-bold text-gray-800 mt-1">{f.tempMax}°</span>
              <span className="text-[8px] text-gray-400">{f.tempMin}°</span>
            </div>
          ))}
        </div>
      )}

      {/* Agri Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <span className="text-[10px] font-black text-red-700 flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-pulse flex-shrink-0" />
            <span>CẢNH BÁO NÔNG NGHIỆP</span>
          </span>
          
          {warnings.map(w => (
            <div 
              key={w.type} 
              className={`p-3 rounded-2xl border text-[10px] space-y-1.5 transition-colors ${
                w.color === 'red' 
                  ? 'bg-red-50 border-red-200/60 text-red-900' 
                  : 'bg-amber-50 border-amber-200/60 text-amber-900'
              }`}
            >
              <span className="font-bold block">{w.type}</span>
              <p className="opacity-90 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
