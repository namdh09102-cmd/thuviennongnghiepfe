import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, username, password } = await req.json();

    if (!full_name || !email || !username || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin đăng ký' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase không được cấu hình' }, { status: 500 });
    }

    // 1. Tạo Auth User trong Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        username
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Tạo Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert([{
        id: userId,
        username,
        full_name,
        role: 'member',
        points: 0,
        level: 1,
        bio: 'Thành viên mới tham gia AgriLib.',
        region: ''
      }], { onConflict: 'id' });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
