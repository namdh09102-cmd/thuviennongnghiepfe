import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Post from '@/models/Post';
import Question from '@/models/Question';
import mongoose from 'mongoose';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const db = mongoose.connection.db!;

    // 1. Seed Admin User
    const adminEmail = 'admin@example.com';
    const adminPassword = 'adminpassword';
    const hashedAdminPassword = crypto.scryptSync(adminPassword, adminEmail, 64).toString('hex');
    
    const adminUser = await db.collection('users').findOneAndUpdate(
      { email: adminEmail },
      { 
        $setOnInsert: { 
          email: adminEmail,
          name: 'Ban Quản Trị',
          username: 'admin',
          role: 'admin',
          is_verified: true,
          password: hashedAdminPassword,
          created_at: new Date()
        } 
      },
      { upsert: true, returnDocument: 'after' }
    );

    const adminId = adminUser?.value ? adminUser.value._id.toString() : (adminUser as any)?._id?.toString() || 'admin-mock-id';

    // 2. Seed Expert User
    const expertEmail = 'expert@example.com';
    const expertPassword = 'password123';
    const hashedExpertPassword = crypto.scryptSync(expertPassword, expertEmail, 64).toString('hex');

    const expertUser = await db.collection('users').findOneAndUpdate(
      { email: expertEmail },
      { 
        $setOnInsert: { 
          email: expertEmail,
          name: 'GS.TS Nguyễn Văn A',
          username: 'chuyengianongnghiep',
          role: 'expert',
          is_verified: true,
          points: 150,
          password: hashedExpertPassword,
          created_at: new Date(),
          bio: 'Giảng viên cấp cao Đại học Cần Thơ. Chuyên gia 30 năm kinh nghiệm về cây ăn trái miền Tây.',
          region: 'Cần Thơ'
        } 
      },
      { upsert: true, returnDocument: 'after' }
    );

    const expertId = expertUser?.value ? expertUser.value._id.toString() : (expertUser as any)?._id?.toString() || 'expert-mock-id';

    // 3. Seed Categories
    const categories = [
      { name: 'Trồng trọt', slug: 'trong-trot', sort_order: 1, icon: '🌱' },
      { name: 'Chăn nuôi', slug: 'chan-nuoi', sort_order: 2, icon: '🐄' },
      { name: 'Phân bón', slug: 'phan-bon', sort_order: 3, icon: '🧪' },
      { name: 'Sâu bệnh', slug: 'sau-benh', sort_order: 4, icon: '🐛' },
      { name: 'Nông nghiệp số', slug: 'nong-nghiep-so', sort_order: 5, icon: '📱' },
    ];

    const dbCats = [];
    for (const cat of categories) {
      const c = await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
      dbCats.push(c);
    }

    const catMap = new Map(dbCats.map((c: any) => [c.slug, c._id.toString()]));

    // 4. Seed Posts
    const posts = [
      {
        title: 'Kỹ thuật trồng sầu riêng Ri6 đạt năng suất cao',
        slug: 'ky-thuat-trong-sau-rieng-ri6',
        content: '<p>Sầu riêng Ri6 là giống cây ăn trái có giá trị kinh tế cao...</p>',
        excerpt: 'Chia sẻ bí quyết bón phân và chăm sóc sầu riêng giai đoạn làm bông.',
        thumbnail_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
        status: 'published',
        category_id: catMap.get('trong-trot'),
        author_id: expertId,
        view_count: 1250,
        like_count: 42,
        comment_count: 15,
        tags: ['Sầu riêng', 'Trồng trọt', 'Ri6'],
        created_at: new Date()
      },
      {
        title: 'Cách phòng trừ bệnh đạo ôn trên lúa vụ Đông Xuân',
        slug: 'phong-tru-benh-dao-on-lua',
        content: '<p>Bệnh đạo ôn do nấm Pyricularia oryzae gây ra, ảnh hưởng lớn đến năng suất lúa...</p>',
        excerpt: 'Nhận biết sớm dấu hiệu bệnh và các loại thuốc đặc trị hiệu quả.',
        thumbnail_url: 'https://images.unsplash.com/photo-1536638317175-32449e148ced?w=800',
        status: 'published',
        category_id: catMap.get('sau-benh'),
        author_id: expertId,
        view_count: 1100,
        like_count: 30,
        comment_count: 10,
        tags: ['Lúa', 'Sâu bệnh'],
        created_at: new Date()
      },
      {
        title: 'Quy trình bón phân cho bưởi da xanh giai đoạn nuôi trái',
        slug: 'quy-trinh-bon-phan-buoi-da-xanh',
        content: '<p>Giai đoạn nuôi trái quyết định chất lượng và độ ngọt của bưởi da xanh...</p>',
        excerpt: 'Hướng dẫn bón phân đạm, lân, kali cân đối giúp trái to, bóng đẹp.',
        thumbnail_url: 'https://images.unsplash.com/photo-1615678815958-5910c6811c25?w=800',
        status: 'published',
        category_id: catMap.get('phan-bon'),
        author_id: expertId,
        view_count: 850,
        like_count: 25,
        comment_count: 3,
        tags: ['Phân bón', 'Dinh dưỡng'],
        created_at: new Date()
      },
      {
        title: 'Kỹ thuật nuôi bò vỗ béo theo hướng an toàn sinh học',
        slug: 'ky-thuat-nuoi-bo-vo-beo',
        content: '<p>Nuôi bò vỗ béo mang lại nguồn thu nhập ổn định cho bà con nông dân...</p>',
        excerpt: 'Xây dựng khẩu phần ăn và lịch tiêm phòng vắc-xin cho bò thịt.',
        thumbnail_url: 'https://images.unsplash.com/photo-1545466226-ddba60a43ed6?w=800',
        status: 'published',
        category_id: catMap.get('chan-nuoi'),
        author_id: adminId,
        view_count: 620,
        like_count: 18,
        comment_count: 5,
        tags: ['Bò', 'Chăn nuôi'],
        created_at: new Date()
      },
      {
        title: 'Bài viết chờ duyệt thử nghiệm',
        slug: 'bai-viet-cho-duyet',
        content: '<p>Nội dung bài viết đang chờ admin duyệt...</p>',
        excerpt: 'Bài viết đang chờ duyệt.',
        thumbnail_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
        status: 'pending',
        category_id: catMap.get('trong-trot'),
        author_id: expertId,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date()
      }
    ];

    for (const post of posts) {
      await Post.findOneAndUpdate(
        { slug: post.slug },
        { $set: post },
        { upsert: true, new: true }
      );
    }

    // 5. Seed Questions
    const questions = [
      {
        title: 'Cây bưởi bị vàng lá thối rễ, xin chuyên gia hướng dẫn cách chữa?',
        content: 'Vườn bưởi nhà tôi 3 năm tuổi có hiện tượng vàng lá cả cây, đào rễ thấy bị đen thối. Xin hỏi nguyên nhân và cách khắc phục?',
        user_id: adminId,
        status: 'pending',
        created_at: new Date()
      },
      {
        title: 'Lượng phân bón lót cho 1 ha lúa Hè Thu là bao nhiêu?',
        content: 'Tôi chuẩn bị xuống giống lúa Hè Thu, vùng đất phèn nhẹ. Cần bón lót bao nhiêu lân, vôi và phân chuồng cho 1 ha?',
        user_id: expertId,
        status: 'pending',
        created_at: new Date()
      }
    ];

    for (const q of questions) {
      await Question.findOneAndUpdate(
        { title: q.title },
        { $set: q },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB Atlas seeded successfully',
      credentials: {
        admin: { email: adminEmail, password: adminPassword },
        expert: { email: expertEmail, password: expertPassword }
      }
    });
  } catch (err: any) {
    console.error('MongoDB seeding failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
