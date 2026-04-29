'use client';

import React from 'react';
import useSWR from 'swr';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';

const AdminChart = dynamic(() => import('@/components/AdminChart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-50 rounded-[40px] animate-pulse flex items-center justify-center text-xs font-bold text-gray-400">Đang tải biểu đồ...</div>
});


const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  const { data, isLoading } = useSWR('/api/admin/stats', fetcher);

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-emerald-50/50 rounded-[32px] animate-pulse" />)}
    </div>
    <div className="h-[400px] bg-gray-100 rounded-[40px]" />
  </div>;

  const stats = [
    { label: 'Thành viên', value: data?.stats?.users || 0, icon: Users, color: 'blue', trend: '+12%' },
    { label: 'Bài viết', value: data?.stats?.posts || 0, icon: FileText, color: 'green', trend: '+8%' },
    { label: 'Bình luận', value: data?.stats?.comments || 0, icon: MessageSquare, color: 'amber', trend: '+5%' },
    { label: 'Chờ duyệt', value: data?.stats?.questions || 0, icon: Clock, color: 'purple', trend: '+15%' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none mb-2">Chào buổi sáng, Admin!</h1>
          <p className="text-sm text-gray-500 font-medium">
            Dưới đây là tóm tắt hoạt động của hệ thống hôm nay.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <button className="px-4 py-2 bg-gray-50 text-gray-900 text-[10px] font-black rounded-xl uppercase tracking-widest">7 Ngày</button>
          <button className="px-4 py-2 text-gray-400 text-[10px] font-black rounded-xl uppercase tracking-widest">30 Ngày</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${s.color}-50 text-${s.color}-600 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1 text-xs font-black ${s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  <span>{s.trend}</span>
                  {s.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{s.value.toLocaleString()}</h3>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <AdminChart data={data?.dauData || []} />

        {/* Hot Posts Sidebar */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-amber-500" />
            <span>Bài viết Hot nhất</span>
          </h3>
          <div className="flex-1 space-y-6">
            {data?.hotPosts?.map((post: any, index: number) => (
              <div key={post.id} className="flex items-start space-x-4 group">
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-gray-900 line-clamp-1 group-hover:text-green-700 transition-colors">{post.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{post.view_count.toLocaleString()} Lượt xem</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 bg-gray-50 hover:bg-gray-100 text-gray-900 text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest transition-all">
            Xem tất cả bài viết
          </button>
        </div>
      </div>

      {/* Processing Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-500" />
            <span>Chờ phê duyệt ({data?.pendingPosts?.length || 0})</span>
          </h3>
          <div className="space-y-4">
            {data?.pendingPosts?.map((post: any) => (
              <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-green-100 transition-all">
                <div className="min-w-0 flex-1 mr-4">
                  <h4 className="text-xs font-black text-gray-900 line-clamp-1">{post.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Gửi bởi: Chuyên gia ID #{post.author_id.slice(0, 5)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 bg-green-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Duyệt</button>
                  <button className="px-3 py-1.5 bg-white text-gray-400 text-[9px] font-black rounded-lg uppercase tracking-widest border">Bỏ qua</button>
                </div>
              </div>
            ))}
            {data?.pendingPosts?.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-gray-400 font-medium italic">Không có bài viết nào đang chờ.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span>Hoạt động gần đây</span>
          </h3>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    <span className="font-black text-gray-900">Nguyễn Văn A</span> vừa tham gia cộng đồng.
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">5 PHÚT TRƯỚC</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
