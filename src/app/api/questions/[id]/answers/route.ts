import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Question from '@/models/Question';
import Answer from '@/models/Answer';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    await connectMongoDB();
    const authorId = (session.user as any).id || (session.user as any)._id?.toString();
    const userRole = (session.user as any).role || 'user';
    const isExpertAnswer = userRole === 'expert' || userRole === 'admin' || userRole === 'mod';

    const answer = await Answer.create({
      questionId: params.id,
      authorId,
      content,
      upvotes: [],
      isAccepted: false,
      isExpertAnswer
    });

    // Increment answer count atomically on Question
    await Question.findOneAndUpdate(
      { _id: params.id },
      { $inc: { answerCount: 1 } }
    );

    // Create notification seamlessly if applicable
    try {
      const question = await Question.findById(params.id).lean();
      if (question && question.authorId && question.authorId.toString() !== authorId) {
        const { createNotificationAsync } = await import('@/lib/createNotification');
        createNotificationAsync(
          question.authorId.toString(),
          isExpertAnswer ? 'expert_answer' : 'answer_to_question',
          {
            actor_name: session.user.name || 'Cộng đồng',
            actor_avatar: session.user.image || undefined,
            question_id: params.id,
            question_title: question.title
          },
          authorId,
          'question',
          params.id
        );
      }
    } catch (notifErr) {
      console.error('Notification failed for answer:', notifErr);
    }

    return NextResponse.json(answer);
  } catch (err: any) {
    console.error('Answer POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
