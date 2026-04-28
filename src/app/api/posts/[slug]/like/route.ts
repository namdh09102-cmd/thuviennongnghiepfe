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

  // Lấy ID bài viết từ slug
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id, like_count')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Kiểm tra đã like chưa
  const { data: existingLike } = await supabaseAdmin
    .from('likes')
    .select()
    .eq('user_id', userId)
    .eq('post_id', post.id)
    .single();

  if (existingLike) {
    // Unlike
    await supabaseAdmin.from('likes').delete().eq('user_id', userId).eq('post_id', post.id);
    await supabaseAdmin.from('posts').update({ like_count: post.like_count - 1 }).eq('id', post.id);
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await supabaseAdmin.from('likes').insert([{ user_id: userId, post_id: post.id }]);
    await supabaseAdmin.from('posts').update({ like_count: post.like_count + 1 }).eq('id', post.id);

    // Gửi thông báo cho chủ bài viết
    const { data: postAuthor } = await supabaseAdmin
      .from('posts')
      .select('author_id, title')
      .eq('id', post.id)
      .single();

    if (postAuthor && postAuthor.author_id !== userId) {
      const { createNotificationAsync } = await import('@/lib/createNotification');
      createNotificationAsync(
        postAuthor.author_id,
        'like_post',
        {
          actor_name: session.user.name || 'Một người dùng',
          actor_avatar: session.user.image || undefined,
          post_slug: params.slug,
          post_title: postAuthor.title
        },
        userId,
        'post',
        post.id
      );
    }

    return NextResponse.json({ liked: true });
  }
}
