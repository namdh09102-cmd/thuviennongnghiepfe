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
      title: 'Kỹ thuật trồng sầu riêng Ri6 đạt năng suất cao',
      slug: 'ky-thuat-trong-sau-rieng-ri6',
      content: '<p>Sầu riêng Ri6 là giống cây ăn trái có giá trị kinh tế cao...</p>',
      excerpt: 'Chia sẻ bí quyết bón phân và chăm sóc sầu riêng giai đoạn làm bông.',
      thumbnail_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
      status: 'published',
      category_id: catMap.get('trong-trot'),
      author_id: profile.id
    },
    {
      title: 'Cách phòng trừ bệnh đạo ôn trên lúa vụ Đông Xuân',
      slug: 'phong-tru-benh-dao-on-lua',
      content: '<p>Bệnh đạo ôn do nấm Pyricularia oryzae gây ra, ảnh hưởng lớn đến năng suất lúa...</p>',
      excerpt: 'Nhận biết sớm dấu hiệu bệnh và các loại thuốc đặc trị hiệu quả.',
      thumbnail_url: 'https://images.unsplash.com/photo-1536638317175-32449e148ced?w=800',
      status: 'published',
      category_id: catMap.get('sau-benh'),
      author_id: profile.id
    },
    {
      title: 'Quy trình bón phân cho bưởi da xanh giai đoạn nuôi trái',
      slug: 'quy-trinh-bon-phan-buoi-da-xanh',
      content: '<p>Giai đoạn nuôi trái quyết định chất lượng và độ ngọt của bưởi da xanh...</p>',
      excerpt: 'Hướng dẫn bón phân đạm, lân, kali cân đối giúp trái to, bóng đẹp.',
      thumbnail_url: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25?w=800',
      status: 'published',
      category_id: catMap.get('phan-bon'),
      author_id: profile.id
    },
    {
      title: 'Kỹ thuật nuôi bò vỗ béo theo hướng an toàn sinh học',
      slug: 'ky-thuat-nuoi-bo-vo-beo',
      content: '<p>Nuôi bò vỗ béo mang lại nguồn thu nhập ổn định cho bà con nông dân...</p>',
      excerpt: 'Xây dựng khẩu phần ăn và lịch tiêm phòng vắc-xin cho bò thịt.',
      thumbnail_url: 'https://images.unsplash.com/photo-1545466226-ddba60a43ed6?w=800',
      status: 'published',
      category_id: catMap.get('chan-nuoi'),
      author_id: profile.id
    },
    {
      title: 'Ứng dụng IoT trong quản lý nước tưới thông minh',
      slug: 'ung-dung-iot-tuoi-thong-minh',
      content: '<p>Công nghệ IoT giúp tự động hóa hệ thống tưới tiêu dựa trên độ ẩm của đất...</p>',
      excerpt: 'Tiết kiệm 40% lượng nước và tối ưu hóa chi phí nhân công.',
      thumbnail_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
      status: 'published',
      category_id: catMap.get('nong-nghiep-so'),
      author_id: profile.id
    },
    {
      title: 'Bí quyết làm giàu từ mô hình nuôi cua đồng trong bể xi măng',
      slug: 'mo-hinh-nuoi-cua-dong',
      content: '<p>Nuôi cua đồng trong bể xi măng dễ quản lý và thu hồi vốn nhanh...</p>',
      excerpt: 'Cách thiết kế bể nuôi, quản lý nguồn nước và thức ăn cho cua.',
      thumbnail_url: 'https://images.unsplash.com/photo-1614548331473-71e5b13f7f80?w=800',
      status: 'published',
      category_id: catMap.get('chan-nuoi'),
      author_id: profile.id
    },
    {
      title: 'Xử lý rơm rạ bằng chế phẩm sinh học sau thu hoạch',
      slug: 'xu-ly-rom-ra-sinh-hoc',
      content: '<p>Đốt rơm rạ gây ô nhiễm môi trường và làm nghèo kiệt đất đai...</p>',
      excerpt: 'Ủ rơm rạ thành phân bón hữu cơ cải tạo đất cực tốt.',
      thumbnail_url: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800',
      status: 'published',
      category_id: catMap.get('phan-bon'),
      author_id: profile.id
    },
    {
      title: 'Nhận biết và phòng trị nhện đỏ hại cây có múi',
      slug: 'phong-tri-nhen-do-cay-co-mui',
      content: '<p>Nhện đỏ chích hút làm vàng lá, rụng trái non trên cây cam, bưởi...</p>',
      excerpt: 'Các biện pháp sinh học và hóa học kiểm soát nhện đỏ hiệu quả.',
      thumbnail_url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800',
      status: 'published',
      category_id: catMap.get('sau-benh'),
      author_id: profile.id
    },
    {
      title: 'Kỹ thuật trồng rau thủy canh quy mô gia đình',
      slug: 'trong-rau-thuy-canh-tai-gia',
      content: '<p>Trồng rau thủy canh cung cấp nguồn rau sạch, an toàn cho gia đình...</p>',
      excerpt: 'Thiết kế giàn thủy canh hồi lưu đơn giản, chi phí thấp.',
      thumbnail_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
      status: 'published',
      category_id: catMap.get('trong-trot'),
      author_id: profile.id
    },
    {
      title: 'Sử dụng drone phun thuốc BVTV: Lợi ích và lưu ý',
      slug: 'drone-phun-thuoc-bvtv',
      content: '<p>Máy bay không người lái (drone) đang thay đổi phương thức canh tác...</p>',
      excerpt: 'Tăng hiệu quả dập dịch, bảo vệ sức khỏe người nông dân.',
      thumbnail_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
      status: 'published',
      category_id: catMap.get('nong-nghiep-so'),
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

  // Seed Questions
  const questions = [
    {
      title: 'Cây bưởi bị vàng lá thối rễ, xin chuyên gia hướng dẫn cách chữa?',
      content: 'Vườn bưởi nhà tôi 3 năm tuổi có hiện tượng vàng lá cả cây, đào rễ thấy bị đen thối. Xin hỏi nguyên nhân và cách khắc phục?',
      user_id: profile.id,
      status: 'pending'
    },
    {
      title: 'Lượng phân bón lót cho 1 ha lúa Hè Thu là bao nhiêu?',
      content: 'Tôi chuẩn bị xuống giống lúa Hè Thu, vùng đất phèn nhẹ. Cần bón lót bao nhiêu lân, vôi và phân chuồng cho 1 ha?',
      user_id: profile.id,
      status: 'pending'
    },
    {
      title: 'Heo bị sốt cao, bỏ ăn, nằm một chỗ là triệu chứng của bệnh gì?',
      content: 'Đàn heo thịt nhà tôi có 2 con bị sốt 41 độ, bỏ ăn 2 ngày nay, da xuất hiện các nốt xuất huyết đỏ tím.',
      user_id: profile.id,
      status: 'pending'
    },
    {
      title: 'Trồng dưa lưới vụ Thu Đông cần lưu ý những gì về nhiệt độ?',
      content: 'Tôi muốn xuống giống dưa lưới vào tháng 10 âm lịch tại miền Bắc. Thời tiết lạnh có ảnh hưởng nhiều đến thụ phấn không?',
      user_id: profile.id,
      status: 'pending'
    },
    {
      title: 'Làm sao để nhận biết phân NPK giả trên thị trường?',
      content: 'Hiện nay có rất nhiều cơ sở sản xuất phân bón kém chất lượng. Có mẹo nào kiểm tra phân NPK thật giả nhanh bằng mắt thường không?',
      user_id: profile.id,
      status: 'pending'
    }
  ];

  for (const q of questions) {
    const { data: existingQ } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq('title', q.title)
      .single();

    if (!existingQ) {
      await supabaseAdmin.from('questions').insert([q]);
    }
  }

  return NextResponse.json({ success: true, message: 'Database seeded successfully' });
}
