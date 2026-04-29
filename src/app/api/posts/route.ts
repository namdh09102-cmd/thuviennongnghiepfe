import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

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
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search');
  
  const skip = (page - 1) * limit;

  try {
    await connectMongoDB();

    let mongoQuery: any = { status: 'published' };

    // Category filter
    if (category && category !== 'all') {
      mongoQuery['category.slug'] = category;
    }

    // Search filter
    if (search) {
      mongoQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOrder: any =
      sort === 'hot' || sort === 'top'
        ? { is_pinned: -1, view_count: -1 }
        : sort === 'most_comments'
        ? { is_pinned: -1, comment_count: -1 }
        : { is_pinned: -1, created_at: -1 };

    const totalPosts = await Post.countDocuments(mongoQuery);
    const rawPosts = await Post.find(mongoQuery)
      .skip(skip)
      .limit(limit)
      .sort(sortOrder)
      .lean();

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
    } catch (e) { 
      console.error('Author resolution failed:', e); 
    }

    const posts = rawPosts.map((p: any) => {
      const user = userMap.get(p.author_id) || null;
      return {
        ...p,
        id: p._id?.toString(),
        author: p.author || (user ? {
          full_name: user.name || user.email || 'Người dùng',
          username: user.email?.split('@')[0] || 'member',
          avatar_url: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        } : { full_name: 'Chuyên Gia Nông Nghiệp', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert' }),
        category: p.category || { name: 'Chưa phân loại', slug: 'uncategorized' },
      };
    });

    return NextResponse.json({
      data: posts,
      page,
      limit,
      total: totalPosts,
      hasMore: page * limit < totalPosts,
      error: null,
      meta: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (err: any) {
    console.error('Error in /api/posts:', err);
    return NextResponse.json({ data: [], error: err.message || 'Lỗi hệ thống', meta: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category, excerpt, thumbnail_url, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Tiêu đề và nội dung là bắt buộc' }, { status: 400 });
    }

    await connectMongoDB();

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9_-]+)/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();

    const wordCount = content ? content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
    const readTime = Math.ceil(wordCount / 200) || 1;

    const newPost = await Post.create({
      title,
      content,
      category: category || { name: 'Chưa phân loại', slug: 'uncategorized' },
      excerpt: excerpt || content.replace(/<[^>]*>/g, '').slice(0, 150),
      thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
      tags: tags || [],
      slug,
      author_id: (session.user as any).id || session.user.email,
      status: 'approved', // Auto-approve for MVP, or set to 'pending' if moderation needed
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      published_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({ success: true, data: newPost });
  } catch (err: any) {
    console.error('Error creating post:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
