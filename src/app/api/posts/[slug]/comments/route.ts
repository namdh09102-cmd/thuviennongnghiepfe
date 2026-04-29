import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const { slug } = params;

  try {
    await connectMongoDB();

    let post;
    try {
      post = await Post.findOne({
        $or: [{ slug }, { _id: new mongoose.Types.ObjectId(slug) }, { id: slug }]
      }).lean();
    } catch (e) {
      post = await Post.findOne({ slug }).lean();
    }

    if (!post) {
      return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });
    }

    const comments = await Comment.find({
      post_id: post._id.toString(),
      is_hidden: false
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    const userMap = new Map();
    try {
      const rawUsers = await mongoose.connection.db!.collection('users').find({}).toArray();
      rawUsers.forEach((u: any) => userMap.set(u._id.toString(), u));
    } catch (e) {
      console.error('Failed to fetch users for comments:', e);
    }

    const mappedComments = comments.map((c: any) => {
      const author = userMap.get(c.user_id) || { name: 'Người dùng', image: '' };
      return {
        ...c,
        id: c._id.toString(),
        author: {
          full_name: author.name || author.email || 'Người dùng',
          avatar_url: author.image || '',
          username: author.email?.split('@')[0] || 'member'
        }
      };
    });

    return NextResponse.json({ data: mappedComments, error: null, meta: { limit } });
  } catch (err: any) {
    console.error('Comments GET error:', err);
    return NextResponse.json({ data: null, error: err.message, meta: null }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
  }

  const userId = (session.user as any).id || (session.user as any)._id?.toString();
  const { slug } = params;

  const body = await req.json();
  const { content, parent_id } = body;

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ data: null, error: 'Invalid content', meta: null }, { status: 400 });
  }

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
      return NextResponse.json({ data: null, error: 'Post not found', meta: null }, { status: 404 });
    }

    const cleanContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const comment = await Comment.create({
      post_id: post._id.toString(),
      user_id: userId,
      parent_id: parent_id || null,
      content: cleanContent
    });

    post.comment_count = (post.comment_count || 0) + 1;
    await post.save();

    const userMap = new Map();
    try {
      const rawUsers = await mongoose.connection.db!.collection('users').find({}).toArray();
      rawUsers.forEach((u: any) => userMap.set(u._id.toString(), u));
    } catch (e) {}

    const author = userMap.get(userId) || { name: 'Người dùng', image: '' };

    const responseComment = {
      ...comment.toObject(),
      id: comment._id.toString(),
      author: {
        full_name: author.name || author.email || 'Người dùng',
        avatar_url: author.image || '',
        username: author.email?.split('@')[0] || 'member'
      }
    };

    return NextResponse.json({ data: responseComment, error: null, meta: { created: true } });
  } catch (err: any) {
    console.error('Comments POST error:', err);
    return NextResponse.json({ data: null, error: err.message, meta: null }, { status: 500 });
  }
}
