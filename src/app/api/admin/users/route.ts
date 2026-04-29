import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const from = (page - 1) * limit;

  try {
    await connectMongoDB();
    
    const db = mongoose.connection.db!;
    
    let query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const usersCollection = db.collection('users');
    const count = await usersCollection.countDocuments(query);
    const rawUsers = await usersCollection.find(query)
      .skip(from)
      .limit(limit)
      .toArray();

    const userPostsCount = await Post.aggregate([
      { $group: { _id: "$author_id", count: { $sum: 1 } } }
    ]);
    const postCountMap = new Map(userPostsCount.map((p: any) => [p._id.toString(), p.count]));

    const mappedUsers = rawUsers.map((u: any) => ({
      id: u._id.toString(),
      full_name: u.name || u.email || 'Người dùng',
      username: u.email?.split('@')[0] || 'member',
      email: u.email,
      avatar_url: u.image || '',
      role: u.role || 'user',
      is_verified: u.is_verified || false,
      points: u.points || 0,
      status: u.status || 'active',
      created_at: u.created_at || new Date(),
      posts: [{ count: postCountMap.get(u._id.toString()) || 0 }]
    }));

    return NextResponse.json({ data: mappedUsers, total: count });
  } catch (err: any) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: err.message, data: [], total: 0 });
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
    const { userId, role, is_verified, points, status } = body;

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const updateData: any = {};
    if (role) updateData.role = role;
    if (typeof is_verified === 'boolean') updateData.is_verified = is_verified;
    if (typeof points === 'number') updateData.points = points;
    if (status) updateData.status = status;

    let mongoId = userId;
    try {
      mongoId = new mongoose.Types.ObjectId(userId);
    } catch (e) {}

    await mongoose.connection.db!.collection('users').updateOne(
      { _id: mongoId },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin users PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
