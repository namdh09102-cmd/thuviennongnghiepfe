'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Filter, Flame, MessageSquare, Sparkles, Calendar, Bookmark, User, ArrowRight, Eye } from 'lucide-react';
import Image from 'next/image';

// 1. Mock data 12 bài viết
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Quy trình bón phân cho Sầu riêng Ri6 đạt năng suất cao',
    summary: 'Chi tiết các giai đoạn bón phân quan trọng giúp trái sầu riêng to tròn, đều cơm, hạn chế sượng múi.',
    content: 'Sầu riêng Ri6 cần chế độ dinh dưỡng đặc biệt. Giai đoạn nuôi trái 45-60 ngày cần tăng lượng Kali trắng, giảm đạm để chống sượng múi. Vi lượng Boron giúp chống rụng trái non cực kỳ hiệu quả.',
    category: 'Phân bón',
    author: 'KS. Nguyễn Văn Hùng',
    date: '2026-04-25',
    comments: 24,
    bookmarks: 112,
    views: 350,
    thumbnail: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '2',
    title: 'Ứng dụng máy bay phun thuốc (Drone) trong nông nghiệp số',
    summary: 'Khảo sát chi phí và hiệu quả khi sử dụng Drone xịt thuốc BVTV cho cánh đồng lúa mẫu lớn.',
    content: 'Sử dụng Drone giúp tiết kiệm 30% lượng thuốc, 90% lượng nước và bảo vệ sức khỏe tối đa cho nông dân. Phun trong 10-15 phút/hecta.',
    category: 'Nông nghiệp số',
    author: 'ThS. Trần Minh Tuấn',
    date: '2026-04-27',
    comments: 15,
    bookmarks: 85,
    views: 210,
    thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b889615f5?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '3',
    title: 'Cách phòng trị bệnh khảm lá trên cây sắn (khoai mì)',
    summary: 'Bệnh khảm lá do virus lan truyền nhanh. Nhận biết triệu chứng và biện pháp xử lý khoanh vùng.',
    content: 'Cần tiêu hủy tàn dư cây bệnh ngay lập tức. Không dùng hom giống từ ruộng nhiễm bệnh. Sử dụng bẫy dính vàng để kiểm soát bọ phấn trắng truyền bệnh.',
    category: 'Sâu bệnh',
    author: 'Lê Thu Trang',
    date: '2026-04-20',
    comments: 32,
    bookmarks: 43,
    views: 180,
    thumbnail: 'https://images.unsplash.com/photo-1599687350404-c95820396af6?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '4',
    title: 'Kỹ thuật nuôi lợn an toàn sinh học chống dịch tả Châu Phi',
    summary: 'Các bước khử trùng chuồng trại nghiêm ngặt ngăn chặn mầm bệnh xâm nhập đàn heo.',
    content: 'Đảm bảo cách ly người lạ tiếp xúc. Định kỳ sát trùng vôi bột toàn khu vực. Sử dụng thức ăn nấu chín hoặc qua xử lý nhiệt.',
    category: 'Chăn nuôi',
    author: 'BSTY. Hoàng Nam',
    date: '2026-04-18',
    comments: 19,
    bookmarks: 56,
    views: 290,
    thumbnail: 'https://images.unsplash.com/photo-1516467508583-f24d2b1ba404?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '5',
    title: 'Kinh nghiệm xử lý ra hoa nghịch vụ cho cây xoài Cát Hòa Lộc',
    summary: 'Bí quyết kích thích xoài ra hoa trái mùa bán được giá cao vào dịp cuối năm.',
    content: 'Dùng Paclobutrazol đổ gốc sau khi cơi đọt 2 già. Kiểm soát nước chặt chẽ để tạo cú sốc khô hạn kích mầm hoa.',
    category: 'Trồng trọt',
    author: 'Lão nông Tư Rành',
    date: '2026-04-26',
    comments: 41,
    bookmarks: 210,
    views: 530,
    thumbnail: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '6',
    title: 'Giải pháp chống hạn mặn cho vườn cây ăn trái vùng ĐBSCL',
    summary: 'Xây dựng hệ thống túi trữ nước ngọt và cách bón lân, kali tăng sức đề kháng mặn.',
    content: 'Đo độ mặn nước tưới bằng máy cầm tay. Dưới 1 phần ngàn mới tưới. Phủ gốc bằng rơm rạ để giữ ẩm bề mặt.',
    category: 'Trồng trọt',
    author: 'GS.TS Võ Tòng Xuân',
    date: '2026-04-24',
    comments: 28,
    bookmarks: 94,
    views: 410,
    thumbnail: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '7',
    title: 'Mô hình nuôi tôm thẻ chân trắng thâm canh công nghệ cao',
    summary: 'Ứng dụng hệ thống tuần hoàn nước (RAS) nuôi tôm mật độ siêu dày không thay nước.',
    content: 'Hệ thống vi sinh xử lý khí độc NO2/NH3 hiệu quả. Kiểm soát quạt nước cung cấp oxy đầy đủ 24/24.',
    category: 'Chăn nuôi',
    author: 'Kỹ sư Lâm Phát',
    date: '2026-04-23',
    comments: 14,
    bookmarks: 38,
    views: 195,
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '8',
    title: 'Phân biệt các loại phân bón NPK giả trên thị trường',
    summary: 'Mẹo thử độ tan và kiểm tra bao bì để tránh mua phải phân bón kém chất lượng.',
    content: 'Phân bón thật tan đều không để lại cặn đất sét. Chữ in bao bì sắc nét, có mã vạch truy xuất nguồn gốc rõ ràng.',
    category: 'Phân bón',
    author: 'Hội Nông Dân VN',
    date: '2026-04-15',
    comments: 35,
    bookmarks: 174,
    views: 620,
    thumbnail: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '9',
    title: 'Cách phòng bệnh đạo ôn lá gây hại lúa vụ Đông Xuân',
    summary: 'Sử dụng thuốc BVTV gốc hoạt chất mới kiểm soát nấm Pyricularia oryzae.',
    content: 'Phun phòng khi thấy vết chấm kim xuất hiện trên lá. Không bón thừa đạm tạo điều kiện nấm phát triển mạnh.',
    category: 'Sâu bệnh',
    author: 'Chi cục BVTV',
    date: '2026-04-26',
    comments: 8,
    bookmarks: 29,
    views: 110,
    thumbnail: 'https://images.unsplash.com/photo-1536630596251-b12ba0d7f7ef?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '10',
    title: 'Tự động hóa hệ thống tưới nhỏ giọt bằng cảm biến IoT',
    summary: 'Cài đặt van điện từ kết hợp đo độ ẩm đất theo thời gian thực cho vườn cây.',
    content: 'Cảm biến gửi dữ liệu về smartphone. Máy bơm tự kích hoạt khi đất khô dưới 40%. Tiết kiệm 50% nhân công.',
    category: 'Nông nghiệp số',
    author: 'Nguyễn Quốc Bảo',
    date: '2026-04-28',
    comments: 5,
    bookmarks: 47,
    views: 130,
    thumbnail: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '11',
    title: 'Phương pháp làm giàu từ mô hình trồng dưa lưới nhà màng',
    summary: 'Chi phí đầu tư ban đầu và dòng tiền thu hồi vốn nhanh trong vòng 2 năm.',
    content: 'Vốn ban đầu khoảng 300 triệu/1000m2. Mỗi năm thu hoạch 3-4 vụ. Lợi nhuận ròng khoảng 150 triệu/năm.',
    category: 'Trồng trọt',
    author: 'HTX Nông Nghiệp Xanh',
    date: '2026-04-19',
    comments: 52,
    bookmarks: 198,
    views: 710,
    thumbnail: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '12',
    title: 'Kỹ thuật thu hoạch và bảo quản hạt tiêu đen xuất khẩu',
    summary: 'Đảm bảo độ ẩm hạt đạt chuẩn 12.5% tránh hiện tượng nấm mốc phát triển.',
    content: 'Phơi tiêu trên bạt sạch. Dùng máy đo độ ẩm trước khi đóng bao PP. Bảo quản nơi khô ráo thoáng mát.',
    category: 'Trồng trọt',
    author: 'Thương lái Chợ Lớn',
    date: '2026-04-10',
    comments: 21,
    bookmarks: 62,
    views: 245,
    thumbnail: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=500&auto=format&fit=crop&q=60'
  }
];

