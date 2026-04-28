import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      posts:posts(
        *,
        author:profiles(username, full_name, avatar_url, is_verified),
        category:categories(name, slug)
      ),
      badges:profiles_badges(
        badge_id,
        badges:badges(*)
      )
    `)
    .eq('id', userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transform badges to flat array
  const transformedProfile = {
    ...profile,
    badges: profile.badges?.map((b: any) => b.badges) || []
  };

  return NextResponse.json(transformedProfile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  
  const { full_name, avatar_url, bio, region, main_crops } = body;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ full_name, avatar_url, bio, region, main_crops })
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
