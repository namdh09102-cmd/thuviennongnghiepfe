import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url)
    `)
    .eq('post_id', post.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id, comment_count')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { content, parent_id } = body;

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert([{
      post_id: post.id,
      author_id: (session.user as any).id,
      content,
      parent_id
    }])
    .select(`
      *,
      author:profiles(username, full_name, avatar_url)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Cập nhật số lượng comment
  await supabaseAdmin.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', post.id);

  return NextResponse.json(data);
}
