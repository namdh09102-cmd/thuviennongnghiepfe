import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { jwtVerify } from 'jose';

async function checkAdminAuth(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token')?.value;
  if (!adminToken) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
    const { payload } = await jwtVerify(adminToken, secret);
    return payload.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const MOCK_ADMIN_POSTS = [
    { id: 'mock-1', title: 'Kỹ thuật trồng dưa lưới nhà màng đạt năng suất cao', slug: 'ky-thuat-trong-dua-luoi-nha-mang', status: 'pending', created_at: '2026-04-28T00:00:00Z', author: { full_name: 'Nguyễn Văn Minh', username: 'chuyengia_minh' }, category: { name: 'Kỹ thuật trồng trọt' } },
    { id: 'mock-2', title: 'Biện pháp phòng trừ bệnh đạo ôn hại lúa vụ Hè Thu', slug: 'phong-tru-dao-on-lua-he-thu', status: 'published', created_at: '2026-04-27T00:00:00Z', author: { full_name: 'Lê Thị Hoa', username: 'ky_su_hoa' }, category: { name: 'Phòng trừ sâu bệnh' } },
    { id: 'mock-3', title: 'Quy tắc bón phân NPK đúng cách cho cây ăn trái', slug: 'bon-phan-npk-dung-cach', status: 'rejected', created_at: '2026-04-26T00:00:00Z', author: { full_name: 'Trần Đại Tấn', username: 'tan_npk' }, category: { name: 'Dinh dưỡng & Phân bón' } }
  ];

  if (!supabaseAdmin) {
    const filtered = status && status !== 'all' ? MOCK_ADMIN_POSTS.filter(p => p.status === status) : MOCK_ADMIN_POSTS;
    return NextResponse.json({ data: filtered, total: filtered.length });
  }

  let query = supabaseAdmin
    .from('posts')
    .select(`
      *,
      author:profiles(full_name, username),
      category:categories(name)
    `, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;
  
  if (error || !data || data.length === 0) {
    const filtered = status && status !== 'all' ? MOCK_ADMIN_POSTS.filter(p => p.status === status) : MOCK_ADMIN_POSTS;
    return NextResponse.json({ data: filtered, total: filtered.length });
  }

  return NextResponse.json({ data, total: count });
}

export async function PATCH(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { ids, status, is_featured, is_pinned } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
  }

  const updateData: any = {};
  if (status) {
    updateData.status = status;
    if (status === 'published') updateData.published_at = new Date().toISOString();
  }
  if (typeof is_featured === 'boolean') updateData.is_featured = is_featured;
  if (typeof is_pinned === 'boolean') updateData.is_pinned = is_pinned;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update(updateData)
    .in('id', ids)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Gửi thông báo cho từng tác giả
  if (status && (status === 'published' || status === 'rejected')) {
    const { createNotificationAsync } = await import('@/lib/createNotification');
    
    // Lấy thông tin tác giả và tiêu đề bài viết
    const { data: updatedPosts } = await supabaseAdmin
      .from('posts')
      .select('author_id, title, slug')
      .in('id', ids);

    updatedPosts?.forEach((post: any) => {
      createNotificationAsync(
        post.author_id,
        status === 'published' ? 'post_approved' : 'post_rejected',
        {
          post_title: post.title,
          post_slug: post.slug,
          reason: status === 'rejected' ? 'Bài viết không phù hợp với tiêu chuẩn cộng đồng.' : undefined
        },
        undefined,
        'post',
        undefined
      );
    });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids')?.split(',');

  if (!ids) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .in('id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
