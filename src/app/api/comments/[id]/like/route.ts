import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const comment = await Comment.findOne({ _id: id, isDeleted: false });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const likesArray = comment.likes || [];

    const isLiked = likesArray.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likes = likesArray.filter((uid: string) => uid !== userId);
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likeCount: comment.likes.length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
