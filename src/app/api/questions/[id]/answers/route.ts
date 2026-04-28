import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content } = body;

  const { data, error } = await supabaseAdmin
    .from('answers')
    .insert([{
      question_id: params.id,
      author_id: (session.user as any).id,
      content
    }])
    .select(`
      *,
      author:profiles(username, full_name, avatar_url, is_verified, role)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Gửi thông báo cho chủ câu hỏi
  const { data: question } = await supabaseAdmin
    .from('questions')
    .select('author_id, title')
    .eq('id', params.id)
    .single();

  if (question && question.author_id !== (session.user as any).id) {
    const isExpert = (session.user as any).role === 'expert';
    const { createNotificationAsync } = await import('@/lib/createNotification');
    createNotificationAsync(
      question.author_id,
      'expert_answer',
      {
        actor_name: session.user.name || 'Một người dùng',
        actor_avatar: session.user.image || undefined,
        question_id: params.id,
        question_title: question.title
      },
      (session.user as any).id,
      'question',
      params.id
    );
  }

  return NextResponse.json(data);
}
