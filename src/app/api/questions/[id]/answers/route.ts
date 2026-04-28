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

  return NextResponse.json(data);
}