const CATEGORIES = ['Tất cả', 'Trồng trọt', 'Chăn nuôi', 'Phân bón', 'Sâu bệnh', 'Nông nghiệp số'];
const SORTS = ['Mới nhất', 'Nhiều bình luận nhất', 'Được lưu nhiều nhất'];

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedSort, setSelectedSort] = useState('Mới nhất');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [loading, setLoading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  // 2, 3. Xử lý Filter và Sort
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...MOCK_POSTS];
      
      if (selectedCategory !== 'Tất cả') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }

      if (selectedSort === 'Mới nhất') {
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (selectedSort === 'Nhiều bình luận nhất') {
        filtered.sort((a, b) => b.comments - a.comments);
      } else if (selectedSort === 'Được lưu nhiều nhất') {
        filtered.sort((a, b) => b.bookmarks - a.bookmarks);
      }

      setPosts(filtered);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSort]);

  // 6. Gọi API AI Tóm tắt bài viết
  const handleAISummary = async (e: React.MouseEvent, post: any) => {
    e.preventDefault();
    if (summarizingId) return;

    setSummarizingId(post.id);

    try {
      const prompt = `Hãy tóm tắt nội dung bài viết "${post.title}" sau đây thành đúng 3 gạch đầu dòng ngắn gọn, súc tích bằng tiếng Việt: ${post.content}`;
      
      const res = await fetch('/api/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummaries(prev => ({
        ...prev,
        [post.id]: data.content || 'Không thể tạo tóm tắt.'
      }));
    } catch (error) {
      setSummaries(prev => ({
        ...prev,
        [post.id]: '⚠️ Đã xảy ra lỗi khi kết nối AI.'
      }));
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
      {/* Header */}
      <div className="flex items-center space-x-3 text-gray-900 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-green-50 rounded-2xl text-green-600">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black">Cẩm Nang Nhà Nông</h1>
          <p className="text-xs text-gray-400">Tổng hợp kiến thức canh tác, phòng bệnh và kỹ thuật nông nghiệp.</p>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          >
            {SORTS.map(sort => (
              <option key={sort} value={sort}>{sort}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Skeleton Loading & Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-xl w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map(post => (
            <div
              key={post.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Thumbnail */}
              <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-gray-100 flex-shrink-0">
                <img 
                  src={post.thumbnail} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
              </div>

              {/* Meta info */}
              <div className="flex items-center space-x-2 text-[10px] text-gray-500 mb-2">
                <span className="flex items-center space-x-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <User className="h-3 w-3" />
                  <span>{post.author}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                </span>
              </div>

              {/* Title & Summary */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {post.summary}
                </p>

                {/* AI Summary Box */}
                {summaries[post.id] && (
                  <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed space-y-1">
                    <div className="font-bold flex items-center space-x-1 text-indigo-700 mb-1">
                      <Sparkles className="h-3 w-3" />
                      <span>AI Tóm tắt:</span>
                    </div>
                    <p className="whitespace-pre-line">{summaries[post.id]}</p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-[10px] text-gray-400 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                    <span>{post.comments}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Bookmark className="h-3.5 w-3.5 text-gray-400" />
                    <span>{post.bookmarks}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                    <span>{post.views}</span>
                  </span>
                </div>

                <button
                  onClick={(e) => handleAISummary(e, post)}
                  disabled={summarizingId === post.id}
                  className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl border border-indigo-200/50 disabled:opacity-50 transition-colors animate-pulse-on-hover"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{summarizingId === post.id ? 'Đang tóm tắt...' : 'AI Tóm tắt'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <p className="text-sm text-gray-400 font-medium">Không tìm thấy bài viết nào phù hợp.</p>
        </div>
      )}
    </div>
  );
}
