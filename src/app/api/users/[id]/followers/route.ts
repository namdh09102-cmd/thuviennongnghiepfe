import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const followingId = params.id;

  let query = supabaseAdmin
    .from('profiles')
    .select('id');

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(followingId);
  
  if (isUUID) {
    query = query.eq('id', followingId);
  } else {
    query = query.eq('username', followingId);
  }

  const { data: targetUser } = await query.single();

  if (!targetUser) return NextResponse.json({ error: 'Người dùng không tồn tại.' }, { status: 404 });

  // Since follows table might not exist, we return an empty array
  return NextResponse.json([]);
}
