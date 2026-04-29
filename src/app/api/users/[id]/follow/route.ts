import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;
  const targetUserId = params.id; // could be username or ObjectId

  if (currentUserId === targetUserId) {
    return NextResponse.json({ error: 'Không thể tự theo dõi mình' }, { status: 400 });
  }

  try {
    await connectMongoDB();
    const db = mongoose.connection.db!;

    // Resolve target user
    let targetUser: any = null;
    if (mongoose.isValidObjectId(targetUserId)) {
      targetUser = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(targetUserId) });
    }
    if (!targetUser) {
      targetUser = await db.collection('users').findOne({ username: targetUserId });
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetId = targetUser._id.toString();
    const targetFollowers: string[] = targetUser.followers || [];
    const isFollowing = targetFollowers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await db.collection('users').updateOne(
        { _id: targetUser._id },
        { $pull: { followers: currentUserId } as any }
      );
      await db.collection('users').updateOne(
        { _id: mongoose.isValidObjectId(currentUserId) ? new mongoose.Types.ObjectId(currentUserId) : currentUserId },
        { $pull: { following: targetId } as any }
      );

      const updated = await db.collection('users').findOne({ _id: targetUser._id });
      return NextResponse.json({
        isFollowing: false,
        followersCount: (updated?.followers || []).length,
      });
    } else {
      // Follow
      await db.collection('users').updateOne(
        { _id: targetUser._id },
        { $addToSet: { followers: currentUserId } }
      );
      await db.collection('users').updateOne(
        { _id: mongoose.isValidObjectId(currentUserId) ? new mongoose.Types.ObjectId(currentUserId) : currentUserId },
        { $addToSet: { following: targetId } }
      );

      // Create notification (best-effort)
      try {
        const currentUser = await db.collection('users').findOne({
          _id: mongoose.isValidObjectId(currentUserId) ? new mongoose.Types.ObjectId(currentUserId) : currentUserId
        });
        await db.collection('notifications').insertOne({
          user_id: targetId,
          type: 'new_follower',
          actor_id: currentUserId,
          actor_name: currentUser?.name || 'Ai đó',
          message: `${currentUser?.name || 'Ai đó'} đã bắt đầu theo dõi bạn.`,
          read: false,
          created_at: new Date(),
        });
      } catch (e) { /* Notifications are best-effort */ }

      const updated = await db.collection('users').findOne({ _id: targetUser._id });
      return NextResponse.json({
        isFollowing: true,
        followersCount: (updated?.followers || []).length,
      });
    }
  } catch (err: any) {
    console.error('POST /api/users/[id]/follow error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
