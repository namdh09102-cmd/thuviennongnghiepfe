import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectMongoDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const body = await req.json();
    const { name, slug, icon, color, parent_id, sort_order } = body;

    const category = await Category.create({ 
      name, 
      slug: slug || name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''), 
      sort_order: sort_order || 0 
    });

    return NextResponse.json(category);
  } catch (err: any) {
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
    const { id, ...updates } = body;

    let mongoId: any = id;
    try {
      mongoId = new mongoose.Types.ObjectId(id);
    } catch (e) {}

    const category = await Category.findOneAndUpdate(
      { $or: [{ _id: mongoId }, { id: id }, { slug: id }] },
      updates,
      { new: true }
    );

    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json(category);
  } catch (err: any) {
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
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'No ID provided' }, { status: 400 });

    // Check if posts are using this category
    const usageCount = await Post.countDocuments({ category_id: id });
    if (usageCount > 0) {
      return NextResponse.json({ error: 'Danh mục này đang có bài viết sử dụng, không thể xóa.' }, { status: 400 });
    }

    let mongoId: any = id;
    try {
      mongoId = new mongoose.Types.ObjectId(id);
    } catch (e) {}

    await Category.deleteOne({ 
      $or: [{ _id: mongoId }, { id: id }, { slug: id }] 
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
