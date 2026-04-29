import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

// In-memory cache for view limiting: key is `${postId}_${ip}`
const viewCache = new Map<string, number>();

function getIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const ip = getIP(req);

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

    const postIdStr = post._id.toString();
    const cacheKey = `${postIdStr}_${ip}`;
    const now = Date.now();
    const lastViewTime = viewCache.get(cacheKey);

    // Rate limit: 1 view per user/IP per 1 hour (3600000 ms)
    if (!lastViewTime || (now - lastViewTime > 3600000)) {
      post.viewCount = (post.viewCount || 0) + 1;
      post.view_count = (post.view_count || 0) + 1;
      await post.save();
      viewCache.set(cacheKey, now);
    }

    return NextResponse.json({
      success: true,
      viewCount: post.viewCount || post.view_count
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
