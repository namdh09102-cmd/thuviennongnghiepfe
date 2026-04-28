import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const followerId = (session.user as any).id;
  const followingId = params.id;

  if (followerId === followingId) {
    return NextResponse.json({ error: 'Bạn không thể tự theo dõi chính mình.' }, { status: 400 });
  }

  let { data: targetUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .or(`id.eq.${followingId},username.eq.${followingId}`)
    .single();

  if (!targetUser) return NextResponse.json({ error: 'Người dùng không tồn tại.' }, { status: 404 });

  const { data: existingFollow } = await supabaseAdmin
    .from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', targetUser.id)
    .single();

  if (existingFollow) {
    await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', targetUser.id);

    return NextResponse.json({ isFollowing: false });
  } else {
    await supabaseAdmin
      .from('follows')
      .insert([{ follower_id: followerId, following_id: targetUser.id }]);

    return NextResponse.json({ isFollowing: true });
  }
}
