import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export const revalidate = 300; // Cache 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('posts')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url),
      category:categories(name, slug)
    `, { count: 'exact' })
    .eq('status', 'published')
    .range(from, to);

  if (category && category !== 'all') {
    const { data: catData } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
      
    if (catData) {
      query = query.eq('category_id', catData.id);
    }
  }

  if (sort === 'comments') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query
      .order('comment_count', { ascending: false })
      .gte('created_at', sevenDaysAgo.toISOString());
  } else if (sort === 'hot') {
    query = query.order('view_count', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    }
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  
  // Rate limiting
  const { postRatelimit } = await import('@/lib/ratelimit');
  const { success } = await postRatelimit.limit(userId);
  if (!success) {
    return NextResponse.json({ error: 'Bạn đã đăng quá nhiều bài viết. Vui lòng thử lại sau 1 giờ.' }, { status: 429 });
  }

  const body = await req.json();
  const { title, content, category_id, excerpt, thumbnail_url, tags } = body;

  const slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '') + '-' + Date.now();

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert([{
      title,
      content,
      category_id,
      excerpt,
      thumbnail_url,
      tags,
      slug,
      author_id: (session.user as any).id,
      status: 'pending' // Chờ duyệt
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
