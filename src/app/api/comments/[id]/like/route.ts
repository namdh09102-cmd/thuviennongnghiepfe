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
  const { action } = body; // 'like' | 'unlike'

  const { data: comment } = await supabaseAdmin
    .from('comments')
    .select('votes')
    .eq('id', params.id)
    .single();

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const currentVotes = comment.votes || 0;
  const newVotes = action === 'like' ? currentVotes + 1 : Math.max(0, currentVotes - 1);

  const { data, error } = await supabaseAdmin
    .from('comments')
    .update({ votes: newVotes })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
