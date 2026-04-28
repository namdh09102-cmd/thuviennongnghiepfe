import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const followingId = params.id;

  let { data: targetUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .or(`id.eq.${followingId},username.eq.${followingId}`)
    .single();

  if (!targetUser) return NextResponse.json({ error: 'Người dùng không tồn tại.' }, { status: 404 });

  const { data: follows, error } = await supabaseAdmin
    .from('follows')
    .select('follower_id')
    .eq('following_id', targetUser.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const followerIds = follows?.map((f: any) => f.follower_id) || [];

  if (followerIds.length === 0) return NextResponse.json([]);

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, avatar_url, role')
    .in('id', followerIds);

  return NextResponse.json(profiles || []);
}
