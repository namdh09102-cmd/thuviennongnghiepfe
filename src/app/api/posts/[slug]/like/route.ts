import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rateLimit';

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

  if (!supabaseAdmin) {
    return NextResponse.json({ data: { liked: true, count: 10 }, error: null, meta: null });
  }

  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('id, like_count')
    .eq('slug', slug)
    .single();

  if (postError || !post) {
    return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });
  }

  const { data: existingLike } = await supabaseAdmin
    .from('post_likes')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', post.id)
    .single();

  let liked = false;
  let newCount = post.like_count || 0;

  if (existingLike) {
    await supabaseAdmin.from('post_likes').delete().eq('user_id', userId).eq('post_id', post.id);
    newCount = Math.max(0, newCount - 1);
    liked = false;
  } else {
    await supabaseAdmin.from('post_likes').insert({ user_id: userId, post_id: post.id });
    newCount += 1;
    liked = true;
  }

  await supabaseAdmin.from('posts').update({ like_count: newCount }).eq('id', post.id);

  return NextResponse.json({ 
    data: { liked, count: newCount }, 
    error: null, 
    meta: { slug } 
  });
}
