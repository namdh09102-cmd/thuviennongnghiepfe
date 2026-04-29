import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';

async function getCurrentUser(userId: string) {
  await connectMongoDB();
  const db = mongoose.connection.db!;
  if (mongoose.isValidObjectId(userId)) {
    return db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
  }
  return db.collection('users').findOne({ id: userId });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const user = await getCurrentUser(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      id: user._id.toString(),
      full_name: user.name || user.full_name || '',
      username: user.username || '',
      email: user.email,
      bio: user.bio || '',
      region: user.region || user.location || '',
      main_crops: user.main_crops || [],
      expertise: user.expertise || [],
      avatar_url: user.avatar || user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      role: user.role || 'user',
      isVerified: user.isVerified || user.is_verified || false,
      points: user.points || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { full_name, avatar_url, bio, region, main_crops, expertise, username } = body;

  try {
    await connectMongoDB();
    const db = mongoose.connection.db!;
    const userFilter = mongoose.isValidObjectId(userId)
      ? { _id: new mongoose.Types.ObjectId(userId) }
      : { id: userId };

    const updateData: any = { updated_at: new Date() };
    if (full_name !== undefined) updateData.name = full_name;
    if (avatar_url !== undefined) updateData.avatar = avatar_url;
    if (bio !== undefined) updateData.bio = bio;
    if (region !== undefined) updateData.region = region;
    if (main_crops !== undefined) updateData.main_crops = main_crops;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (username !== undefined) updateData.username = username;

    await db.collection('users').updateOne(userFilter, { $set: updateData });
    const updated = await db.collection('users').findOne(userFilter);

    return NextResponse.json({
      id: updated?._id.toString(),
      full_name: updated?.name,
      username: updated?.username,
      bio: updated?.bio,
      region: updated?.region,
      avatar_url: updated?.avatar || updated?.image,
      main_crops: updated?.main_crops || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
