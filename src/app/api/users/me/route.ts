import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { Redis } from '@upstash/redis';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { full_name, username, bio, region, main_crops } = body;

  const redis = Redis.fromEnv();

  if (username) {
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (currentProfile && currentProfile.username !== username) {
      const lastUpdateKey = `username_update:${userId}`;
      const lastUpdate = await redis.get<number>(lastUpdateKey);
      const now = Date.now();

      if (lastUpdate && now - lastUpdate < 30 * 24 * 60 * 60 * 1000) {
        const daysLeft = Math.ceil((30 * 24 * 60 * 60 * 1000 - (now - lastUpdate)) / (24 * 60 * 60 * 1000));
        return NextResponse.json({ error: `Bạn chỉ có thể đổi username 1 lần mỗi 30 ngày. Còn ${daysLeft} ngày.` }, { status: 400 });
      }

      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        return NextResponse.json({ error: 'Username đã được sử dụng' }, { status: 400 });
      }

      await redis.set(lastUpdateKey, now);
    }
  }

  const updateData: any = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (username !== undefined) updateData.username = username;
  if (bio !== undefined) updateData.bio = bio;
  if (region !== undefined) updateData.region = region;
  if (main_crops !== undefined) updateData.main_crops = main_crops;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
