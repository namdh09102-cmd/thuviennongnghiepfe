import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { userId, role, is_verified, points } = body;

  const updateData: any = {};
  if (role) updateData.role = role;
  if (typeof is_verified === 'boolean') updateData.is_verified = is_verified;
  if (typeof points === 'number') updateData.points = points;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}
