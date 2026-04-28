import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '20');

  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const from = page * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('comments')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url, role),
      replies:comments(
        *,
        author:profiles(username, full_name, avatar_url, role)
      )
    `)
    .eq('post_id', post.id)
    .is('parent_id', null)
    .range(from, to);

  if (sort === 'popular') {
    query = query.order('votes', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

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

  // Gửi thông báo cho chủ bài viết (nếu không phải là chính mình)
  const { data: postAuthor } = await supabaseAdmin
    .from('posts')
    .select('author_id, title')
    .eq('id', post.id)
    .single();

  if (postAuthor && postAuthor.author_id !== (session.user as any).id) {
    const { createNotification } = await import('@/lib/createNotification');
    await createNotification(postAuthor.author_id, 'comment_on_post', {
      actor_name: session.user.name || 'Một người dùng',
      actor_avatar: session.user.image || undefined,
      post_slug: params.slug,
      post_title: postAuthor.title
    });
  }

  // Cập nhật số lượng comment
  await supabaseAdmin.from('posts').update({ comment_count: post.comment_count + 1 }).eq('id', post.id);

  return NextResponse.json(data);
}
