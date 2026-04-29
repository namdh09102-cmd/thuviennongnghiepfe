import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // 'open' | 'answered' | 'closed'
  const tag = searchParams.get('tag');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  
  const skip = (page - 1) * limit;

  try {
    await connectMongoDB();
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (tag) {
      query.tags = tag;
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const userMap = new Map();
    try {
      const userIds = questions.map((q: any) => q.authorId).filter(Boolean);
      if (userIds.length > 0) {
        const mongoIds = userIds
          .map((id: string) => {
            try { return new mongoose.Types.ObjectId(id); } catch { return null; }
          })
          .filter(Boolean) as mongoose.Types.ObjectId[];

        const rawUsers = await mongoose.connection.db!
          .collection('users')
          .find({ 
            $or: [
              { _id: { $in: mongoIds } },
              { id: { $in: userIds } }
            ]
          })
          .toArray();

        rawUsers.forEach((u: any) => {
          userMap.set(u._id.toString(), u);
          if (u.id) userMap.set(u.id, u);
        });
      }
    } catch (e) {
      console.error('Failed to fetch users for questions:', e);
    }

    const mappedQuestions = questions.map((q: any) => {
      const author = userMap.get(q.authorId?.toString()) || userMap.get(q.authorId) || { name: 'Người dùng', image: '' };
      
      return {
        ...q,
        id: q._id.toString(),
        author: {
          full_name: author.name || author.full_name || author.email || 'Người dùng',
          username: author.username || author.email?.split('@')[0] || 'member',
          avatar_url: author.avatar || author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${q.authorId}`
        }
      };
    });

    return NextResponse.json({
      data: mappedQuestions,
      page,
      limit,
      total,
      hasMore: page * limit < total
    });
  } catch (err: any) {
    console.error('Questions GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, content, tags } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 });
  }

  try {
    await connectMongoDB();
    const authorId = (session.user as any).id || (session.user as any)._id?.toString();
    
    const question = await Question.create({
      title: title.slice(0, 200),
      content,
      authorId,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      status: 'open',
      viewCount: 0,
      answerCount: 0,
      upvotes: [],
      acceptedAnswerId: null
    });

    return NextResponse.json(question);
  } catch (err: any) {
    console.error('Questions POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
