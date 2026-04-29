import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // commentId
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Content must be under 2000 characters' }, { status: 400 });
    }

    // Check if parent comment exists
    const parentComment = await Comment.findOne({ _id: id, isDeleted: false });
    if (!parentComment) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
    }

    const reply = await Comment.create({
      postId: parentComment.postId,
      parentId: id,
      authorId: (session.user as any).id,
      content: content.trim(),
      likes: [],
      isDeleted: false
    });

    let author = {
      id: (session.user as any).id,
      full_name: session.user.name || 'Bạn',
      username: session.user.email?.split('@')[0] || 'member',
      avatar_url: session.user.image || ''
    };

    return NextResponse.json({
      ...reply.toObject(),
      id: reply._id.toString(),
      author
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
