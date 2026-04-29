import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { jwtVerify } from 'jose';

async function checkAdminAuth(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token')?.value;
  if (!adminToken) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
    const { payload } = await jwtVerify(adminToken, secret);
    return payload.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate last 7 days range
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  const startDate = days[0].toISOString();
  
  // Fetch totals in parallel
  const [
    { count: userCount },
    { count: postCount },
    { count: questionCount },
    { count: commentCount },
    { data: pendingPosts },
    { data: hotPosts },
    { data: recentUsers },
    { data: recentPosts },
    { data: recentComments }
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('posts').select('id, title, status, author_id').eq('status', 'pending').limit(5),
    supabaseAdmin.from('posts').select('id, title, view_count, slug').order('view_count', { ascending: false }).limit(5),
    supabaseAdmin.from('profiles').select('created_at').gte('created_at', startDate),
    supabaseAdmin.from('posts').select('created_at').gte('created_at', startDate),
    supabaseAdmin.from('comments').select('created_at').gte('created_at', startDate)
  ]);

  // Aggregate 7-day data
  const dauData = days.map((d, index) => {
    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);
    
    const dStart = d.getTime();
    const dEnd = nextD.getTime();
    
    const newUsers = recentUsers?.filter((u: any) => { const t = new Date(u.created_at).getTime(); return t >= dStart && t < dEnd; }).length || 0;
    const newPosts = recentPosts?.filter((p: any) => { const t = new Date(p.created_at).getTime(); return t >= dStart && t < dEnd; }).length || 0;
    const newComments = recentComments?.filter((c: any) => { const t = new Date(c.created_at).getTime(); return t >= dStart && t < dEnd; }).length || 0;
    
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    return {
      day: index === 6 ? 'Hôm nay' : dayNames[d.getDay()],
      'User mới': newUsers,
      'Bài mới': newPosts,
      'Comment mới': newComments
    };
  });

  return NextResponse.json({
    stats: {
      users: userCount || 0,
      posts: postCount || 0,
      comments: commentCount || 0,
      questions: questionCount || 0
    },
    pendingPosts: pendingPosts || [],
    hotPosts: hotPosts || [],
    dauData
  });
}
