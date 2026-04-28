import { NextResponse } from 'next/server';

export async function GET() {
  const trendingTags = [
    { id: '1', name: 'Lúa' },
    { id: '2', name: 'Sầu riêng' },
    { id: '3', name: 'Phân bón' },
    { id: '4', name: 'Dưa lưới' },
    { id: '5', name: 'Thủy canh' },
    { id: '6', name: 'Cà phê' },
    { id: '7', name: 'Hồ tiêu' }
  ];
  return NextResponse.json(trendingTags);
}
