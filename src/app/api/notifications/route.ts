import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data && data.length > 0) {
    const actorIds = Array.from(new Set(data.map((n: any) => n.actor_id).filter(Boolean)));
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', actorIds);

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

    data.forEach((n: any) => {
      n.actor = profileMap.get(n.actor_id) || { full_name: 'Người dùng', avatar_url: '' };
    });
  }
  
  return NextResponse.json({
    data,
    total: count,
    page,
    limit
  });
}
