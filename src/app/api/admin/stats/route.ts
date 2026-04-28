import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch totals in parallel
  const [
    { count: userCount },
    { count: postCount },
    { count: commentCount },
    { count: questionCount },
    { data: pendingPosts },
    { data: hotPosts }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('questions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('posts').select('id, title, status, author_id').eq('status', 'pending').limit(5),
    supabaseAdmin.from('posts').select('id, title, view_count, slug').order('view_count', { ascending: false }).limit(5)
  ]);

  return NextResponse.json({
    stats: {
      users: userCount || 0,
      posts: postCount || 0,
      comments: commentCount || 0,
      questions: questionCount || 0
    },
    pendingPosts: pendingPosts || [],
    hotPosts: hotPosts || [],
    // Mock chart data for DAU
    dauData: [
      { day: 'T2', value: 400 },
      { day: 'T3', value: 300 },
      { day: 'T4', value: 600 },
      { day: 'T5', value: 800 },
      { day: 'T6', value: 500 },
      { day: 'T7', value: 900 },
      { day: 'CN', value: 1200 },
    ]
  });
}
