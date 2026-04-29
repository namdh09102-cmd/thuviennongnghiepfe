import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const { slug } = params;

  if (!supabaseAdmin) {
    return NextResponse.json({ data: [], error: null, meta: null });
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
  
  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq(isUuid ? 'id' : 'slug', slug)
    .single();

  if (postError || !post) {
    return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });
  }

  const { data: comments, error } = await supabaseAdmin
    .from('comments')
    .select(`
      *,
      author:profiles(full_name, avatar_url, username)
    `)
    .eq('post_id', post.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data: comments || [], error: null, meta: { limit } });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
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

  const userId = (session.user as any).id;
  const { slug } = params;

  const body = await req.json();
  let { content, parent_id } = body;

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ data: null, error: 'Invalid content', meta: null }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json({ data: null, error: 'Content exceeds 2000 characters', meta: null }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ data: { content }, error: null, meta: null });
  }

  // Sanitize content
  const cleanContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);

  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq(isUuid ? 'id' : 'slug', slug)
    .single();

  if (postError || !post) {
    return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });
  }

  const { data: comment, error } = await supabaseAdmin
    .from('comments')
    .insert({
      post_id: post.id,
      user_id: userId,
      parent_id: parent_id || null,
      content: cleanContent
    })
    .select(`
      *,
      author:profiles(full_name, avatar_url, username)
    `)
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  // Update comment count
  await supabaseAdmin.rpc('increment_comment_count', { post_id_param: post.id });

  return NextResponse.json({ data: comment, error: null, meta: { created: true } });
}
