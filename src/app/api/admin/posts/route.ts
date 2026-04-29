import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;

  try {
    await connectMongoDB();
    
    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const count = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .skip(from)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean();

    const categories = await Category.find({}).lean();
    const categoryMap = new Map(categories.map((c: any) => [c._id.toString(), c]));
    categories.forEach((c: any) => categoryMap.set(c.slug, c));

    const userMap = new Map();
    try {
      const rawUsers = await mongoose.connection.db!.collection('users').find({}).toArray();
      rawUsers.forEach((u: any) => userMap.set(u._id.toString(), u));
    } catch (e) {
      console.error('Failed to fetch users from raw MongoDB:', e);
    }

    const mappedPosts = posts.map((p: any) => {
      const author = userMap.get(p.author_id) || { name: 'Người dùng', image: '' };
      const category = categoryMap.get(p.category_id) || { name: 'Chưa phân loại' };
      return {
        ...p,
        id: p._id.toString(),
        author: {
          full_name: author.name || author.email || 'Người dùng',
          username: author.email?.split('@')[0] || 'member'
        },
        category: {
          name: category.name || 'Chưa phân loại'
        }
      };
    });

    return NextResponse.json({ data: mappedPosts, total: count });
  } catch (err: any) {
    console.error('Admin posts GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const body = await req.json();
    const { ids, status, is_featured, is_pinned } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'published') updateData.published_at = new Date();
    }
    if (typeof is_featured === 'boolean') updateData.is_featured = is_featured;
    if (typeof is_pinned === 'boolean') updateData.is_pinned = is_pinned;
    if (body.rejectedReason) updateData.rejectedReason = body.rejectedReason;

    const mongoIds = ids.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        return id;
      }
    });

    await Post.updateMany(
      { $or: [{ _id: { $in: mongoIds } }, { id: { $in: ids } }, { slug: { $in: ids } }] }, 
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin posts PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids')?.split(',');

    if (!ids) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });

    const mongoIds = ids.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        return id;
      }
    });

    await Post.deleteMany({ 
      $or: [{ _id: { $in: mongoIds } }, { id: { $in: ids } }, { slug: { $in: ids } }] 
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin posts DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
