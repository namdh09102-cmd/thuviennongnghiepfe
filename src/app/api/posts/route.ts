import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

const MOCK_POSTS = [
  {
    id: "mock-post-1",
    slug: "ky-thuat-trong-sau-rieng-ri6",
    title: "Kỹ thuật trồng Sầu riêng Ri6 đạt năng suất cao",
    excerpt: "Chia sẻ bí quyết bón phân và chăm sóc sầu riêng giai đoạn làm bông...",
    content: "Chăm sóc sầu riêng đòi hỏi kỹ thuật cao, nhất là khâu tỉa cành và điều tiết nước...",
    thumbnail_url: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800",
    author_id: "chuyengia1",
    category_id: 1,
    status: "published",
    view_count: 1250,
    like_count: 42,
    comment_count: 15,
    tags: ["Sầu riêng", "Trồng trọt", "Ri6"],
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: {
      id: "chuyengia1",
      username: "chuyengianongnghiep",
      full_name: "GS.TS Nguyễn Văn A",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Expert"
    },
    category: {
      id: 1,
      name: "Trồng trọt",
      slug: "trong-trot"
    }
  },
  {
    id: "mock-post-2",
    slug: "phong-tru-benh-dao-on-lua",
    title: "Cách phòng trừ bệnh đạo ôn trên lúa vụ Đông Xuân",
    excerpt: "Nhận biết sớm dấu hiệu bệnh và các loại thuốc đặc trị hiệu quả.",
    content: "Bệnh đạo ôn do nấm Pyricularia oryzae gây ra, ảnh hưởng lớn đến năng suất lúa...",
    thumbnail_url: "https://images.unsplash.com/photo-1536638317175-32449e148ced?w=800",
    author_id: "chuyengia2",
    category_id: 2,
    status: "published",
    view_count: 840,
    like_count: 31,
    comment_count: 8,
    tags: ["Lúa", "Sâu bệnh"],
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: {
      id: "chuyengia2",
      username: "kstruongvanphuc",
      full_name: "KS. Trương Văn Phúc",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Phuc"
    },
    category: {
      id: 2,
      name: "Sâu bệnh",
      slug: "sau-benh"
    }
  }
];

