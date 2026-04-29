import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, event, points } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Standard award points map
    const pointsMap: Record<string, number> = {
      post_created: 10,
      post_liked: 1,
      answer_created: 5,
      daily_checkin: 1
    };

    const pointsToAward = points || pointsMap[event] || 0;

    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, awarded: pointsToAward });
    }

    // Fetch current points
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('points')
      .eq('id', userId)
      .single();

    const currentPoints = (profile?.points || 0) + pointsToAward;

    // Calculate level
    let level = 1;
    if (currentPoints > 500) level = 4;
    else if (currentPoints > 200) level = 3;
    else if (currentPoints > 50) level = 2;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        points: currentPoints,
        level: level 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
