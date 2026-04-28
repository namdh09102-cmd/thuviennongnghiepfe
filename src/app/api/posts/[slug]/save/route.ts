// src/app/api/posts/[slug]/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: existingSave } = await supabaseAdmin
    .from('saves')
    .select()
    .eq('user_id', userId)
    .eq('post_id', post.id)
    .single();

  if (existingSave) {
    await supabaseAdmin.from('saves').delete().eq('user_id', userId).eq('post_id', post.id);
    return NextResponse.json({ saved: false });
  } else {
    await supabaseAdmin.from('saves').insert([{ user_id: userId, post_id: post.id }]);
    return NextResponse.json({ saved: true });
  }
}
