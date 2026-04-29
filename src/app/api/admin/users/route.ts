import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { jwtVerify } from 'jose';

async function checkAdminAuth(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token')?.value;
  if (!adminToken) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
    const { payload } = await jwtVerify(adminToken, secret);
    return payload.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  if (!supabaseAdmin) {
    return NextResponse.json({ data: [], total: 0 });
  }

  let query = supabaseAdmin
    .from('profiles')
    .select('*, posts(count)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message, data: [], total: 0 });
  }

  return NextResponse.json({ data, total: count });
}

export async function PATCH(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
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
