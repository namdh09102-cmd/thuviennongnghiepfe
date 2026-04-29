import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
  }

  const followerId = (session.user as any).id;
  const followingId = params.id;

  if (followerId === followingId) {
    return NextResponse.json(
      { data: null, error: 'You cannot follow yourself', meta: null },
      { status: 400 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ data: { following: true, count: 1 }, error: null, meta: null });
  }

  const { data: existingFollow } = await supabaseAdmin
    .from('user_follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  let following = false;

  if (existingFollow) {
    await supabaseAdmin.from('user_follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
    following = false;
  } else {
    await supabaseAdmin.from('user_follows').insert({ follower_id: followerId, following_id: followingId });
    following = true;
  }

  // Count total followers
  const { count } = await supabaseAdmin
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', followingId);

  return NextResponse.json({ 
    data: { following, count: count || 0 }, 
    error: null, 
    meta: { followerId, followingId } 
  });
}
