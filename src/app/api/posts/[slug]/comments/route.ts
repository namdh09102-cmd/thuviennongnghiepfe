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
  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    await connectMongoDB();

    // Resolve post
    let post;
    try {
      post = await Post.findOne({
        $or: [{ slug }, { _id: new mongoose.Types.ObjectId(slug) }, { id: slug }]
      }).lean();
    } catch (e) {
      post = await Post.findOne({ slug }).lean();
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const postIdStr = post._id.toString();

    // 1. Get top-level comments
    const topLevelComments = await Comment.find({
      postId: postIdStr,
      parentId: null,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const topCommentIds = topLevelComments.map((c: any) => c._id.toString());

    // 2. Get up to 3 replies for each top-level comment
    const repliesMap = new Map<string, any[]>();
    
    for (const cid of topCommentIds) {
      const replies = await Comment.find({
        parentId: cid,
        isDeleted: false
      })
        .sort({ createdAt: 1 })
        .limit(3)
        .lean();
      repliesMap.set(cid, replies);
    }

    // 3. Collect all authorIds to fetch user details
    const authorIds = new Set<string>();
    topLevelComments.forEach((c: any) => authorIds.add(c.authorId));
    repliesMap.forEach((replies) => {
      replies.forEach((r) => authorIds.add(r.authorId));
    });

    // 4. Fetch user details
    const userMap = new Map<string, any>();
    if (authorIds.size > 0) {
      try {
        const mongoIds = Array.from(authorIds)
          .map(id => {
            try { return new mongoose.Types.ObjectId(id); } catch { return null; }
          })
          .filter(Boolean);

        const users = await mongoose.connection.db!
          .collection('users')
          .find({ _id: { $in: mongoIds as any } })
          .toArray();

        users.forEach((u: any) => {
          userMap.set(u._id.toString(), {
            id: u._id.toString(),
            full_name: u.name || u.email || 'Người dùng',
            username: u.email?.split('@')[0] || 'member',
            avatar_url: u.image || 'https://api.dicebear.com/7.x/avataaars/svg'
          });
        });
      } catch (e) {
        console.error('Failed to fetch users for comments:', e);
      }
    }

    // 5. Map data together
    const mappedComments = topLevelComments.map((c: any) => {
      const cid = c._id.toString();
      const replies = (repliesMap.get(cid) || []).map((r: any) => ({
        ...r,
        id: r._id.toString(),
        author: userMap.get(r.authorId) || { full_name: 'Người dùng', avatar_url: '' }
      }));

      return {
        ...c,
        id: cid,
        author: userMap.get(c.authorId) || { full_name: 'Người dùng', avatar_url: '' },
        replies
      };
    });

    return NextResponse.json({
      data: mappedComments,
      meta: {
        page,
        limit
      }
    });
  } catch (err: any) {
    console.error('GET comments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Content must be under 2000 characters' }, { status: 400 });
    }

    const comment = await Comment.create({
      postId: post._id.toString(),
      parentId: null,
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
      ...comment.toObject(),
      id: comment._id.toString(),
      author,
      replies: []
    });
  } catch (err: any) {
    console.error('POST comment error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
