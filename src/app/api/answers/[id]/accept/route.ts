import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import { auth } from '@/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectMongoDB();
    const authorId = (session.user as any).id || (session.user as any)._id?.toString();

    // Find the answer
    const answer = await Answer.findById(params.id);
    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Find the question
    const question = await Question.findById(answer.questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Only question author can accept an answer
    if (question.authorId.toString() !== authorId) {
      return NextResponse.json({ error: 'Forbidden. Only question owner can accept answers.' }, { status: 403 });
    }

    // Reset previously accepted answers for this question
    await Answer.updateMany(
      { questionId: answer.questionId, isAccepted: true },
      { $set: { isAccepted: false } }
    );

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update question status & acceptedId
    question.status = 'answered';
    question.acceptedAnswerId = answer._id;
    await question.save();

    return NextResponse.json({ message: 'Answer accepted successfully', answer });
  } catch (err: any) {
    console.error('Answer accept error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
