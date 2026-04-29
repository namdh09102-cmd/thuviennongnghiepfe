import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabaseAdmin is null' });
  }

  // Test the exact relationship query
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url),
      category:categories(name, slug, emoji)
    `, { count: 'exact' })
    .limit(5);

  return NextResponse.json({
    success: !error,
    error: error?.message || null,
    hint: error?.hint || null,
    data: posts
  });
}
