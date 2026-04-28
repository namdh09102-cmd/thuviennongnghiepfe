import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('posts')
    .select(`
      *,
      author:profiles(full_name, username),
      category:categories(name)
    `, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { ids, status, is_featured, is_pinned } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
  }

  const updateData: any = {};
  if (status) {
    updateData.status = status;
    if (status === 'published') updateData.published_at = new Date().toISOString();
  }
  if (typeof is_featured === 'boolean') updateData.is_featured = is_featured;
  if (typeof is_pinned === 'boolean') updateData.is_pinned = is_pinned;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update(updateData)
    .in('id', ids)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids')?.split(',');

  if (!ids) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('posts')
    .delete()
    .in('id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
