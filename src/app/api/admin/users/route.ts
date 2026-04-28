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
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const MOCK_ADMIN_USERS = [
    { id: 'user-1', full_name: 'Nguyễn Văn Minh', username: 'chuyengia_minh', email: 'minh@agri.vn', role: 'expert', points: 120, is_verified: true, created_at: '2025-01-15T00:00:00Z' },
    { id: 'user-2', full_name: 'Lê Thị Hoa', username: 'ky_su_hoa', email: 'hoa@agri.vn', role: 'moderator', points: 95, is_verified: true, created_at: '2025-02-20T00:00:00Z' },
    { id: 'user-3', full_name: 'Trần Đại Tấn', username: 'tan_npk', email: 'tan@agri.vn', role: 'member', points: 80, is_verified: false, created_at: '2025-03-10T00:00:00Z' }
  ];

  if (!supabaseAdmin) {
    const filtered = role && role !== 'all' ? MOCK_ADMIN_USERS.filter(u => u.role === role) : MOCK_ADMIN_USERS;
    return NextResponse.json({ data: filtered, total: filtered.length });
  }

  let query = supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  const { data, count, error } = await query;
  
  if (error || !data || data.length === 0) {
    const filtered = role && role !== 'all' ? MOCK_ADMIN_USERS.filter(u => u.role === role) : MOCK_ADMIN_USERS;
    return NextResponse.json({ data: filtered, total: filtered.length });
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
