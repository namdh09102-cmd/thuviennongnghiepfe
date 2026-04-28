import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotificationAsync } from '@/lib/createNotification';

export async function POST(req: NextRequest) {
  // Guard with a secret key to prevent unauthorized triggering
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  // Find users who haven't checked in today
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('id');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: checkedInUsers } = await supabaseAdmin
    .from('checkins')
    .select('user_id')
    .eq('checked_at', today);

  const checkedInIds = new Set(checkedInUsers?.map((c: any) => c.user_id) || []);
  const targetUsers = users.filter(u => !checkedInIds.has(u.id));

  targetUsers.forEach(user => {
    createNotificationAsync(
      user.id,
      'daily_reminder',
      {
        reason: 'Bạn ơi, đừng quên điểm danh hôm nay để nhận 5 điểm uy tín nhé!'
      },
      undefined,
      'system',
      undefined
    );
  });

  return NextResponse.json({ success: true, notifiedCount: targetUsers.length });
}
