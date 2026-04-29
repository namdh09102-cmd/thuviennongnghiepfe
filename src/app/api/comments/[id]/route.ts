import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  const { data: comment } = await supabaseAdmin
    .from('comments')
    .select('author_id, post_id')
    .eq('id', params.id)
    .single();

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (comment.author_id !== userId && userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Giảm comment_count
  const { data: post } = await supabaseAdmin.from('posts').select('comment_count').eq('id', comment.post_id).single();
  if (post) {
    await supabaseAdmin.from('posts').update({ comment_count: Math.max(0, post.comment_count - 1) }).eq('id', comment.post_id);
  }

  return NextResponse.json({ message: 'Deleted' });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  const { data: comment } = await supabaseAdmin
    .from('comments')
    .select('author_id, created_at')
    .eq('id', params.id)
    .single();

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (comment.author_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Check 5 minutes limit
  const timePassed = Date.now() - new Date(comment.created_at).getTime();
  if (timePassed > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Đã quá thời gian 5 phút để chỉnh sửa bình luận.' }, { status: 400 });
  }

  const body = await req.json();
  const { content } = body;

  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return PATCH(req, context);
}

