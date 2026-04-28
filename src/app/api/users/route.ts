import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const limit = parseInt(searchParams.get('limit') || '10');

  let query = supabaseAdmin
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, is_verified, level, points')
    .limit(limit)
    .order('points', { ascending: false });

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
