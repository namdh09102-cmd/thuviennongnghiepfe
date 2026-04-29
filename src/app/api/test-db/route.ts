import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabaseAdmin is null' });
  }

  const { data: posts, error: postsError } = await supabaseAdmin.from('posts').select('*').limit(1);
  const { data: categories, error: catError } = await supabaseAdmin.from('categories').select('*').limit(1);
  const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('*').limit(1);

  return NextResponse.json({
    posts: { count: posts?.length || 0, error: postsError?.message || null },
    categories: { count: categories?.length || 0, error: catError?.message || null },
    profiles: { count: profiles?.length || 0, error: profError?.message || null }
  });
}
