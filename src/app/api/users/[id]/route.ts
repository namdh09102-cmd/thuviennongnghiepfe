import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { id } = params;

  let query = supabaseAdmin
    .from('profiles')
    .select(`
      *,
      posts:posts(*)
    `);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('username', id);
  }

  const { data: profile, error } = await query.single();

  if (error || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Mock badges since tables don't exist
  const transformedBadges = [
    { id: 'b1', name: 'Nông dân Chăm chỉ', icon: '🌱', description: 'Đã tham gia cộng đồng' },
    { id: 'b2', name: 'Chuyên gia Chia sẻ', icon: '✍️', description: 'Đã viết bài viết đầu tiên' }
  ];

  const points = profile.points || 0;
  const level = Math.floor(points / 100) + 1;
  const levelProgress = points % 100;

  // Mock stats since follows table might not exist
  const fullProfile = {
    ...profile,
    badges: transformedBadges,
    level,
    levelProgress,
    stats: {
      postsCount: profile.posts?.length || 0,
      answersCount: 0,
      followersCount: 12, // Mock
      followingCount: 8   // Mock
    },
    questions: [] // Mock or fetch if table exists
  };

  return NextResponse.json(fullProfile);
}

