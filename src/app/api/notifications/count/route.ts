import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const userId = (session.user as any).id;

  if (!supabaseAdmin) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    return NextResponse.json({ unreadCount: 0 });
  }

  return NextResponse.json({ unreadCount: count || 0 });
}
