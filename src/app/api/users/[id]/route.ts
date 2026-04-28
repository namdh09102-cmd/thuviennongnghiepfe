import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { id } = params; // Can be username or ID

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      posts:posts(*),
      badges:profiles_badges(
        badge_id,
        badges:badges(*)
      )
    `)
    .or(`id.eq.${id},username.eq.${id}`)
    .single();

  if (error || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const transformedBadges = profile.badges?.map((b: any) => b.badges).filter(Boolean) || [];

  const points = profile.points || 0;
  const level = Math.floor(points / 100) + 1;
  const levelProgress = points % 100;

  const { count: followersCount } = await supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  const { data: questions } = await supabaseAdmin
    .from('questions')
    .select('*')
    .eq('author_id', profile.id);

  const fullProfile = {
    ...profile,
    badges: transformedBadges,
    level,
    levelProgress,
    stats: {
      postsCount: profile.posts?.length || 0,
      answersCount: 0,
      followersCount: followersCount || 0,
      followingCount: followingCount || 0
    },
    questions: questions || []
  };

  return NextResponse.json(fullProfile);
}
