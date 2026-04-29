import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'new';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!supabaseAdmin) {
    return NextResponse.json({
      data: [],
      error: 'Database connection missing',
      meta: { page, limit, total: 0 }
    });
  }

  let query = supabaseAdmin
    .from('posts')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url),
      category:categories(name, slug, emoji)
    `, { count: 'exact' })
    .eq('status', 'published');

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

  if (sort === 'hot' || sort === 'top') {
    query = query.order('view_count', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  // Include user contextual data (likes, bookmarks)
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;

  if (currentUserId && data && data.length > 0) {
    const postIds = data.map((p: any) => p.id);
    const [likes, saves] = await Promise.all([
      supabaseAdmin.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
      supabaseAdmin.from('post_saves').select('post_id').eq('user_id', currentUserId).in('post_id', postIds)
    ]);

    const likedIds = new Set(likes.data?.map((l: any) => l.post_id) || []);
    const savedIds = new Set(saves.data?.map((s: any) => s.post_id) || []);

    data.forEach((p: any) => {
      p.is_liked = likedIds.has(p.id);
      p.is_saved = savedIds.has(p.id);
    });
  }

  return NextResponse.json({
    data,
    error: null,
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0
    }
  });
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
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
      status: 'pending' 
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { created: true } });
}
