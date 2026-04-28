import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Tăng view count bằng SQL function (đã định nghĩa trong Supabase)
  // Nếu chưa định nghĩa RPC, dùng tạm update (không khuyến khích cho production lớn)
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('view_count')
    .eq('slug', params.slug)
    .single();

  if (error) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  const { error: updateError } = await supabaseAdmin
    .from('posts')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('slug', params.slug);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
