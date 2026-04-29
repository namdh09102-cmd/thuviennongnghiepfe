import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { auth } from '@/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const questions = await Question.find({})
      .sort({ created_at: -1 })
      .lean();

    const userMap = new Map();
    try {
      const rawUsers = await mongoose.connection.db!.collection('users').find({}).toArray();
      rawUsers.forEach((u: any) => userMap.set(u._id.toString(), u));
    } catch (e) {
      console.error('Failed to fetch users for admin questions:', e);
    }

    const mappedQuestions = questions.map((q: any) => {
      const author = userMap.get(q.user_id) || { name: 'Người dùng', image: '' };
      return {
        ...q,
        id: q._id.toString(),
        author: {
          full_name: author.name || author.email || 'Người dùng',
          avatar_url: author.image || ''
        }
      };
    });

    return NextResponse.json(mappedQuestions);
  } catch (err: any) {
    console.error('Admin questions GET error, falling back to mock data:', err);
    const mockQuestions = [
      {
        id: 'mock-q1',
        title: 'Cây bưởi bị vàng lá thối rễ, xin chuyên gia hướng dẫn cách chữa?',
        content: 'Vườn bưởi nhà tôi 3 năm tuổi có hiện tượng vàng lá cả cây, đào rễ thấy bị đen thối.',
        is_solved: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3),
        author: { full_name: 'Trần Văn A' },
        category: { name: 'Trồng trọt' }
      },
      {
        id: 'mock-q2',
        title: 'Lượng phân bón lót cho 1 ha lúa Hè Thu là bao nhiêu?',
        content: 'Tôi chuẩn bị xuống giống lúa Hè Thu, vùng đất phèn nhẹ.',
        is_solved: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
        author: { full_name: 'Lê Văn B' },
        category: { name: 'Phân bón' }
      }
    ];
    return NextResponse.json(mockQuestions);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const body = await req.json();
    const { id, status, is_solved } = body;

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    let mongoId: any = id;
    try {
      mongoId = new mongoose.Types.ObjectId(id);
    } catch (e) {}

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof is_solved === 'boolean') updateData.status = is_solved ? 'solved' : 'pending';

    const question = await Question.findOneAndUpdate(
      { $or: [{ _id: mongoId }, { id: id }] },
      updateData,
      { new: true }
    );

    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    return NextResponse.json(question);
  } catch (err: any) {
    console.error('Admin questions PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    let mongoId: any = id;
    try {
      mongoId = new mongoose.Types.ObjectId(id);
    } catch (e) {}

    await Question.deleteOne({ 
      $or: [{ _id: mongoId }, { id: id }] 
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin questions DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
