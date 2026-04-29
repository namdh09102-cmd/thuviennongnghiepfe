import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { rateLimit, getIP } from '@/lib/rate-limit';

export const revalidate = 300;

const MOCK_CATEGORIES = [
  { id: '1', name: 'Kỹ thuật trồng trọt', slug: 'ky-thuat', emoji: '🌱', sort_order: 1 },
  { id: '2', name: 'Phòng trừ sâu bệnh', slug: 'sau-benh', emoji: '🐛', sort_order: 2 },
  { id: '3', name: 'Dinh dưỡng & Phân bón', slug: 'dinh-duong', emoji: '🧪', sort_order: 3 },
  { id: '4', name: 'Chăn nuôi gia súc', slug: 'chan-nuoi', emoji: '🐄', sort_order: 4 },
  { id: '5', name: 'Nông nghiệp 4.0', slug: 'nong-nghiep-so', emoji: '📱', sort_order: 5 },
  { id: '6', name: 'Thủy sản', slug: 'thuy-san', emoji: '🐟', sort_order: 6 },
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

  try {
    await connectMongoDB();
    const cats = await Category.find({}).sort({ sort_order: 1 }).lean();

    const data = cats.length > 0
      ? cats.map((c: any) => ({
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          emoji: c.emoji || '🌿',
          sort_order: c.sort_order || 0,
        }))
      : MOCK_CATEGORIES;

    return NextResponse.json(
      { data, error: null, meta: { total: data.length } },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=300' },
      }
    );
  } catch (err: any) {
    console.error('[GET /api/categories] Error:', err);
    return NextResponse.json(
      { data: MOCK_CATEGORIES, error: null, meta: { total: MOCK_CATEGORIES.length, cache: 'mock' } },
      {
        status: 200,
        headers: { 'Cache-Control': 'max-age=60' },
      }
    );
  }
}
