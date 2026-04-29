import React, { Suspense } from 'react';
import HomePageContent from '@/components/HomePageContent';

export const metadata = {
  title: 'Thư Viện Nông Nghiệp - Kiến thức canh tác từ chuyên gia',
  description: 'Cập nhật kiến thức nông nghiệp mới nhất, kỹ thuật canh tác, phòng trừ sâu bệnh từ chuyên gia và cộng đồng nông dân Việt Nam.',
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">Đang tải trang chủ...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
