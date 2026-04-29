import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { auth } from '@/auth';

const USERNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const usernameUpdateCache = new Map<string, number>(); // userId -> lastUpdateTimestamp

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;

  try {
    await connectMongoDB();
    const db = mongoose.connection.db!;

    let user: any = null;
    if (mongoose.isValidObjectId(currentUserId)) {
      user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(currentUserId) });
    }
    if (!user) {
      user = await db.collection('users').findOne({ id: currentUserId });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      full_name: user.name || user.full_name || '',
      username: user.username || '',
      bio: user.bio || '',
      avatar_url: user.avatar || user.image || '',
      region: user.region || user.location || '',
      location: user.region || user.location || '',
      main_crops: user.main_crops || [],
      expertise: user.expertise || user.main_crops || [],
      role: user.role || 'user',
      isVerified: user.isVerified || user.is_verified || false,
      points: user.points || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;
  const body = await req.json();
  const { full_name, username, bio, region, location, main_crops, expertise, avatar_url } = body;

  try {
    await connectMongoDB();
    const db = mongoose.connection.db!;

    // Resolve user
    let userFilter: any = {};
    if (mongoose.isValidObjectId(currentUserId)) {
      userFilter = { _id: new mongoose.Types.ObjectId(currentUserId) };
    } else {
      userFilter = { id: currentUserId };
    }

    const currentUser = await db.collection('users').findOne(userFilter);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Username cooldown check (30-day rule)
    if (username && username !== currentUser.username) {
      const lastUpdate = usernameUpdateCache.get(currentUserId);
      const now = Date.now();
      if (lastUpdate && (now - lastUpdate) < USERNAME_COOLDOWN_MS) {
        const daysLeft = Math.ceil((USERNAME_COOLDOWN_MS - (now - lastUpdate)) / (24 * 60 * 60 * 1000));
        return NextResponse.json(
          { error: `Bạn chỉ có thể đổi username 1 lần mỗi 30 ngày. Còn ${daysLeft} ngày.` },
          { status: 400 }
        );
      }

      // Check username uniqueness
      const existingUser = await db.collection('users').findOne({
        username,
        _id: { $ne: currentUser._id }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Username đã được sử dụng' }, { status: 400 });
      }

      usernameUpdateCache.set(currentUserId, Date.now());
    }

    const updateData: any = { updated_at: new Date() };
    if (full_name !== undefined) updateData.name = full_name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio.slice(0, 200);
    if (region !== undefined) updateData.region = region;
    if (location !== undefined) updateData.location = location;
    if (main_crops !== undefined) updateData.main_crops = main_crops;
    if (expertise !== undefined) updateData.expertise = expertise;
    if (avatar_url !== undefined) updateData.avatar = avatar_url;

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
      expertise: updated?.expertise || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
