import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') || 'posts';

  if (!q) return NextResponse.json({ data: [] });

  let data, error;

  if (type === 'posts') {
    ({ data, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        author:profiles(username, full_name, avatar_url),
        category:categories(name, slug)
      `)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .eq('status', 'published')
      .limit(20));
  } else {
    ({ data, error } = await supabaseAdmin
      .from('questions')
      .select(`
        *,
        author:profiles(username, full_name, avatar_url)
      `)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .limit(20));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
