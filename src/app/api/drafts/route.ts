import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Post from '@/models/Post';
import { auth } from '@/auth';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limiter = rateLimit(ip);
  
  if (!limiter.success) {
    return NextResponse.json(
      { data: null, error: 'Too Many Requests', meta: null },
      { status: 429 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
  }

  const userId = (session.user as any).id || (session.user as any)._id?.toString();
  const body = await req.json();
  const { title, content, category_id, excerpt, thumbnail_url, tags } = body;

  try {
    await connectMongoDB();
    
    // Check if user already has a draft
    let draft = await Post.findOne({ author_id: userId, status: 'draft' });

    const slug = (title ? title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : 'bai-nhap') + '-' + Date.now();

    if (draft) {
      draft.title = title || 'Bài viết nháp';
      draft.content = content || '';
      draft.category_id = category_id || null;
      draft.excerpt = excerpt || '';
      draft.thumbnail_url = thumbnail_url || '';
      draft.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
      draft.updated_at = new Date();
      await draft.save();
      
      return NextResponse.json({ data: draft, error: null, meta: { updated: true } });
    } else {
      draft = await Post.create({
        title: title || 'Bài viết nháp',
        content: content || '',
        category_id: category_id || null,
        excerpt: excerpt || '',
        thumbnail_url: thumbnail_url || '',
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        slug,
        author_id: userId,
        status: 'draft',
        likes: [],
        saves: [],
        viewCount: 0,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        is_featured: false,
        is_pinned: false,
      });

      return NextResponse.json({ data: draft, error: null, meta: { created: true } });
    }
  } catch (err: any) {
    console.error('[POST /api/drafts] Error:', err);
    return NextResponse.json({ data: null, error: err.message, meta: null }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ data: null, error: 'Unauthorized', meta: null }, { status: 401 });
  }

  const userId = (session.user as any).id || (session.user as any)._id?.toString();

  try {
    await connectMongoDB();
    const draft = await Post.findOne({ author_id: userId, status: 'draft' })
      .sort({ updated_at: -1 })
      .lean();

    if (!draft) {
      return NextResponse.json({ data: null, error: null, meta: { draftFound: false } });
    }

    return NextResponse.json({ data: { ...draft, id: (draft as any)._id.toString() }, error: null, meta: { draftFound: true } });
  } catch (err: any) {
    console.error('[GET /api/drafts] Error:', err);
    return NextResponse.json({ data: null, error: err.message, meta: null }, { status: 500 });
  }
}
