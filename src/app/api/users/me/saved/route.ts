import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    await connectMongoDB();

    const savedPosts = await Post.find({ saves: userId })
      .select('title slug excerpt thumbnail_url category_id author_id viewCount view_count like_count created_at saves likes')
      .sort({ created_at: -1 })
      .lean();

    const formattedPosts = savedPosts.map((post: any) => ({
      ...post,
      id: post._id.toString(),
      _id: post._id.toString(),
    }));

    return NextResponse.json({
      data: formattedPosts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
