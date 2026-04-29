import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Answer from '@/models/Answer';
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

    const answer = await Answer.findById(params.id);
    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Toggle upvote
    const hasUpvoted = answer.upvotes.includes(authorId);
    if (hasUpvoted) {
      answer.upvotes = answer.upvotes.filter((id: string) => id !== authorId);
    } else {
      answer.upvotes.push(authorId);
    }

    await answer.save();

    return NextResponse.json({ 
      upvoted: !hasUpvoted, 
      upvotesCount: answer.upvotes.length 
    });
  } catch (err: any) {
    console.error('Answer upvote error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
