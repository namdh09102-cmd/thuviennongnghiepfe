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
  const limit = parseInt(searchParams.get('limit') || '10');

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
    `, { count: 'exact' })
    .eq('post_id', post.id)
    .is('parent_id', null)
    .eq('is_hidden', false) // Don't show hidden/pending comments
    .range(from, to);

  if (sort === 'popular') {
    query = query.order('votes', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    total: count
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  // 1. Rate limiting (3 comment/phút/user)
  const { spamCommentRatelimit } = await import('@/lib/ratelimit');
  const { success } = await spamCommentRatelimit.limit(userId);
  if (!success) {
    return NextResponse.json({ error: 'Bạn bình luận quá nhanh. Vui lòng thử lại sau 1 phút.' }, { status: 429 });
  }

  const body = await req.json();
  const { content, parent_id } = body;

  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 });
  }

  // 2. Block external links (whitelist internal)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex);
  if (urls) {
    const whitelist = ['localhost', 'thuviennongnghiepfe.vercel.app', 'thuviennongnghiep.vn'];
    for (const url of urls) {
      try {
        const hostname = new URL(url).hostname;
        if (!whitelist.includes(hostname)) {
          return NextResponse.json({ error: 'Không được chèn link ngoài vào bình luận.' }, { status: 400 });
        }
      } catch (e) {
        // Invalid URL
      }
    }
  }

  // 3. User mới (< 7 ngày, < 5 điểm) -> pending (is_hidden = true)
  const { data: userProfile } = await supabaseAdmin
    .from('profiles')
    .select('points, created_at')
    .eq('id', userId)
    .single();

  const userAgeInDays = userProfile?.created_at
    ? (Date.now() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const userPoints = userProfile?.points || 0;
  const isPending = userAgeInDays < 7 || userPoints < 5;

  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id, comment_count')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert([{
      post_id: post.id,
      author_id: userId,
      content,
      parent_id,
      is_hidden: isPending
    }])
    .select(`
      *,
      author:profiles(username, full_name, avatar_url)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isPending) {
    return NextResponse.json({ 
      message: 'Bình luận của bạn đang chờ kiểm duyệt do tài khoản mới.', 
      data: { ...data, is_hidden: true } 
    });
  }


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
