import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: question, error: qError } = await supabaseAdmin
    .from('questions')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url, is_verified),
      expert:profiles!expert_id(full_name, is_verified)
    `)
    .eq('id', params.id)
    .single();

  if (qError) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: answers, error: aError } = await supabaseAdmin
    .from('answers')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url, is_verified, role)
    `)
    .eq('question_id', params.id)
    .order('is_best_answer', { ascending: false })
    .order('created_at', { ascending: true });

  return NextResponse.json({ ...question, answers });
}
