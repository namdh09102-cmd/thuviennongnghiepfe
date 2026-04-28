import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client thông thường (thường dùng ở Client Component hoặc Public Route)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client có quyền Admin (dùng ở Route Handler khi cần vượt qua RLS hoặc thực hiện tác vụ hệ thống)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

// Helper tạo client với Access Token của user để RLS hoạt động
export const createSupabaseUserClient = (accessToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};
