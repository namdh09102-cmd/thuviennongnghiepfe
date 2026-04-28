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
