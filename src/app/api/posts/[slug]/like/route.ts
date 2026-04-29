import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { slug } = params;

  try {
    await connectMongoDB();

    let post;
    try {
      post = await Post.findOne({
        $or: [{ slug }, { _id: new mongoose.Types.ObjectId(slug) }, { id: slug }]
      });
    } catch (e) {
      post = await Post.findOne({ slug });
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const likesArray = post.likes || [];
    const isLiked = likesArray.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = likesArray.filter((uid: string) => uid !== userId);
      post.like_count = Math.max(0, (post.like_count || 0) - 1);
    } else {
      // Like
      post.likes.push(userId);
      post.like_count = (post.like_count || 0) + 1;
    }

    await post.save();

    return NextResponse.json({
      liked: !isLiked,
      count: post.like_count
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
