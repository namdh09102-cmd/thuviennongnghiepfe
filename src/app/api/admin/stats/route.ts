import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Question from '@/models/Question';
import Comment from '@/models/Comment';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    const startDate = days[0];

    const usersCollection = mongoose.connection.db!.collection('users');

    const [
      userCount,
      postCount,
      pendingPostsCount,
      commentCount,
      pendingPosts,
      hotPosts,
      recentUsers,
      recentPosts,
      recentComments
    ] = await Promise.all([
      usersCollection.countDocuments({}),
      Post.countDocuments({}),
      Post.countDocuments({ status: 'pending' }),
      Comment.countDocuments({}),
      Post.find({ status: 'pending' }).limit(10).lean(),
      Post.find({ status: 'published' }).sort({ view_count: -1 }).limit(5).lean(),
      usersCollection.find({ created_at: { $gte: startDate } }).toArray(),
      Post.find({ created_at: { $gte: startDate } }).lean(),
      Comment.find({ created_at: { $gte: startDate } }).lean()
    ]);

    const dauData = days.map((d, index) => {
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      
      const dStart = d.getTime();
      const dEnd = nextD.getTime();
      
      const newUsers = recentUsers?.filter((u: any) => { const t = new Date(u.created_at).getTime(); return t >= dStart && t < dEnd; }).length || 0;
      const newPosts = recentPosts?.filter((p: any) => { const t = new Date(p.created_at).getTime(); return t >= dStart && t < dEnd; }).length || 0;
      const newComments = recentComments?.filter((c: any) => { const t = new Date(c.created_at).getTime(); return t >= dStart && t < dEnd; }).length || 0;
      
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      
      return {
        day: index === 6 ? 'Hôm nay' : dayNames[d.getDay()],
        'User mới': newUsers,
        'Bài mới': newPosts,
        'Comment mới': newComments
      };
    });

    const mappedPendingPosts = pendingPosts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      status: p.status,
      author_id: p.author_id
    }));

    const mappedHotPosts = hotPosts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      view_count: p.view_count || 0,
      slug: p.slug
    }));

    return NextResponse.json({
      stats: {
        users: userCount || 0,
        posts: postCount || 0,
        comments: commentCount || 0,
        questions: pendingPostsCount || 0
      },
      pendingPosts: mappedPendingPosts,
      hotPosts: mappedHotPosts,
      dauData
    });
  } catch (err: any) {
    console.error('Admin stats GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