export async function GET(req: NextRequest) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'new';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const is_featured = searchParams.get('is_featured');

  try {
    // Primary: MongoDB Atlas Query
    try {
      await connectMongoDB();

      let mongoQuery: any = { status: 'published' };

      if (is_featured === 'true') {
        mongoQuery.is_featured = true;
      }

      // Category filter by slug
      if (category && category !== 'all') {
        mongoQuery['category.slug'] = category;
      }

      const sortOrder: any =
        sort === 'hot' || sort === 'top'
          ? { is_pinned: -1, view_count: -1 }
          : sort === 'most_comments'
          ? { is_pinned: -1, comment_count: -1 }
          : { is_pinned: -1, created_at: -1 };

      const totalPosts = await Post.countDocuments(mongoQuery);
      const rawPosts = await Post.find(mongoQuery)
        .skip(from)
        .limit(limit)
        .sort(sortOrder)
        .lean();

      if (rawPosts && rawPosts.length > 0) {
        // Resolve author names from users collection
        const userMap = new Map<string, any>();
        try {
          const userIds = Array.from(new Set(rawPosts.map((p: any) => p.author_id).filter(Boolean))) as string[];
          if (userIds.length > 0) {
            const mongoIds = userIds
              .map((id: string) => {
                try { return new mongoose.Types.ObjectId(id); } catch { return null; }
              })
              .filter((id) => id !== null) as mongoose.Types.ObjectId[];
            const users = await mongoose.connection.db!
              .collection('users')
              .find({ _id: { $in: mongoIds } })
              .toArray();
            users.forEach((u: any) => userMap.set(u._id.toString(), u));
          }
        } catch (e) { /* silent */ }

        const posts = rawPosts.map((p: any) => {
          const user = userMap.get(p.author_id) || null;
          
          // Fix corrupted Cloudinary prefix URLs
          let finalThumbnail = p.thumbnail_url || '';
          if (finalThumbnail.includes('res.cloudinary.com/demo/image/fetch')) {
            const parts = finalThumbnail.split('fetch/');
            if (parts.length > 1) {
              const configAndUrl = parts[1];
              const urlIndex = configAndUrl.indexOf('http');
              if (urlIndex !== -1) {
                finalThumbnail = decodeURIComponent(configAndUrl.substring(urlIndex));
              }
            }
          }

          return {
            ...p,
            id: p._id?.toString(),
            thumbnail_url: finalThumbnail,
            author: p.author || (user ? {
              full_name: user.name || user.email || 'Người dùng',
              username: user.email?.split('@')[0] || 'member',
              avatar_url: user.image || '',
            } : { full_name: 'Thành viên TVNN', avatar_url: '' }),
            category: p.category || { name: 'Chưa phân loại', slug: 'uncategorized' },
          };
        });

        return NextResponse.json({
          data: posts,
          error: null,
          meta: {
            page,
            limit,
            total: totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
          },
        }, {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
        });
      }
    } catch (mongoReadErr) {
      console.error('MongoDB query failed, falling back to mock:', mongoReadErr);
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        data: MOCK_POSTS,
        error: null,
        meta: { page, limit, total: MOCK_POSTS.length }
      });
    }

    let query = supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (is_featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (category && category !== 'all') {
      const { data: catData } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
        
      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (sort === 'hot' || sort === 'top') {
      query = query.order('is_pinned', { ascending: false }).order('view_count', { ascending: false });
    } else if (sort === 'most_comments') {
      query = query.order('is_pinned', { ascending: false }).order('comment_count', { ascending: false });
    } else {
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data, count, error } = await query.range(from, to);

    if (error || !data || data.length === 0) {
      // Return mock posts if Supabase returns no posts or errors
      return NextResponse.json({
        data: MOCK_POSTS,
        error: null,
        meta: { page, limit, total: MOCK_POSTS.length }
      });
    }

    // Manual relational joins
    const authorIds = Array.from(new Set(data.map((p: any) => p.author_id).filter(Boolean)));
    const catIds = Array.from(new Set(data.map((p: any) => p.category_id).filter(Boolean)));

    const [profilesRes, categoriesRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, username, full_name, avatar_url').in('id', authorIds),
      supabaseAdmin.from('categories').select('id, name, slug').in('id', catIds),
    ]);

    const profileMap = new Map(profilesRes.data?.map((u: any) => [u.id, u]) || []);
    const categoryMap = new Map(categoriesRes.data?.map((c: any) => [c.id, c]) || []);

    data.forEach((p: any) => {
      p.author = profileMap.get(p.author_id) || { full_name: 'Người dùng', avatar_url: '' };
      p.category = categoryMap.get(p.category_id) || { name: 'Chưa phân loại', slug: 'unknown' };
    });

    // Include user contextual data (likes, bookmarks) safely
    try {
      const session = await auth();
      const currentUserId = (session?.user as any)?.id;

      if (currentUserId && data && data.length > 0) {
        const postIds = data.map((p: any) => p.id);
        const [likes, saves] = await Promise.all([
          supabaseAdmin.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
          supabaseAdmin.from('post_saves').select('post_id').eq('user_id', currentUserId).in('post_id', postIds)
        ]);

        const likedIds = new Set(likes.data?.map((l: any) => l.post_id) || []);
        const savedIds = new Set(saves.data?.map((s: any) => s.post_id) || []);

        data.forEach((p: any) => {
          p.is_liked = likedIds.has(p.id);
          p.is_saved = savedIds.has(p.id);
        });
      }
    } catch (authErr) {
      console.error('NextAuth check failed in /api/posts, continuing without auth data');
    }

    return NextResponse.json({
      data,
      error: null,
      meta: {
        page,
        limit,
        total: count || data.length,
        totalPages: count ? Math.ceil(count / limit) : 1
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });
  } catch (err: any) {
    console.error('Unexpected error in /api/posts route:', err);
    return NextResponse.json({
      data: MOCK_POSTS,
      error: null,
      meta: { page, limit, total: MOCK_POSTS.length }
    });
  }
}

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

  const body = await req.json();
  const { title, content, category_id, excerpt, thumbnail_url, tags } = body;

  const slug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '') + '-' + Date.now();

  const wordCount = content ? content.split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 200) || 1;

  const { data, error } = await supabaseAdmin
    .from('posts')
    .insert([{
      title,
      content,
      category_id,
      excerpt,
      thumbnail_url,
      tags,
      slug,
      author_id: (session.user as any).id,
      status: 'pending',
      read_time: readTime
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message, meta: null }, { status: 500 });
  }

  return NextResponse.json({ data, error: null, meta: { created: true } });
}
