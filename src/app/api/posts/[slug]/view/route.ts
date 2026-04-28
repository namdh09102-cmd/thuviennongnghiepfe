import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('id, view_count')
    .eq('slug', params.slug)
    .single();

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await supabaseAdmin
    .from('posts')
    .update({ view_count: post.view_count + 1 })
    .eq('id', post.id);

  return NextResponse.json({ success: true });
}
