import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  
  const from = (page - 1) * limit;

  try {
    await connectMongoDB();
    
    let query: any = {};
    if (status) {
      query.status = status;
    }

    const count = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .skip(from)
      .limit(limit)
      .sort({ created_at: -1 })
      .lean();

    const userMap = new Map();
    try {
      const rawUsers = await mongoose.connection.db!.collection('users').find({}).toArray();
      rawUsers.forEach((u: any) => userMap.set(u._id.toString(), u));
    } catch (e) {
      console.error('Failed to fetch users from raw MongoDB:', e);
    }

    const mappedQuestions = questions.map((q: any) => {
      const author = userMap.get(q.user_id) || { name: 'Người dùng', image: '' };
      
      const answers = Array.isArray(q.answers) ? q.answers.map((a: any) => {
        const answerAuthor = userMap.get(a.user_id) || { name: 'Người dùng', image: '' };
        return {
          ...a,
          id: a._id?.toString() || a.id,
          author: {
            full_name: answerAuthor.name || answerAuthor.email || 'Người dùng',
            username: answerAuthor.email?.split('@')[0] || 'member',
            avatar_url: answerAuthor.image || ''
          }
        };
      }) : [];

      return {
        ...q,
        id: q._id.toString(),
        author: {
          full_name: author.name || author.email || 'Người dùng',
          username: author.email?.split('@')[0] || 'member',
          avatar_url: author.image || ''
        },
        answers
      };
    });

    return NextResponse.json({
      data: mappedQuestions,
      pagination: { total: count, page, limit }
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

  try {
    await connectMongoDB();
    const question = await Question.create({
      title,
      content,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      user_id: (session.user as any).id || (session.user as any)._id?.toString(),
      status: 'pending'
    });

    return NextResponse.json(question);
  } catch (err: any) {
    console.error('Questions POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
