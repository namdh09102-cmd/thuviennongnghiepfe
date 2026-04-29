const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Updating profile...');
  // 1. Update existing expert profile
  await supabase.from('profiles').upsert([{
    id: 'ccdfc281-e20d-40da-a169-fef2445c83d5',
    username: 'chuyengianongnghiep',
    full_name: 'GS.TS Nguyễn Văn A',
    role: 'expert',
    is_verified: true,
    points: 1250,
    bio: 'Giảng viên cấp cao Đại học Cần Thơ. Chuyên gia 30 năm kinh nghiệm về cây ăn trái miền Tây.',
    region: 'Cần Thơ'
  }], { onConflict: 'id' });

  console.log('Inserting robust posts...');
  // 2. Insert robust posts with valid UUIDs
  const posts = [
    {
      id: 'a2ca282b-f4ef-4437-9900-18caf17ce539',
      slug: 'ky-thuat-trong-sau-rieng',
      title: 'Kỹ thuật trồng Sầu riêng Ri6 đạt năng suất cao',
      excerpt: 'Chia sẻ bí quyết bón phân và chăm sóc sầu riêng giai đoạn làm bông...',
      content: 'Nội dung chi tiết bài viết ở đây. Chăm sóc sầu riêng đòi hỏi kỹ thuật cao, nhất là khâu tỉa cành và điều tiết nước.',
      thumbnail_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
      author_id: 'ccdfc281-e20d-40da-a169-fef2445c83d5',
      category_id: 1,
      status: 'published',
      view_count: 1250,
      like_count: 42,
      comment_count: 15,
      tags: ['Sầu riêng', 'Trồng trọt', 'Ri6'],
    },
    {
      id: '635de295-ac1b-45f7-8cec-d57070573a65',
      slug: 'bon-phan-npk-dung-cach',
      title: 'Hướng dẫn bón phân NPK đúng cách cho cây trồng',
      excerpt: 'Quy trình bón phân NPK theo nguyên tắc 4 đúng, giúp tối ưu chi phí và tăng năng suất.',
      content: 'Bón phân NPK cần chú ý thời điểm sinh trưởng của cây. Giai đoạn ra hoa cần bón lân, giai đoạn nuôi quả cần bón Kali.',
      thumbnail_url: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25?auto=format&fit=crop&w=800&q=80',
      author_id: 'ccdfc281-e20d-40da-a169-fef2445c83d5',
      category_id: 3,
      status: 'published',
      view_count: 850,
      like_count: 25,
      comment_count: 3,
      tags: ['Phân bón', 'Dinh dưỡng'],
    },
    {
      id: '9e9d0012-2a60-4e6f-b897-07f244257fbb',
      slug: 'phong-tru-dao-on-lua-he-thu',
      title: 'Biện pháp phòng trừ đạo ôn lúa hè thu',
      excerpt: 'Chi tiết các biện pháp canh tác và sử dụng thuốc BVTV hợp lý để phòng trừ bệnh đạo ôn.',
      content: 'Bệnh đạo ôn lá lúa thường bùng phát khi độ ẩm cao. Sử dụng thuốc đặc trị kịp thời khi phát hiện vết chấm kim.',
      thumbnail_url: 'https://images.unsplash.com/photo-1530836361253-efad5c4ff877?auto=format&fit=crop&w=800&q=80',
      author_id: 'ccdfc281-e20d-40da-a169-fef2445c83d5',
      category_id: 4,
      status: 'published',
      view_count: 1100,
      like_count: 30,
      comment_count: 10,
      tags: ['Lúa', 'Sâu bệnh'],
    },
    {
      id: '194f3a1a-b4c2-4a76-86f5-b2e19cfc673e',
      slug: 'ky-thuat-trong-dua-luoi-nha-mang',
      title: 'Kỹ thuật trồng dưa lưới nhà màng đạt chuẩn',
      excerpt: 'Nội dung hướng dẫn kỹ thuật trồng dưa lưới trong nhà màng cho năng suất cao.',
      content: 'Trồng dưa lưới VietGAP cần kiểm soát dinh dưỡng tưới nhỏ giọt và phòng ngừa nấm trắng.',
      thumbnail_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
      author_id: 'ccdfc281-e20d-40da-a169-fef2445c83d5',
      category_id: 1,
      status: 'published',
      view_count: 620,
      like_count: 18,
      comment_count: 5,
      tags: ['Dưa lưới', 'Trồng trọt'],
    }
  ];

  for (const p of posts) {
    const { error } = await supabase.from('posts').upsert([p], { onConflict: 'id' });
    if (error) console.error('Error inserting post:', p.slug, error);
    else console.log('Upserted post:', p.slug);
  }
  
  console.log('Done.');
}

seed();
