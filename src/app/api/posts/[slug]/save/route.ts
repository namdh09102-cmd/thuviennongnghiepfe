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
    return NextResponse.json({ data: { saved: true }, error: null, meta: null });
  }

  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .single();

  if (postError || !post) {
    return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });
  }

  const { data: existingSave } = await supabaseAdmin
    .from('post_saves')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', post.id)
    .single();

  let saved = false;

  if (existingSave) {
    await supabaseAdmin.from('post_saves').delete().eq('user_id', userId).eq('post_id', post.id);
    saved = false;
  } else {
    await supabaseAdmin.from('post_saves').insert({ user_id: userId, post_id: post.id });
    saved = true;
  }

  return NextResponse.json({ 
    data: { saved }, 
    error: null, 
    meta: { slug } 
  });
}
