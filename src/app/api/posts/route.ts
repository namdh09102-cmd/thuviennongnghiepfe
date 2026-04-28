import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

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

  if (category) {
    query = query.eq('category_id', category);
  }

  if (sort === 'hot') {
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
