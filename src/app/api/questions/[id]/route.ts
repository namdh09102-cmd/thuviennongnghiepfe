import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    
    // Increment view count atomically
    const question = await Question.findOneAndUpdate(
      { _id: params.id },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Fetch answers for this question
    const answers = await Answer.find({ questionId: params.id })
      .sort({ isAccepted: -1, createdAt: 1 })
      .lean();

    // Resolve user profiles for both author and answerers
    const userIds = new Set<string>();
    if (question.authorId) userIds.add(question.authorId.toString());
    answers.forEach((a: any) => {
      if (a.authorId) userIds.add(a.authorId.toString());
    });

    const userMap = new Map();
    if (userIds.size > 0) {
      try {
        const mongoIds = Array.from(userIds)
          .map((id: string) => {
            try { return new mongoose.Types.ObjectId(id); } catch { return null; }
          })
          .filter(Boolean) as mongoose.Types.ObjectId[];

        const rawUsers = await mongoose.connection.db!
          .collection('users')
          .find({
            $or: [
              { _id: { $in: mongoIds } },
              { id: { $in: Array.from(userIds) } }
            ]
          })
          .toArray();

        rawUsers.forEach((u: any) => {
          userMap.set(u._id.toString(), u);
          if (u.id) userMap.set(u.id, u);
        });
      } catch (e) {
        console.error('Failed to resolve profiles in individual question:', e);
      }
    }

    const authorProfile = userMap.get(question.authorId?.toString()) || userMap.get(question.authorId) || { name: 'Người dùng' };
    const mappedQuestion = {
      ...question,
      id: question._id.toString(),
      author: {
        full_name: authorProfile.name || authorProfile.full_name || authorProfile.email || 'Người dùng',
        username: authorProfile.username || authorProfile.email?.split('@')[0] || 'member',
        avatar_url: authorProfile.avatar || authorProfile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${question.authorId}`,
        is_verified: authorProfile.is_verified || authorProfile.isVerified || false
      }
    };

    const mappedAnswers = answers.map((a: any) => {
      const ansAuthor = userMap.get(a.authorId?.toString()) || userMap.get(a.authorId) || { name: 'Người dùng' };
      return {
        ...a,
        id: a._id.toString(),
        author: {
          full_name: ansAuthor.name || ansAuthor.full_name || ansAuthor.email || 'Người dùng',
          username: ansAuthor.username || ansAuthor.email?.split('@')[0] || 'member',
          avatar_url: ansAuthor.avatar || ansAuthor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.authorId}`,
          is_verified: ansAuthor.is_verified || ansAuthor.isVerified || false,
          role: ansAuthor.role || 'user'
        }
      };
    });

    return NextResponse.json({
      ...mappedQuestion,
      answers: mappedAnswers
    });
  } catch (err: any) {
    console.error('Individual Question GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
