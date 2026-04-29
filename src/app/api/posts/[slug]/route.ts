import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url, bio, region, is_verified),
      category:categories(name, slug)
    `)
    .eq('slug', params.slug)
    .single();

  if (error) return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });

  return NextResponse.json(
    { data, error: null, meta: { slug: params.slug } },
    {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' }
    }
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // Kiểm tra quyền (Chủ sở hữu hoặc Admin)
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('author_id')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.author_id !== userId && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update(body)
    .eq('slug', params.slug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('author_id')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.author_id !== userId && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .eq('slug', params.slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: 'Deleted' });
}
