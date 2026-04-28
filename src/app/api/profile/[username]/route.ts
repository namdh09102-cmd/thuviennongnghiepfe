import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      posts(id, title, slug, created_at),
      questions(id, title, created_at)
    `)
    .eq('username', params.username)
    .single();

  if (error) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  return NextResponse.json(data);
}
