import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectMongoDB();
    const authorId = (session.user as any).id || (session.user as any)._id?.toString();

    const question = await Question.findById(params.id);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Toggle upvote
    const hasUpvoted = question.upvotes.includes(authorId);
    if (hasUpvoted) {
      question.upvotes = question.upvotes.filter((id: string) => id !== authorId);
    } else {
      question.upvotes.push(authorId);
    }

    await question.save();

    return NextResponse.json({ 
      upvoted: !hasUpvoted, 
      upvotesCount: question.upvotes.length 
    });
  } catch (err: any) {
    console.error('Question upvote error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
