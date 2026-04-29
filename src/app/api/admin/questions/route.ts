import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { jwtVerify } from 'jose';
import mongoose from 'mongoose';

async function checkAdminAuth(req: NextRequest) {
  const adminToken = req.cookies.get('admin_token')?.value;
  if (!adminToken) return false;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
    const { payload } = await jwtVerify(adminToken, secret);
    return payload.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
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
    console.error('Admin questions GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
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
  const isAuth = await checkAdminAuth(req);
  if (!isAuth) {
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
