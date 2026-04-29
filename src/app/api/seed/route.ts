import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabaseAdmin is missing' }, { status: 500 });
  }

  // Seed Categories
  const categories = [
    { name: 'Trồng trọt', slug: 'trong-trot', sort_order: 1 },
    { name: 'Chăn nuôi', slug: 'chan-nuoi', sort_order: 2 },
    { name: 'Phân bón', slug: 'phan-bon', sort_order: 3 },
    { name: 'Sâu bệnh', slug: 'sau-benh', sort_order: 4 },
    { name: 'Nông nghiệp số', slug: 'nong-nghiep-so', sort_order: 5 },
  ];

  for (const cat of categories) {
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .single();
    
    if (!existing) {
      await supabaseAdmin.from('categories').insert([cat]);
    }
  }

  // Get Category IDs
  const { data: dbCats } = await supabaseAdmin.from('categories').select('id, slug');
  const catMap = new Map(dbCats?.map((c: any) => [c.slug, c.id]) || []);

  // Seed Profiles
  const profile = {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    full_name: 'Ban Quản Trị',
    role: 'admin',
    is_verified: true
  };

  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('username', profile.username)
    .single();

  if (!existingProfile) {
    await supabaseAdmin.from('profiles').insert([profile]);
  }

  // Seed Posts
  const posts = [
    {
      title: 'Kỹ thuật trồng dưa lưới nhà màng đạt năng suất cao',
      slug: 'ky-thuat-trong-dua-luoi-nha-mang',
      content: '<p>Dưa lưới là loại cây trồng mang lại giá trị kinh tế cao...</p>',
      excerpt: 'Hướng dẫn chi tiết cách bón phân, chăm sóc dưa lưới.',
      thumbnail_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37',
      status: 'published',
      category_id: catMap.get('trong-trot'),
      author_id: profile.id
    },
    {
      title: 'Quy trình ủ phân hữu cơ vi sinh tại nhà',
      slug: 'quy-trinh-u-phan-huu-co',
      content: '<p>Ủ phân hữu cơ giúp tiết kiệm chi phí và bảo vệ đất...</p>',
      excerpt: 'Tận dụng rác thải nhà bếp để làm phân bón sinh học.',
      thumbnail_url: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25',
      status: 'published',
      category_id: catMap.get('phan-bon'),
      author_id: profile.id
    }
  ];

  for (const post of posts) {
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('slug', post.slug)
      .single();

    if (!existingPost) {
      await supabaseAdmin.from('posts').insert([post]);
    }
  }

  return NextResponse.json({ success: true, message: 'Database seeded successfully' });
}
