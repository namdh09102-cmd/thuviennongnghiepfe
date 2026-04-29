import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUserId = (session.user as any).id;

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

    const user = await db.collection('users').findOne(userFilter);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check last checkin
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const lastCheckin = user.last_checkin;
    if (lastCheckin) {
      const lastCheckinStr = new Date(lastCheckin).toISOString().split('T')[0];
      if (todayStr === lastCheckinStr) {
        return NextResponse.json({ error: 'Hôm nay bạn đã điểm danh rồi!' }, { status: 400 });
      }
    }

    // Update points and last_checkin
    const newPoints = (user.points || 0) + 1;
    
    await db.collection('users').updateOne(userFilter, {
      $set: { 
        points: newPoints,
        last_checkin: now
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Điểm danh thành công! +1 điểm uy tín.',
      points: newPoints 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
