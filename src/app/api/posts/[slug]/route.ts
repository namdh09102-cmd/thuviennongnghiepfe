import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import mongoose from 'mongoose';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectMongoDB();

    const post = await Post.findOne({ slug: params.slug }).lean();

    if (!post) {
      return NextResponse.json(
        { data: null, error: 'Post not found', meta: null },
        { status: 404 }
      );
    }

    const postObj: any = { ...post, id: (post as any)._id?.toString() };

    // Resolve author from NextAuth users collection
    try {
      if (postObj.author_id) {
        const user = await mongoose.connection.db!
          .collection('users')
          .findOne({ _id: new mongoose.Types.ObjectId(postObj.author_id) });
        if (user) {
          postObj.author = {
            full_name: user.name || user.email || 'Người dùng',
            username: user.email?.split('@')[0] || 'member',
            avatar_url: user.image || '',
            bio: user.bio || '',
            role: user.role || 'Thành viên',
            is_verified: user.is_verified || false,
            points: user.points || 0,
          };
        }
      }
    } catch (e) {
      console.error('Author lookup failed:', e);
    }

    // Resolve category
    try {
      if (postObj.category_id && !postObj.author?.full_name) {
        // category_id may be a string slug or ObjectId
        const cat = await Category.findOne({
          $or: [
            { slug: postObj.category_id },
            ...(mongoose.isValidObjectId(postObj.category_id)
              ? [{ _id: new mongoose.Types.ObjectId(postObj.category_id) }]
              : []),
          ],
        }).lean();
        if (cat) {
          postObj.category = { name: (cat as any).name, slug: (cat as any).slug };
        }
      }
    } catch (e) {
      console.error('Category lookup failed:', e);
    }

    // Fix corrupted Cloudinary prefix URLs
    if (postObj.thumbnail_url && postObj.thumbnail_url.includes('res.cloudinary.com/demo/image/fetch')) {
      const parts = postObj.thumbnail_url.split('fetch/');
      if (parts.length > 1) {
        const configAndUrl = parts[1];
        const urlIndex = configAndUrl.indexOf('http');
        if (urlIndex !== -1) {
          postObj.thumbnail_url = decodeURIComponent(configAndUrl.substring(urlIndex));
        }
      }
    }

    return NextResponse.json(
      { data: postObj, error: null, meta: { slug: params.slug } },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=600' },
      }
    );
  } catch (err: any) {
    console.error('[GET /api/posts/slug] Error:', err);
    return NextResponse.json(
      { data: null, error: err.message, meta: null },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    await connectMongoDB();

    const post = await Post.findOne({ slug: params.slug });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (post.author_id !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    Object.assign(post, { ...body, updated_at: new Date() });
    await post.save();

    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  try {
    await connectMongoDB();

    const post = await Post.findOne({ slug: params.slug });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (post.author_id !== userId && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await post.deleteOne();

    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
