import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit, getIP } from '@/lib/rate-limit';

export const revalidate = 300; // Cache 5 mins

const MOCK_CATEGORIES = [
  { id: 1, name: 'Kỹ thuật trồng trọt', slug: 'ky-thuat', emoji: '🌱', description: 'Kiến thức canh tác', sort_order: 1, is_hidden: false },
  { id: 2, name: 'Phòng trừ sâu bệnh', slug: 'sau-benh', emoji: '🐛', description: 'Nhận biết và điều trị sâu bệnh', sort_order: 2, is_hidden: false },
  { id: 3, name: 'Dinh dưỡng & Phân bón', slug: 'dinh-duong', emoji: '🧪', description: 'Cung cấp dinh dưỡng cho cây', sort_order: 3, is_hidden: false },
  { id: 4, name: 'Chăn nuôi gia súc', slug: 'chan-nuoi', emoji: '🐄', description: 'Kỹ thuật chăn nuôi an toàn', sort_order: 4, is_hidden: false },
  { id: 5, name: 'Nông nghiệp 4.0', slug: 'nong-nghiep-so', emoji: '📱', description: 'Áp dụng công nghệ cao', sort_order: 5, is_hidden: false }
];

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { data: MOCK_CATEGORIES, error: null, meta: { cache: 'mock' } },
      { 
        status: 200,
        headers: { 'Cache-Control': 'max-age=300' }
      }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug, description, sort_order')
    .eq('is_hidden', false)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message, meta: null },
      { status: 500 }
    );
  }

  // Fallback if Supabase yields empty results
  const responseData = data && data.length > 0 ? data : MOCK_CATEGORIES;

  return NextResponse.json(
    { data: responseData, error: null, meta: { total: responseData.length } },
    { 
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' }
    }
  );
}
