import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 3600; // Cache 1 hour

const MOCK_CATEGORIES = [
  { id: 1, name: 'Kỹ thuật trồng trọt', slug: 'ky-thuat', icon: '🌱', description: 'Kiến thức canh tác', sort_order: 1, is_active: true },
  { id: 2, name: 'Phòng trừ sâu bệnh', slug: 'sau-benh', icon: '🐛', description: 'Nhận biết và điều trị sâu bệnh', sort_order: 2, is_active: true },
  { id: 3, name: 'Dinh dưỡng & Phân bón', slug: 'dinh-duong', icon: '🧪', description: 'Cung cấp dinh dưỡng cho cây', sort_order: 3, is_active: true },
  { id: 4, name: 'Chăn nuôi gia súc', slug: 'chan-nuoi', icon: '🐄', description: 'Kỹ thuật chăn nuôi an toàn', sort_order: 4, is_active: true },
  { id: 5, name: 'Nông nghiệp 4.0', slug: 'nong-nghiep-so', icon: '📱', description: 'Áp dụng công nghệ cao', sort_order: 5, is_active: true }
];

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(MOCK_CATEGORIES);
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json(MOCK_CATEGORIES);
  }

  return NextResponse.json(data);
}
