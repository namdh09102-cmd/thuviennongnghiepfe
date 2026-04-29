import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();
  const { title, content, category_id, excerpt, thumbnail_url, tags } = body;

  if (!supabaseAdmin) {
    return NextResponse.json({ data: { content }, error: null, meta: { draft: true } });
  }

  // Update or create draft record
  // We store draft in a separate `drafts` table, or a status field on posts.
  // If drafts table doesn't exist, let's create a post record with `status = 'draft'`.
  const slug = (title ? title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : 'bai-nhap') + '-' + Date.now();

  const { data, error } = await supabaseAdmin
    .from('posts')
    .upsert([
      {
        title: title || 'Bài viết nháp',
        content: content || '',
        category_id: category_id || null,
        excerpt: excerpt || '',
        thumbnail_url: thumbnail_url || '',
        tags: tags || '',
        slug,
        author_id: userId,
        status: 'draft'
      }
    ], { onConflict: 'author_id, status' }) // Assuming a single draft allowed per user
    .select()
    .single();

  if (error) {
    // Fallback if constraint issues exist
    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('posts')
      .insert([{
        title: title || 'Bài viết nháp',
        content: content || '',
        category_id: category_id || null,
        excerpt: excerpt || '',
        thumbnail_url: thumbnail_url || '',
        tags: tags || '',
        slug,
        author_id: userId,
        status: 'draft'
      }])
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ data: null, error: insertErr.message, meta: null }, { status: 500 });
    }
    return NextResponse.json({ data: inserted, error: null, meta: { created: true } });
  }

  return NextResponse.json({ data, error: null, meta: { updated: true } });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ data: null, error: null, meta: null });
  }

  const userId = (session.user as any).id;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*')
    .eq('author_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: null, meta: null });
  }

  return NextResponse.json({ data, error: null, meta: { draftFound: true } });
}
