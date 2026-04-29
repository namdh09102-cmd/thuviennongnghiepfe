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

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data && data.length > 0) {
    const authorIds = Array.from(new Set(data.map((c: any) => c.author_id).filter(Boolean)));
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', authorIds);

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

    const postIds = Array.from(new Set(data.map((c: any) => c.post_id).filter(Boolean)));
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('id, title, slug')
      .in('id', postIds);

    const postMap = new Map(posts?.map((p: any) => [p.id, p]) || []);

    data.forEach((c: any) => {
      c.author = profileMap.get(c.author_id) || { full_name: 'Người dùng', username: 'member' };
      c.post = postMap.get(c.post_id) || { title: 'Bài viết đã xóa', slug: 'deleted' };
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
