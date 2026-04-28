import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client thông thường
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Client có quyền Admin
export const supabaseAdmin = (supabaseUrl && supabaseServiceRole)
  ? createClient(supabaseUrl, supabaseServiceRole)
  : null as any;

// Helper tạo client với Access Token
export const createSupabaseUserClient = (accessToken?: string) => {
  if (!supabaseUrl || !supabaseAnonKey) return null as any;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};
